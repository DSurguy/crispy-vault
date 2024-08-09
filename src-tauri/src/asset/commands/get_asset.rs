use super::super::Asset;
use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::sync::Mutex;

fn _get_asset(state: tauri::State<Mutex<DatabaseState>>, uuid: &str) -> anyhow::Result<Asset> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset WHERE uuid = ?1")?;
    let mut rows = stmt.query_map([uuid], |row| {
        let name: String = row.get::<usize, String>(1)?;
        let uuid: String = row.get::<usize, String>(2)?;

        Ok(Asset { name, uuid })
    })?;

    let asset = rows.next().unwrap()?;

    return Ok(asset);
}

#[tauri::command]
pub fn get_asset(
    state: tauri::State<Mutex<DatabaseState>>,
    uuid: &str,
) -> anyhow_tauri::TAResult<Asset> {
    let out = _get_asset(state, uuid)?;

    return Ok(out);
}