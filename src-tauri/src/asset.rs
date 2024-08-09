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

pub mod commands;
pub mod utils;