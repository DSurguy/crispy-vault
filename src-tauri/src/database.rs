use rusqlite::Connection;

pub struct DatabaseState {
    pub connection: Connection,
}

impl DatabaseState {
    pub fn new(connection: Connection) -> Self {
        Self { connection }
    }
}
