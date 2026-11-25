use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeSet, HashMap};
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::time::Instant;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

#[derive(Debug, Serialize, Clone)]
pub struct LatexEnvInfo {
    pub available_engines: Vec<String>,
    pub has_biber: bool,
    pub has_latexmk: bool,
    pub engine_paths: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
pub struct BundleFileInput {
    pub path: String,
    pub content_base64: String,
}

#[derive(Debug, Deserialize)]
pub struct CompileRequest {
    pub engine: String,
    pub entry_file: String,
    pub run_biber: bool,
    pub files: Vec<BundleFileInput>,
}

#[derive(Debug, Serialize)]
pub struct CompileResponse {
    pub success: bool,
    pub pdf_base64: Option<String>,
    pub log: String,
    pub errors: Vec<String>,
    pub duration_ms: u64,
    pub engine_used: String,
}

fn new_hidden_command(program: &Path) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    {
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    cmd
}

pub fn resolve_binary(name: &str) -> Option<PathBuf> {
    let exe_name = if cfg!(target_os = "windows") && !name.ends_with(".exe") {
        format!("{name}.exe")
    } else {
        name.to_string()
    };

    if let Ok(path_var) = std::env::var("PATH") {
        for dir in std::env::split_paths(&path_var) {
            let candidate = dir.join(&exe_name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let mut extra_dirs: Vec<PathBuf> = Vec::new();
        if let Ok(local_app) = std::env::var("LOCALAPPDATA") {
            extra_dirs.push(PathBuf::from(local_app).join("Programs\\MiKTeX\\miktex\\bin\\x64"));
        }
        extra_dirs.push(PathBuf::from("C:\\Program Files\\MiKTeX\\miktex\\bin\\x64"));
        extra_dirs.push(PathBuf::from("C:\\Program Files\\MiKTeX 2.9\\miktex\\bin\\x64"));

        if let Ok(entries) = fs::read_dir("C:\\texlive") {
            for entry in entries.flatten() {
                let bin = entry.path().join("bin\\windows");
                if bin.is_dir() {
                    extra_dirs.push(bin);
                }
            }
        }

        for dir in extra_dirs {
            let candidate = dir.join(&exe_name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }

    None
}

pub fn validate_engine(engine: &str) -> Result<&'static str, String> {
    match engine.trim().to_lowercase().as_str() {
        "xelatex" => Ok("xelatex"),
        "lualatex" => Ok("lualatex"),
        "pdflatex" => Ok("pdflatex"),
        other => Err(format!("Unsupported LaTeX engine: {other}")),
    }
}

pub fn sanitize_relative_path(raw: &str) -> Result<PathBuf, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Empty file path".to_string());
    }
    if trimmed.starts_with('/') || trimmed.starts_with('\\') || trimmed.contains(':') {
        return Err(format!("Absolute or drive-qualified path not allowed: {trimmed}"));
    }
    let normalized = trimmed.replace('\\', "/");
    let path = Path::new(&normalized);
    let mut clean = PathBuf::new();
    for comp in path.components() {
        match comp {
            Component::Normal(part) => clean.push(part),
            Component::CurDir => {}
            Component::ParentDir | Component::RootDir | Component::Prefix(_) => {
                return Err(format!("Invalid path traversal component in: {trimmed}"));
            }
        }
    }
    if clean.as_os_str().is_empty() {
        return Err(format!("Invalid relative path: {trimmed}"));
    }
    Ok(clean)
}

pub fn detect_latex_environment_sync() -> LatexEnvInfo {
    let engines = ["xelatex", "lualatex", "pdflatex"];
    let mut available_engines = Vec::new();
    let mut engine_paths = HashMap::new();

    for eng in engines {
        if let Some(p) = resolve_binary(eng) {
            available_engines.push(eng.to_string());
            engine_paths.insert(eng.to_string(), p.to_string_lossy().to_string());
        }
    }

    let biber_path = resolve_binary("biber");
    if let Some(ref p) = biber_path {
        engine_paths.insert("biber".to_string(), p.to_string_lossy().to_string());
    }

    let latexmk_path = resolve_binary("latexmk");
    if let Some(ref p) = latexmk_path {
        engine_paths.insert("latexmk".to_string(), p.to_string_lossy().to_string());
    }

    LatexEnvInfo {
        available_engines,
        has_biber: biber_path.is_some(),
        has_latexmk: latexmk_path.is_some(),
        engine_paths,
    }
}

fn extract_error_lines(log: &str) -> Vec<String> {
    let mut errs = Vec::new();
    for line in log.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("! ")
            || ((trimmed.contains(".tex:")
                || trimmed.contains(".cls:")
                || trimmed.contains(".sty:"))
                && trimmed.to_lowercase().contains("error"))
        {
            if !errs.contains(&trimmed.to_string()) {
                errs.push(trimmed.to_string());
            }
        }
    }
    errs
}

pub fn compile_latex_bundle_sync(req: CompileRequest) -> CompileResponse {
    let start = Instant::now();
    let engine = match validate_engine(&req.engine) {
        Ok(e) => e,
        Err(msg) => {
            return CompileResponse {
                success: false,
                pdf_base64: None,
                log: msg.clone(),
                errors: vec![msg],
                duration_ms: 0,
                engine_used: req.engine,
            };
        }
    };

    let Some(engine_bin) = resolve_binary(engine) else {
        let msg = format!(
            "Binary '{engine}' not found in PATH or standard TeX installations (MiKTeX / TeX Live)."
        );
        return CompileResponse {
            success: false,
            pdf_base64: None,
            log: msg.clone(),
            errors: vec![msg],
            duration_ms: 0,
            engine_used: engine.to_string(),
        };
    };

    let entry_rel = match sanitize_relative_path(&req.entry_file) {
        Ok(p) => p,
        Err(msg) => {
            return CompileResponse {
                success: false,
                pdf_base64: None,
                log: msg.clone(),
                errors: vec![msg],
                duration_ms: 0,
                engine_used: engine.to_string(),
            };
        }
    };

    let build_dir = std::env::temp_dir().join("document-artisan-build");
    if build_dir.exists() {
        let _ = fs::remove_dir_all(&build_dir);
    }
    if let Err(err) = fs::create_dir_all(&build_dir) {
        let msg = format!("Failed to create temp build directory: {err}");
        return CompileResponse {
            success: false,
            pdf_base64: None,
            log: msg.clone(),
            errors: vec![msg],
            duration_ms: start.elapsed().as_millis() as u64,
            engine_used: engine.to_string(),
        };
    }

    for file in &req.files {
        let rel = match sanitize_relative_path(&file.path) {
            Ok(p) => p,
            Err(msg) => {
                return CompileResponse {
                    success: false,
                    pdf_base64: None,
                    log: msg.clone(),
                    errors: vec![msg],
                    duration_ms: start.elapsed().as_millis() as u64,
                    engine_used: engine.to_string(),
                };
            }
        };
        let target = build_dir.join(&rel);
        if let Some(parent) = target.parent() {
            if let Err(err) = fs::create_dir_all(parent) {
                let msg = format!("Failed to create directory for {}: {err}", file.path);
                return CompileResponse {
                    success: false,
                    pdf_base64: None,
                    log: msg.clone(),
                    errors: vec![msg],
                    duration_ms: start.elapsed().as_millis() as u64,
                    engine_used: engine.to_string(),
                };
            }
        }
        let bytes = match BASE64.decode(&file.content_base64) {
            Ok(b) => b,
            Err(err) => {
                let msg = format!("Failed to decode base64 for {}: {err}", file.path);
                return CompileResponse {
                    success: false,
                    pdf_base64: None,
                    log: msg.clone(),
                    errors: vec![msg],
                    duration_ms: start.elapsed().as_millis() as u64,
                    engine_used: engine.to_string(),
                };
            }
        };
        if let Err(err) = fs::write(&target, &bytes) {
            let msg = format!("Failed to write {}: {err}", file.path);
            return CompileResponse {
                success: false,
                pdf_base64: None,
                log: msg.clone(),
                errors: vec![msg],
                duration_ms: start.elapsed().as_millis() as u64,
                engine_used: engine.to_string(),
            };
        }
    }

    let entry_str = entry_rel.to_string_lossy().to_string();
    let stem = entry_rel
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("main")
        .to_string();

    let mut full_log = String::new();

    // Pass 1
    let pass1 = new_hidden_command(&engine_bin)
        .current_dir(&build_dir)
        .args(["-interaction=nonstopmode", "-file-line-error", &entry_str])
        .output();

    let pass1_ok = match pass1 {
        Ok(out) => {
            full_log.push_str(&format!("=== Pass 1 ({engine}) ===\n"));
            full_log.push_str(&String::from_utf8_lossy(&out.stdout));
            if !out.stderr.is_empty() {
                full_log.push_str(&String::from_utf8_lossy(&out.stderr));
            }
            out.status.success()
        }
        Err(err) => {
            let msg = format!("Failed to spawn {engine}: {err}");
            return CompileResponse {
                success: false,
                pdf_base64: None,
                log: msg.clone(),
                errors: vec![msg],
                duration_ms: start.elapsed().as_millis() as u64,
                engine_used: engine.to_string(),
            };
        }
    };

    let bcf_path = build_dir.join(format!("{stem}.bcf"));
    let aux_path = build_dir.join(format!("{stem}.aux"));
    let pdf_path = build_dir.join(format!("{stem}.pdf"));

    if req.run_biber && bcf_path.is_file() {
        if let Some(biber_bin) = resolve_binary("biber") {
            if let Ok(out) = new_hidden_command(&biber_bin)
                .current_dir(&build_dir)
                .arg(&stem)
                .output()
            {
                full_log.push_str("\n=== Biber ===\n");
                full_log.push_str(&String::from_utf8_lossy(&out.stdout));
                if !out.stderr.is_empty() {
                    full_log.push_str(&String::from_utf8_lossy(&out.stderr));
                }
            }
        }
    }

    // Pass 2 when Pass 1 produced an artifact (resolves LastPage, TOC, citations)
    let mut final_ok = pass1_ok;
    if pdf_path.is_file() || aux_path.is_file() {
        if let Ok(out) = new_hidden_command(&engine_bin)
            .current_dir(&build_dir)
            .args(["-interaction=nonstopmode", "-file-line-error", &entry_str])
            .output()
        {
            full_log.push_str(&format!("\n=== Pass 2 ({engine}) ===\n"));
            full_log.push_str(&String::from_utf8_lossy(&out.stdout));
            if !out.stderr.is_empty() {
                full_log.push_str(&String::from_utf8_lossy(&out.stderr));
            }
            final_ok = out.status.success();
        }
    }

    let pdf_base64 = fs::read(&pdf_path).ok().map(|bytes| BASE64.encode(bytes));
    let errors = extract_error_lines(&full_log);
    let success = pdf_base64.is_some() && (final_ok || errors.is_empty());

    CompileResponse {
        success,
        pdf_base64,
        log: full_log,
        errors,
        duration_ms: start.elapsed().as_millis() as u64,
        engine_used: engine.to_string(),
    }
}

pub fn list_system_fonts_sync() -> Vec<String> {
    let mut names = BTreeSet::new();
    let mut dirs: Vec<PathBuf> = Vec::new();

    #[cfg(target_os = "windows")]
    {
        if let Ok(windir) = std::env::var("WINDIR") {
            dirs.push(PathBuf::from(windir).join("Fonts"));
        }
        if let Ok(local_app) = std::env::var("LOCALAPPDATA") {
            dirs.push(PathBuf::from(local_app).join("Microsoft\\Windows\\Fonts"));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        dirs.push(PathBuf::from("/usr/share/fonts"));
        dirs.push(PathBuf::from("/Library/Fonts"));
    }

    for dir in dirs {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
                    let ext_lower = ext.to_lowercase();
                    if ext_lower == "ttf" || ext_lower == "otf" {
                        if let Some(stem) = p.file_stem().and_then(|s| s.to_str()) {
                            names.insert(stem.to_string());
                        }
                    }
                }
            }
        }
    }

    names.into_iter().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_path_traversal_and_absolute_paths() {
        assert!(sanitize_relative_path("../evil.tex").is_err());
        assert!(sanitize_relative_path("fonts/../../evil.ttf").is_err());
        assert!(sanitize_relative_path("/etc/passwd").is_err());
        assert!(sanitize_relative_path("C:\\Windows\\win.ini").is_err());
        assert!(sanitize_relative_path("").is_err());

        assert_eq!(
            sanitize_relative_path("fonts/MyFont.ttf").unwrap(),
            PathBuf::from("fonts/MyFont.ttf")
        );
        assert_eq!(sanitize_relative_path("main.tex").unwrap(), PathBuf::from("main.tex"));
    }

    #[test]
    fn validates_allowed_latex_engines_only() {
        assert_eq!(validate_engine("xelatex").unwrap(), "xelatex");
        assert_eq!(validate_engine("LuaLaTeX").unwrap(), "lualatex");
        assert_eq!(validate_engine("pdflatex").unwrap(), "pdflatex");
        assert!(validate_engine("bash").is_err());
        assert!(validate_engine("xelatex && calc").is_err());
    }
}
