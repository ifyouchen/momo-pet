use crate::runtime_error::RuntimeError;
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize};

const POSITION_FILE_NAME: &str = "window-position.json";

/// Persisted desktop pet window position.
///
/// This belongs to the desktop runtime because it describes the native window, not pet business
/// state.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PetWindowPosition {
    /// Physical x coordinate used by Tauri and the host operating system.
    pub x: i32,
    /// Physical y coordinate used by Tauri and the host operating system.
    pub y: i32,
    /// Last known physical window width.
    pub width: u32,
    /// Last known physical window height.
    pub height: u32,
    /// Display identifier placeholder for later multi-monitor support.
    pub display_id: String,
    /// Last persistence time in unix milliseconds.
    pub updated_at: u128,
}

/// Reads the saved pet window position from the Tauri app data directory.
///
/// Precondition: the app data directory is accessible. Postcondition: returns `None` when the
/// cache does not exist or cannot be parsed.
pub fn read_pet_window_position(app: &AppHandle) -> Option<PetWindowPosition> {
    let path = position_file_path(app).ok()?;
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str::<PetWindowPosition>(&content).ok()
}

/// Saves the pet window position into the Tauri app data directory.
///
/// Precondition: `position` and `size` come from a visible Tauri window. Postcondition: the latest
/// native window position is persisted for the next launch.
pub fn save_pet_window_position(
    app: &AppHandle,
    position: PhysicalPosition<i32>,
    size: PhysicalSize<u32>,
) -> Result<(), RuntimeError> {
    let path = position_file_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let payload = PetWindowPosition {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        display_id: "primary".to_string(),
        updated_at: current_unix_millis(),
    };
    fs::write(path, serde_json::to_string_pretty(&payload)?)?;
    Ok(())
}

fn position_file_path(app: &AppHandle) -> Result<PathBuf, RuntimeError> {
    Ok(app.path().app_data_dir()?.join(POSITION_FILE_NAME))
}

fn current_unix_millis() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}
