use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::sync::Mutex;
use uuid::Uuid;

fn _create_asset(
    state: tauri::State<Mutex<DatabaseState>>,
    name: &str,
) -> anyhow::Result<String> {
    let uuid = Uuid::new_v4();
    let formatted_uuid = format!("{}", uuid.as_hyphenated());
    let connection = &state.lock().unwrap().connection;
    connection.execute(
        "INSERT INTO asset (name, uuid, last_update) VALUES (?1, ?2, datetime('now'))",
        (name, format!("{}", formatted_uuid)),
    )?;
    return Ok(formatted_uuid);
}

#[tauri::command]
pub fn create_asset(
    state: tauri::State<Mutex<DatabaseState>>,
    name: &str,
) -> anyhow_tauri::TAResult<String> {
    let out = _create_asset(state, name)?;
    return Ok(out);
}