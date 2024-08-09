use super::super::Asset;
use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::sync::Mutex;

fn _list_assets(state: tauri::State<Mutex<DatabaseState>>) -> anyhow::Result<Vec<Asset>> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection
        .prepare("SELECT rowid, name, uuid FROM asset LIMIT 20")
        .expect("Unable to prepare list_assets SELECT");
    let rows = stmt.query_map((), |row| {
        let name: String = row.get::<usize, String>(1)?;
        let uuid: String = row.get::<usize, String>(2)?;

        Ok(Asset { name, uuid })
    })?;

    let mut output = Vec::new();
    for asset in rows {
        output.push(asset?);
    }
    return Ok(output);
}

#[tauri::command]
pub fn list_assets(
    state: tauri::State<Mutex<DatabaseState>>,
) -> anyhow_tauri::TAResult<Vec<Asset>> {
    let out = _list_assets(state)?;
    return Ok(out);
}