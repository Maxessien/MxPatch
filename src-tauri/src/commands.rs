use std::io::{ErrorKind, Write};

use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::{FilePath, FsExt, OpenOptions};

#[tauri::command]
pub fn patch_bins(app: AppHandle, patch: FilePath, old: FilePath) -> Result<(), String> {
    let patch_bin = match app.fs().read(patch) {
        Ok(v) => v,
        Err(err) => {
            return match err.kind() {
                ErrorKind::NotFound => Err("File patch not found".to_string()),
                _ => Err("Couldn't open patch file".to_string()),
            };
        }
    };
    let old_bin = match app.fs().read(old) {
        Ok(v) => v,
        Err(err) => {
            return match err.kind() {
                ErrorKind::NotFound => Err("File not found".to_string()),
                _ => Err("Couldn't open file".to_string()),
            };
        }
    };

    let mut patched = Vec::<u8>::new();

    match bsdiff_android::apply_bsdf2_patch(&old_bin, &patch_bin, &mut patched) {
        Ok(_) => (),
        Err(_) => return Err("Failed to patch file".to_string()),
    };

    app.dialog()
        .file()
        .save_file(move |file_path| match file_path {
            Some(p) => match app.fs().open(p, OpenOptions::default()) {
                Ok(f) => {
                    let mut file = f;
                    match file.write_all(&patched) {
                        Ok(_) => (),
                        Err(_) => (),
                    }
                }
                Err(_) => (),
            },
            None => (),
        });
    Ok(())
}
