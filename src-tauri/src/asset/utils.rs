use super::AssetFile;
use crate::database::DatabaseState;
use anyhow;
use std::sync::Mutex;

pub fn get_file_asset_from_db(
    state: &tauri::State<Mutex<DatabaseState>>,
    file_uuid: &str
) -> anyhow::Result<AssetFile> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection.prepare("SELECT name, description, extension FROM asset_file WHERE uuid = ?1")?;
    let mut rows = stmt.query_map([file_uuid], |row| {
        let name: String = row.get::<usize, String>(1)?;
        let description: String = row.get::<usize, String>(2)?;
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