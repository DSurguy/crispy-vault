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
    use crate::invoke::InvokeError;
    use crate::database::DatabaseState;

    #[tauri::command]
    pub fn create_asset(state: tauri::State<Mutex<DatabaseState>>, name: &str) -> String {
        let uuid = Uuid::new_v4();
        let formatted_uuid = format!("{}", uuid.as_hyphenated());
        let connection = &state.lock().unwrap().connection;
        connection.execute(
            "INSERT INTO asset (name, uuid) VALUES (?1, ?2)",
            (name, format!("{}", formatted_uuid)),
        ).expect("Unable to insert new asset");
        return formatted_uuid;
    }

    #[tauri::command]
    pub fn list_assets(state: tauri::State<Mutex<DatabaseState>>) -> Vec<Asset> {
        let connection = &state.lock().unwrap().connection;
        let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset LIMIT 100").expect("Unable to prepare list_assets SELECT");
        let rows = stmt.query_map((), |row| {
            let name: String = row.get::<usize, String>(1).expect("list_assets::Unable to retrieve name from row");
            let uuid: String = row.get::<usize, String>(2).expect("list_assets::Unable to retrieve uuid from row");

            Ok(Asset {
                name,
                uuid
            })
        }).expect("Unable to execute list_assets query");
        
        let mut output = Vec::new();
        for asset in rows {
            output.push(asset.expect("asset"));
        }
        return output;
    }

    #[tauri::command]
    pub fn get_asset(state: tauri::State<Mutex<DatabaseState>>, uuid: &str) -> Result<Asset, InvokeError> {
        let connection = &state.lock().unwrap().connection;
        let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset WHERE uuid = ?1").expect("Unable to prepare list_assets SELECT");
        let wrapped_rows = stmt.query_map([uuid], |row| {
            let name: String = row.get::<usize, String>(1).expect("list_assets::Unable to retrieve name from row");
            let uuid: String = row.get::<usize, String>(2).expect("list_assets::Unable to retrieve uuid from row");

            Ok(Asset {
                name,
                uuid
            })
        });

        let mut rows = match wrapped_rows {
            Err(_e) => return Err(InvokeError {
                message: "Unable to execute get_asset query".into(),
                status: "500".into()
            }),
            Ok(asset) => asset
        };
        
        let asset_result = match rows.next() {
            None => return Err(InvokeError {
                message: "No assets found matching uuid".into(),
                status: "404".into()
            }),
            Some(v) => v
        };

        let asset = match asset_result {
            Err(_e) => return Err(InvokeError {
                message: "Error unwrapping asset result".into(),
                status: "500".into()
            }),
            Ok(val) => val
        };
        
        return Ok(asset);
    }

    #[tauri::command]
    pub fn add_file_to_asset(
        app_handle: tauri::AppHandle,
        _state: tauri::State<Mutex<DatabaseState>>,
        asset_uuid: &str,
        name: &str,
        description: &str,
        file_path: &str
    ) -> Result<AssetFile, InvokeError> {
        let uuid = Uuid::new_v4().to_string();
        
        // TODO: copy file from path into vault
        let data_dir = app_handle.path_resolver().app_data_dir().expect("Unable to retrieve data dir");
        
        // Create asset dir if not exists
        create_dir_all(data_dir.join(format!("assets/{asset_uuid}"))).expect("Unable to create asset directory");
        
        // Verify file at file_path exists
        let file_meta = match metadata(file_path) {
            Err(_e) => return Err(InvokeError {
                message: "Unable to read metadata of file at file_path".into(),
                status: "400".into()
            }),
            Ok(v) => v
        };

        if file_meta.is_file() == false {
            return Err(InvokeError {
                message: "Given path is not a file".into(),
                status: "400".into()
            });
        }

        // Get extension from file_path
        let extension = match Path::new(file_path).extension() {
            None => return Err(InvokeError {
                message: "Unable to get extension from file".into(),
                status: "500".into()
            }),
            Some(v) => match v.to_str() {
                None => return Err(InvokeError {
                    message: "Unable to get extension from file".into(),
                    status: "500".into()
                }),
                Some(v) => v 
            }
        };

        // Copy the file to uuid.<ext>
        let target_file = format!("assets/{asset_uuid}/{uuid}.{extension}");
        let copy_result = copy(file_path, data_dir.join(target_file));

        match copy_result {
            Err(_e) => return Err(InvokeError {
                message: "Unable to get extension from file".into(),
                status: "500".into()
            }),
            Ok(_v) => {}
        }
        // TODO: Add file to DB

        // TODO: Add entry to intersection table

        return Ok(AssetFile {
            uuid,
            name: name.to_string(),
            description: description.to_string()
        });
    }
}