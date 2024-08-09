use super::super::AssetFile;
use super::super::utils::get_file_asset_from_db;
use crate::database::DatabaseState;
use anyhow;
use std::fs::{copy, remove_file};
use std::path::Path;
use std::sync::Mutex;
use tauri::Manager;

fn replace_file(
    app_handle: tauri::AppHandle,
    state: &tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    file_uuid: &str,
    name: &str,
    description: &str,
    file_path: Option<&str>,
) -> anyhow::Result<()> {
    // Remove existing file before copy
    let existing_file = get_file_asset_from_db(state, file_uuid)?;
    let existing_file_extension = existing_file.extension;
    let data_dir = app_handle.path().app_data_dir()?;
    let file_to_remove = format!("assets/{asset_uuid}/{file_uuid}.{existing_file_extension}");
    remove_file(data_dir.join(file_to_remove))?;

    // Get extension from file_path
    let some_file_path = file_path.unwrap();
    let extension = Path::new(some_file_path)
        .extension()
        .ok_or(anyhow::anyhow!("Unable to get extension"))?
        .to_str()
        .ok_or(anyhow::anyhow!("Unable to convert extension to string"))?;

    // Copy the file to uuid.<ext>
    let target_file = format!("assets/{asset_uuid}/{file_uuid}.{extension}");
    copy(some_file_path, data_dir.join(target_file))?;

    let connection = &state.lock().unwrap().connection;
    connection.execute("UPDATE asset_file SET \
        name = ?1, \
        description = ?2, \
        extension = ?3, \
        last_update = datetime('now') \
        WHERE uuid = ?4
    ", [name, description, extension, file_uuid])?;

    Ok(())
}

fn edit_file(
    state: &tauri::State<Mutex<DatabaseState>>,
    file_uuid: &str,
    name: &str,
    description: &str
) -> anyhow::Result<()> {
    let connection = &state.lock().unwrap().connection;
    connection.execute("UPDATE asset_file SET \
        name = ?1, \
        description = ?2, \
        last_update = datetime('now') \
        WHERE uuid = ?3 \
    ", [name, description, file_uuid])?;

    Ok(())
}

fn _edit_asset_file(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    file_uuid: &str,
    name: &str,
    description: &str,
    file_path: Option<&str>,
) -> anyhow::Result<AssetFile> {
    if file_path.is_some() {
        replace_file(app_handle, &state, asset_uuid, file_uuid, name, description, file_path)?;
    }
    else {
        edit_file(&state, file_uuid, name, description)?;
    }

    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection.prepare("SELECT name, description, extension FROM asset_file WHERE uuid = ?1")?;
    let mut rows = stmt.query_map([file_uuid], |row| {
        let name: String = row.get::<usize, String>(0)?;
        let description: String = row.get::<usize, String>(1)?;
        let extension: String = row.get::<usize, String>(2)?;

        Ok(AssetFile {
            uuid: file_uuid.to_owned(),
            name,
            description,
            extension
        })
    })?;

    let file = rows.next().unwrap()?;

    return Ok(file);
}

#[tauri::command]
pub fn edit_asset_file(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    file_uuid: &str,
    name: &str,
    description: &str,
    file_path: Option<&str>,
) -> anyhow_tauri::TAResult<AssetFile> {
    let out = _edit_asset_file(app_handle, state, asset_uuid, file_uuid, name, description, file_path)?;
    return Ok(out);
}