// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::Path, sync::Mutex};

use rusqlite::Connection;
use tauri::{App, Manager};
use uuid::Uuid;

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
        .invoke_handler(tauri::generate_handler![create_asset])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
