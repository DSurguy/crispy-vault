use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use std::sync::Mutex;

fn _tag_search(
    state: tauri::State<Mutex<DatabaseState>>,
    search: &str
) -> anyhow::Result<Vec<String>> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection
        .prepare("SELECT text FROM tag_fts WHERE text MATCH ?1 ORDER BY rank LIMIT 20")?;
    let rows = stmt.query_map([search], |row| {
        let text: String = row.get::<usize, String>(0)?;

        Ok(text)
    })?;

    let mut output = Vec::new();
    for tag in rows {
        output.push(tag?);
    }
    return Ok(output);
}

#[tauri::command]
pub fn tag_search(
    state: tauri::State<Mutex<DatabaseState>>,
    search: &str
) -> anyhow_tauri::TAResult<Vec<String>> {
    let out = _tag_search(state, search)?;
    return Ok(out);
}