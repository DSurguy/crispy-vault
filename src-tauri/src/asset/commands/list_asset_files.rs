use super::super::AssetFile;
use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::sync::Mutex;

fn _list_asset_files(
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    page: u32,
) -> anyhow::Result<Vec<AssetFile>> {
    let offset: u32 = page * 20;
    let offset_param: &str = &offset.to_string();
    let connection = &state.lock().unwrap().connection;

    let mut stmt = connection.prepare("\
        SELECT uuid, name, description, extension \
        FROM asset_file \
        INNER JOIN asset_to_asset_file aaf ON asset_file.uuid = aaf.asset_file_id AND aaf.asset_id = ?1 \
        ORDER BY last_update DESC \
        LIMIT 20 OFFSET ?2
    ")?;

    let rows = stmt.query_map([asset_uuid, offset_param], |row| {
        let uuid: String = row.get(0)?;
        let name: String = row.get(1)?;
        let description: String = row.get(2)?;
        let extension: String = row.get(3)?;

        Ok(AssetFile {
            uuid,
            name,
            description,
            extension,
        })
    })?;

    let mut out = Vec::<AssetFile>::new();

    for file in rows {
        out.push(file?);
    }

    Ok(out)
}

#[tauri::command]
pub fn list_asset_files(
    state: tauri::State<Mutex<DatabaseState>>,
    asset_uuid: &str,
    page: u32,
) -> anyhow_tauri::TAResult<Vec<AssetFile>> {
    let out = _list_asset_files(state, asset_uuid, page)?;
    return Ok(out);
}