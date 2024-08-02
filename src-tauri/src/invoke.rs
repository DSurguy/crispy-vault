use serde::Serialize;

#[derive(Serialize)]
pub struct InvokeError {
    pub message: String,
    pub status: String
}