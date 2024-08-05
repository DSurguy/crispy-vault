use serde::Serialize;

#[derive(Serialize)]
pub struct Asset {
    pub name: String,
    pub uuid: String
}

#[derive(Serialize)]
pub struct AssetFile {
    pub name: String,
    pub uuid: String,
    pub description: String
}

pub mod commands {
    use std::fs::{copy, create_dir_all, metadata};
    use std::path::Path;
    use std::sync::Mutex;
    use uuid::Uuid;
    use super::{Asset, AssetFile};
    use crate::database::DatabaseState;
    use anyhow_tauri;
    use anyhow;

    fn _create_asset(state: tauri::State<Mutex<DatabaseState>>, name: &str) -> anyhow::Result<String> {
        let uuid = Uuid::new_v4();
        let formatted_uuid = format!("{}", uuid.as_hyphenated());
        let connection = &state.lock().unwrap().connection;
        connection.execute(
            "INSERT INTO asset (name, uuid) VALUES (?1, ?2)",
            (name, format!("{}", formatted_uuid)),
        )?;
        return Ok(formatted_uuid);
    }

    #[tauri::command]
    pub fn create_asset(state: tauri::State<Mutex<DatabaseState>>, name: &str) -> anyhow_tauri::TAResult<String> {
        let out = _create_asset(state, name)?;
        return Ok(out);
    }

    fn _list_assets(state: tauri::State<Mutex<DatabaseState>>) -> anyhow::Result<Vec<Asset>> {
        let connection = &state.lock().unwrap().connection;
        let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset LIMIT 100").expect("Unable to prepare list_assets SELECT");
        let rows = stmt.query_map((), |row| {
            let name: String = row.get::<usize, String>(1)?;
            let uuid: String = row.get::<usize, String>(2)?;

            Ok(Asset {
                name,
                uuid
            })
        })?;
        
        let mut output = Vec::new();
        for asset in rows {
            output.push(asset?);
        }
        return Ok(output);
    }

    #[tauri::command]
    pub fn list_assets(state: tauri::State<Mutex<DatabaseState>>) -> anyhow_tauri::TAResult<Vec<Asset>> {
        let out = _list_assets(state)?;
        return Ok(out);
    }

    fn _get_asset(state: tauri::State<Mutex<DatabaseState>>, uuid: &str) -> anyhow::Result<Asset> {
        let connection = &state.lock().unwrap().connection;
        let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset WHERE uuid = ?1")?;
        let mut rows = stmt.query_map([uuid], |row| {
            let name: String = row.get::<usize, String>(1)?;
            let uuid: String = row.get::<usize, String>(2)?;

            Ok(Asset {
                name,
                uuid
            })
        })?;
        
        let asset = rows.next().unwrap()?;

        return Ok(asset);
    }
    
    #[tauri::command]
    pub fn get_asset(state: tauri::State<Mutex<DatabaseState>>, uuid: &str) -> anyhow_tauri::TAResult<Asset> {
        let out = _get_asset(state, uuid)?;
        
        return Ok(out);
    }

    fn _add_file_to_asset(
        app_handle: tauri::AppHandle,
        state: tauri::State<Mutex<DatabaseState>>,
        asset_uuid: &str,
        name: &str,
        description: &str,
        file_path: &str
    ) -> anyhow::Result<AssetFile> {
        let uuid = Uuid::new_v4().to_string();
        
        // TODO: copy file from path into vault
        let data_dir = app_handle.path_resolver().app_data_dir().unwrap();
        
        // Create asset dir if not exists
        create_dir_all(data_dir.join(format!("assets/{asset_uuid}")))?;
        
        // Verify file at file_path exists
        let file_meta = metadata(file_path)?;

        if file_meta.is_file() == false {
            return Err(anyhow::anyhow!("Not file"));
        }

        // Get extension from file_path
        let extension = Path::new(file_path).extension().ok_or(anyhow::anyhow!("Unable to get extension"))?.to_str().ok_or(anyhow::anyhow!("Unable to convert extension to string"))?;

        // Copy the file to uuid.<ext>
        let target_file = format!("assets/{asset_uuid}/{uuid}.{extension}");
        copy(file_path, data_dir.join(target_file))?;

        // Add the file to the DB (and link with asset)
        let connection = &mut state.lock().unwrap().connection;
        let tx = connection.transaction()?;
        tx.execute("INSERT INTO asset_file ( \
            uuid, \
            name, \
            description \
        ) VALUES ( \
            ?1, \
            ?2, \
            ?3 \
        );", [&uuid, name, description])?;

        tx.execute("INSERT INTO asset_to_asset_file ( \
            asset_id, \
            asset_file_id \
        ) VALUES ( \
            ?1, \
            ?2 \
        );", [asset_uuid, &uuid])?;

        tx.commit()?;

        return Ok(AssetFile {
            uuid,
            name: name.to_string(),
            description: description.to_string()
        });
    }

    #[tauri::command]
    pub fn add_file_to_asset(
        app_handle: tauri::AppHandle,
        state: tauri::State<Mutex<DatabaseState>>,
        asset_uuid: &str,
        name: &str,
        description: &str,
        file_path: &str
    ) -> anyhow_tauri::TAResult<AssetFile> {
        let out = _add_file_to_asset(app_handle, state, asset_uuid, name, description, file_path)?;
        return Ok(out);
    }
}