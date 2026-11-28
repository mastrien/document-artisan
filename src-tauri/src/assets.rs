use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

use crate::latex::sanitize_relative_path;

fn assets_root_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {e}"))?;
    let root = base.join("workspace-assets");
    fs::create_dir_all(&root)
        .map_err(|e| format!("Failed to create workspace-assets directory: {e}"))?;
    Ok(root)
}

pub fn save_asset_to_root(root: &Path, rel_path: &str, content_base64: &str) -> Result<(), String> {
    let clean = sanitize_relative_path(rel_path)?;
    let bytes = BASE64
        .decode(content_base64)
        .map_err(|e| format!("Invalid base64 payload for {rel_path}: {e}"))?;
    let target = root.join(clean);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create asset directory: {e}"))?;
    }
    fs::write(&target, bytes).map_err(|e| format!("Failed to write asset: {e}"))
}

pub fn load_asset_from_root(root: &Path, rel_path: &str) -> Result<Option<String>, String> {
    let clean = sanitize_relative_path(rel_path)?;
    let target = root.join(clean);
    if !target.is_file() {
        return Ok(None);
    }
    let bytes = fs::read(&target).map_err(|e| format!("Failed to read asset: {e}"))?;
    Ok(Some(BASE64.encode(bytes)))
}

pub fn delete_asset_from_root(root: &Path, rel_path: &str) -> Result<(), String> {
    let clean = sanitize_relative_path(rel_path)?;
    let target = root.join(clean);
    if target.is_file() {
        fs::remove_file(&target).map_err(|e| format!("Failed to delete asset: {e}"))?;
    }
    Ok(())
}

fn collect_relative_files(base: &Path, current: &Path, out: &mut Vec<String>) -> Result<(), String> {
    if !current.is_dir() {
        return Ok(());
    }
    for entry in fs::read_dir(current).map_err(|e| format!("Failed to read asset dir: {e}"))? {
        let entry = entry.map_err(|e| format!("Failed to inspect asset entry: {e}"))?;
        let path = entry.path();
        if path.is_dir() {
            collect_relative_files(base, &path, out)?;
        } else if path.is_file() {
            if let Ok(rel) = path.strip_prefix(base) {
                out.push(rel.to_string_lossy().replace('\\', "/"));
            }
        }
    }
    Ok(())
}

pub fn list_assets_in_root(root: &Path) -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    collect_relative_files(root, root, &mut files)?;
    files.sort();
    Ok(files)
}

#[tauri::command]
pub async fn save_local_asset(
    app: AppHandle,
    rel_path: String,
    content_base64: String,
) -> Result<(), String> {
    let root = assets_root_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        save_asset_to_root(&root, &rel_path, &content_base64)
    })
    .await
    .map_err(|e| format!("Asset save worker panicked: {e}"))?
}

#[tauri::command]
pub async fn load_local_asset(app: AppHandle, rel_path: String) -> Result<Option<String>, String> {
    let root = assets_root_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || load_asset_from_root(&root, &rel_path))
        .await
        .map_err(|e| format!("Asset load worker panicked: {e}"))?
}

#[tauri::command]
pub async fn delete_local_asset(app: AppHandle, rel_path: String) -> Result<(), String> {
    let root = assets_root_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || delete_asset_from_root(&root, &rel_path))
        .await
        .map_err(|e| format!("Asset delete worker panicked: {e}"))?
}

#[tauri::command]
pub async fn list_local_assets(app: AppHandle) -> Result<Vec<String>, String> {
    let root = assets_root_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || list_assets_in_root(&root))
        .await
        .map_err(|e| format!("Asset list worker panicked: {e}"))?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn make_temp_root(label: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("da-assets-{label}-{nanos}"));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn round_trips_and_lists_assets_safely() {
        let root = make_temp_root("roundtrip");
        let payload = BASE64.encode(b"hello-font-bytes");
        save_asset_to_root(&root, "fonts/my-font.ttf", &payload).unwrap();

        let listed = list_assets_in_root(&root).unwrap();
        assert_eq!(listed, vec!["fonts/my-font.ttf".to_string()]);

        let loaded = load_asset_from_root(&root, "fonts/my-font.ttf").unwrap();
        assert_eq!(loaded, Some(payload));

        delete_asset_from_root(&root, "fonts/my-font.ttf").unwrap();
        let after_delete = load_asset_from_root(&root, "fonts/my-font.ttf").unwrap();
        assert_eq!(after_delete, None);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_path_traversal_on_all_asset_ops() {
        let root = make_temp_root("traversal");
        let payload = BASE64.encode(b"bad");
        assert!(save_asset_to_root(&root, "../evil.ttf", &payload).is_err());
        assert!(load_asset_from_root(&root, "/etc/passwd").is_err());
        assert!(delete_asset_from_root(&root, "C:\\Windows\\system32").is_err());
        let _ = fs::remove_dir_all(&root);
    }
}
