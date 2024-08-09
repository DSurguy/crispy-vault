use super::super::AssetFile;
use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::fs::{copy, create_dir_all, metadata};
use std::path::Path;
use std::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;

fn _add_file_to_asset(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    name: &str,
    description: &str,
    file_path: &str,
) -> anyhow::Result<AssetFile> {
    let uuid = Uuid::new_v4().to_string();

    let data_dir = app_handle.path().app_data_dir()?;

    // Create asset dir if not exists
    create_dir_all(data_dir.join(format!("assets/{asset_uuid}")))?;

    // Verify file at file_path exists
    let file_meta = metadata(file_path)?;

    if file_meta.is_file() == false {
        return Err(anyhow::anyhow!("Not file"));
    }

    // Get extension from file_path
    let extension = Path::new(file_path)
        .extension()
        .ok_or(anyhow::anyhow!("Unable to get extension"))?
        .to_str()
        .ok_or(anyhow::anyhow!("Unable to convert extension to string"))?;

    // Copy the file to uuid.<ext>
    let target_file = format!("assets/{asset_uuid}/{uuid}.{extension}");
    copy(file_path, data_dir.join(target_file))?;

    // Add the file to the DB (and link with asset)
    let connection = &mut state.lock().unwrap().connection;
    let tx = connection.transaction()?;
    tx.execute(
        "INSERT INTO asset_file ( \
        uuid, \
        name, \
        description, \
        extension, \
        last_update \
    ) VALUES ( \
        ?1, \
        ?2, \
        ?3, \
        ?4, \
        datetime('now')
    );",
        [&uuid, name, description, extension],
    )?;

    tx.execute(
        "INSERT INTO asset_to_asset_file ( \
        asset_id, \
        asset_file_id \
    ) VALUES ( \
        ?1, \
        ?2 \
    );",
        [asset_uuid, &uuid],
    )?;

    tx.commit()?;

    return Ok(AssetFile {
        uuid,
        name: name.to_string(),
        description: description.to_string(),
        extension: extension.to_string(),
    });
}

#[tauri::command]
pub fn add_file_to_asset(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    name: &str,
    description: &str,
    file_path: &str,
) -> anyhow_tauri::TAResult<AssetFile> {
    let out = _add_file_to_asset(app_handle, state, asset_uuid, name, description, file_path)?;
    return Ok(out);
}