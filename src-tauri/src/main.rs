// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::Path};

use rusqlite::Connection;
use tauri::App;

fn recreate_database(app: &App) {
    let data_dir = app.path_resolver().app_data_dir().expect("Unable to retrieve data dir");
    let db_path = data_dir.join("test-database.db");
    let resolved_db_path = Path::new(&db_path);
    let db_exists = resolved_db_path.exists();
    if db_exists {
        fs::remove_file(&db_path).expect("Unable to remove database file");
        // TODO: May need to wait for file to not exist in case of async removal
    }
    let db_connection = Connection::open(&db_path).expect("Unable to get database connection");
    let db_source_path = app.path_resolver().resolve_resource("resources/sqlite-setup.sql").expect("Unable to find db source file");
    let contents = fs::read_to_string(&db_source_path)
        .expect("Should have been able to read the file");
    db_connection.execute_batch(&contents).expect("Unable to bootstrap database");
}   

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            recreate_database(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
