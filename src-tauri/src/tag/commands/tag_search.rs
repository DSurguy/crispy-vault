use crate::database::DatabaseState;
use anyhow;
use anyhow_tauri;
use rusqlite::{params, types::Value};
use std::{rc::Rc, sync::Mutex};

fn _tag_search(
    state: tauri::State<Mutex<DatabaseState>>,
    search: &str,
    existing_tags: Vec<String>
) -> anyhow::Result<Vec<String>> {
    let connection = &state.lock().unwrap().connection;
    let mut stmt = connection
        .prepare("SELECT text FROM tag_fts WHERE text MATCH ?1 AND NOT IN rarray(?2) ORDER BY rank LIMIT 20");
    let existing_tags_vec = Rc::new(existing_tags.into_iter().map(Value::from).collect::<Vec<Value>>());
    let rows = stmt.query_map(params![&search, &existing_tags_vec], |row| {
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
    search: &str,
    existing_tags: Vec<String>
) -> anyhow_tauri::TAResult<Vec<String>> {
    let out = _tag_search(state, search, existing_tags)?;
    return Ok(out);
}