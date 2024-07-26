// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::Path, sync::Mutex};

use rusqlite::{Connection};
use serde::Serialize;
use tauri::{App, Manager};
use uuid::{Uuid};

struct DatabaseState {
    connection: Connection
}

impl DatabaseState {
    fn new(connection: Connection) -> Self {
        Self {
            connection
        }
    }
}

#[derive(Serialize)]
struct InvokeError {
    message: String,
    status: String
}

#[derive(Serialize)]
struct Asset {
    #[serde(skip_serializing)]
    rowid: u64,
    name: String,
    uuid: String
}

#[tauri::command]
fn create_asset(state: tauri::State<Mutex<DatabaseState>>, name: &str) -> String {
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
fn list_assets(state: tauri::State<Mutex<DatabaseState>>) -> Vec<Asset> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset LIMIT 100").expect("Unable to prepare list_assets SELECT");
    let rows = stmt.query_map((), |row| {
        let rowid: u64 = row.get::<usize, u64>(0).expect("list_assets::Unable to retrieve rowid from row");
        let name: String = row.get::<usize, String>(1).expect("list_assets::Unable to retrieve name from row");
        let uuid: String = row.get::<usize, String>(2).expect("list_assets::Unable to retrieve uuid from row");

        Ok(Asset {
            rowid,
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
fn get_asset(state: tauri::State<Mutex<DatabaseState>>, uuid: &str) -> Result<Asset, InvokeError> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection.prepare("SELECT rowid, name, uuid FROM asset WHERE uuid = ?1").expect("Unable to prepare list_assets SELECT");
    let wrapped_rows = stmt.query_map([uuid], |row| {
        let rowid: u64 = row.get::<usize, u64>(0).expect("list_assets::Unable to retrieve rowid from row");
        let name: String = row.get::<usize, String>(1).expect("list_assets::Unable to retrieve name from row");
        let uuid: String = row.get::<usize, String>(2).expect("list_assets::Unable to retrieve uuid from row");

        Ok(Asset {
            rowid,
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


fn recreate_database(app: &App) -> Connection {
    let data_dir = app.path_resolver().app_data_dir().expect("Unable to retrieve data dir");
    let db_path = data_dir.join("test-database.db");
    let resolved_db_path = Path::new(&db_path);
    let db_exists = resolved_db_path.exists();
    if db_exists {
        fs::remove_file(&db_path).expect("Unable to remove database file");
        // TODO: May need to wait for file to not exist in case of async removal
    }
    let db_connection = Connection::open(&db_path).expect("Unable to get database connection");
    let db_source_path = app.path_resolver().resolve_resource("resources/sqlite-setup.sql").expect("Unable to fin   d db source file");
    let contents = fs::read_to_string(&db_source_path)
        .expect("Should have been able to read the file");
    db_connection.execute_batch(&contents).expect("Unable to bootstrap database");
    return db_connection;
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let db_connection = recreate_database(app);
            app.manage(Mutex::new(DatabaseState::new(db_connection)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_asset, get_asset, list_assets])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
