// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::{self, remove_dir_all}, path::Path, sync::Mutex};

use rusqlite::Connection;
use tauri::{App, Manager};

pub mod asset;
pub mod database;
pub mod invoke;

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
    let db_source_path = app.path_resolver().resolve_resource("resources/sqlite-setup.sql").expect("Unable to find db source file");
    let contents = fs::read_to_string(&db_source_path)
        .expect("Should have been able to read the file");
    db_connection.execute_batch(&contents).expect("Unable to bootstrap database");
    return db_connection;
}

fn clean_assets_dir(app: &App) {
    let data_dir = app.path_resolver().app_data_dir().expect("Unable to retrieve data dir");
    let asset_path = data_dir.join("assets");
    if fs::metadata(asset_path).is_ok() {
        remove_dir_all(data_dir.join("assets")).expect("Unable to remove assets directory");
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            clean_assets_dir(app);
            let db_connection = recreate_database(app);
            app.manage(Mutex::new(database::DatabaseState::new(db_connection)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            asset::commands::create_asset,
            asset::commands::get_asset,
            asset::commands::list_assets,
            asset::commands::add_file_to_asset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
