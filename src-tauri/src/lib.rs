mod latex;

use latex::{
    compile_latex_bundle_sync, detect_latex_environment_sync, list_system_fonts_sync,
    CompileRequest, CompileResponse, LatexEnvInfo,
};

#[tauri::command]
async fn detect_latex_environment() -> LatexEnvInfo {
    tauri::async_runtime::spawn_blocking(detect_latex_environment_sync)
        .await
        .unwrap_or_else(|_| LatexEnvInfo {
            available_engines: Vec::new(),
            has_biber: false,
            has_latexmk: false,
            engine_paths: Default::default(),
        })
}

#[tauri::command]
async fn compile_latex_bundle(req: CompileRequest) -> CompileResponse {
    tauri::async_runtime::spawn_blocking(move || compile_latex_bundle_sync(req))
        .await
        .unwrap_or_else(|e| CompileResponse {
            success: false,
            pdf_base64: None,
            log: format!("Compilation worker panicked: {e}"),
            errors: vec![format!("Compilation worker panicked: {e}")],
            duration_ms: 0,
            engine_used: String::new(),
        })
}

#[tauri::command]
async fn list_system_fonts() -> Vec<String> {
    tauri::async_runtime::spawn_blocking(list_system_fonts_sync)
        .await
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect_latex_environment,
            compile_latex_bundle,
            list_system_fonts
        ])
        .run(tauri::generate_context!())
        .expect("error while running Document Artisan Tauri application");
}
