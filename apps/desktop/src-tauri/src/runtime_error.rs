use serde::Serialize;
use std::fmt::{Display, Formatter};

/// Desktop runtime error returned to the React layer.
///
/// The value intentionally carries a stable code so the frontend can show a friendly message.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeError {
    /// Stable error code for user-facing fallback and logs.
    pub code: &'static str,
    /// Human-readable detail that avoids sensitive runtime state.
    pub message: String,
}

impl RuntimeError {
    /// Creates a runtime error with a stable code and concise message.
    ///
    /// Precondition: `code` must be stable enough for frontend mapping. Postcondition: returns
    /// an error that can be serialized by Tauri commands.
    pub fn new(code: &'static str, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }
}

impl Display for RuntimeError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{}: {}", self.code, self.message)
    }
}

impl std::error::Error for RuntimeError {}

impl From<std::io::Error> for RuntimeError {
    fn from(error: std::io::Error) -> Self {
        Self::new("RUNTIME_IO_ERROR", error.to_string())
    }
}

impl From<serde_json::Error> for RuntimeError {
    fn from(error: serde_json::Error) -> Self {
        Self::new("RUNTIME_JSON_ERROR", error.to_string())
    }
}

impl From<tauri::Error> for RuntimeError {
    fn from(error: tauri::Error) -> Self {
        Self::new("RUNTIME_TAURI_ERROR", error.to_string())
    }
}
