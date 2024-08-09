use super::super::utils::get_file_asset_from_db;
use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::fs::remove_file;
use std::sync::Mutex;
use tauri::Manager;

fn _delete_asset_file(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    file_uuid: &str,
) -> anyhow::Result<()> {

    // get extension from DB before delete
    let existing_file = get_file_asset_from_db(&state, file_uuid)?;
    let file_extension = existing_file.extension;
    let data_dir = app_handle.path().app_data_dir()?;
    let file_to_remove = format!("assets/{asset_uuid}/{file_uuid}.{file_extension}");

    let mut_connection = &mut state.lock().unwrap().connection;
    let tx = mut_connection.transaction()?;
    
    tx.execute("DELETE FROM asset_to_asset_file WHERE asset_file_id = ?1", [file_uuid])?;
    tx.execute(
        "DELETE FROM asset_file WHERE uuid = ?1",
        [file_uuid],
    )?;
    tx.commit()?;

    remove_file(data_dir.join(file_to_remove))?;

    return Ok(())
}

#[tauri::command]
pub fn delete_asset_file(
    app_handle: tauri::AppHandle,
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    file_uuid: &str,
) -> anyhow_tauri::TAResult<()> {
    let out = _delete_asset_file(app_handle, state, asset_uuid, file_uuid)?;
    return Ok(out)
}