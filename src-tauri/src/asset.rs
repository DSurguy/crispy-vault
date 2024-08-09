use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct Asset {
    pub name: String,
    pub uuid: String,
}

#[derive(Serialize, Clone)]
pub struct AssetFile {
    pub name: String,
    pub uuid: String,
    pub description: String,
    pub extension: String,
}

pub mod commands {
    use super::{Asset, AssetFile};
    use crate::database::DatabaseState;
    use anyhow;
    use anyhow_tauri;
    use rusqlite::Connection;
    use std::fs::{copy, create_dir_all, metadata, remove_file};
    use std::path::Path;
    use std::sync::Mutex;
    use tauri::Manager;
    use uuid::Uuid;

    fn get_file_asset_from_db(
        connection: &Connection,
        file_uuid: &str
    ) -> anyhow::Result<AssetFile> {
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

    fn _edit_asset_file(
        app_handle: tauri::AppHandle,
        state: tauri::State<Mutex<DatabaseState>>,
        asset_uuid: &str,
        file_uuid: &str,
        name: &str,
        description: &str,
        file_path: Option<&str>,
    ) -> anyhow::Result<AssetFile> {
        let connection = &state.lock().unwrap().connection;
        let mut raw_statement = String::from("UPDATE asset_file SET \
            name = ?1, \
            description = ?2, \
            last_update = datetime('now')");
        
        if file_path.is_some() {
            // Remove existing file before copy
            let existing_file = get_file_asset_from_db(connection, file_uuid)?;
            let existing_file_extension = existing_file.extension;
            let data_dir = app_handle.path().app_data_dir()?;
            let file_to_remove = format!("assets/{asset_uuid}/{file_uuid}.{existing_file_extension}");
            remove_file(file_to_remove)?;

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

            raw_statement.push_str(", extension = ?3 WHERE uuid = ?4");
            connection.execute(raw_statement.as_str(), [name, description, extension, file_uuid])?;
        }
        else {
            raw_statement.push_str(" WHERE uuid = ?3");
            connection.execute(raw_statement.as_str(), [name, description, file_uuid])?;
        }

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

    fn _delete_asset_file(
        app_handle: tauri::AppHandle,
        state: tauri::State<Mutex<DatabaseState>>,
        asset_uuid: &str,
        file_uuid: &str,
    ) -> anyhow::Result<()> {
        let connection = &state.lock().unwrap().connection;

        // get extension from DB before delete
        let existing_file = get_file_asset_from_db(connection, file_uuid)?;
        let file_extension = existing_file.extension;
        let data_dir = app_handle.path().app_data_dir()?;
        let file_to_remove = format!("assets/{asset_uuid}/{file_uuid}.{file_extension}");

        connection.execute(
            "DELETE FROM asset_file WHERE uuid = ?1",
            [file_uuid],
        )?;

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
}
