use crate::{position_store, runtime_error::RuntimeError};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder, Window,
    WindowEvent,
};

const PET_WINDOW_LABEL: &str = "pet";
const HOME_WINDOW_LABEL: &str = "home";
const PET_WINDOW_WIDTH: f64 = 420.0;
const PET_WINDOW_HEIGHT: f64 = 520.0;
const HOME_WINDOW_WIDTH: f64 = 960.0;
const HOME_WINDOW_HEIGHT: f64 = 720.0;

/// Initializes desktop runtime window behavior.
///
/// Precondition: the Tauri app has already loaded configured windows. Postcondition: the pet
/// window position is restored and a tray/menu recovery entry is installed when supported.
pub fn setup(app: &AppHandle) -> Result<(), RuntimeError> {
    restore_pet_window_position(app);
    create_tray(app)?;
    Ok(())
}

/// Handles native window movement so the pet window can restore its position after restart.
///
/// Precondition: called from Tauri's window event hook. Postcondition: pet window movement is
/// persisted on a best-effort basis without crashing the app.
pub fn handle_window_event(window: &Window, event: &WindowEvent) {
    if window.label() != PET_WINDOW_LABEL {
        return;
    }
    if !matches!(event, WindowEvent::Moved(_)) {
        return;
    }
    let Ok(position) = window.outer_position() else {
        return;
    };
    let Ok(size) = window.outer_size() else {
        return;
    };
    if let Err(error) =
        position_store::save_pet_window_position(&window.app_handle(), position, size)
    {
        eprintln!("【保存桌宠位置失败】【window=pet】【error={}】", error);
    }
}

/// Opens the full home window that contains the status panel and action dock.
///
/// Precondition: the desktop runtime is active. Postcondition: the home window is visible and
/// focused.
#[tauri::command]
pub fn open_home_window(app: AppHandle) -> Result<(), RuntimeError> {
    show_or_create_home_window(&app)
}

/// Shows the transparent pet window from tray/menu or frontend fallback controls.
///
/// Precondition: the pet window label is configured. Postcondition: the pet window is visible and
/// focused.
#[tauri::command]
pub fn show_pet_window(app: AppHandle) -> Result<(), RuntimeError> {
    let window = app
        .get_webview_window(PET_WINDOW_LABEL)
        .ok_or_else(|| RuntimeError::new("PET_WINDOW_NOT_FOUND", "pet window is not available"))?;
    window.show()?;
    window.set_focus()?;
    Ok(())
}

/// Hides the transparent pet window while keeping tray/menu recovery available.
///
/// Precondition: the pet window label is configured. Postcondition: the pet window is hidden.
#[tauri::command]
pub fn hide_pet_window(app: AppHandle) -> Result<(), RuntimeError> {
    let window = app
        .get_webview_window(PET_WINDOW_LABEL)
        .ok_or_else(|| RuntimeError::new("PET_WINDOW_NOT_FOUND", "pet window is not available"))?;
    save_current_pet_position(&app);
    window.hide()?;
    Ok(())
}

/// Returns the mode for the current runtime window.
///
/// Precondition: called from a Tauri webview. Postcondition: returns `pet-window` for the pet
/// label and `home-window` otherwise.
#[tauri::command]
pub fn get_runtime_window_mode(window: WebviewWindow) -> String {
    if window.label() == PET_WINDOW_LABEL {
        "pet-window".to_string()
    } else {
        "home-window".to_string()
    }
}

fn create_tray(app: &AppHandle) -> Result<(), RuntimeError> {
    let show_pet = MenuItem::with_id(app, "show_pet", "Show Momo", true, None::<&str>)?;
    let hide_pet = MenuItem::with_id(app, "hide_pet", "Hide Momo", true, None::<&str>)?;
    let open_home = MenuItem::with_id(app, "open_home", "Open Home", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_pet, &hide_pet, &open_home, &quit])?;

    let mut tray_builder = TrayIconBuilder::new().menu(&menu).tooltip("Momo Pet");
    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    tray_builder
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Err(error) = show_pet_window(app.clone()) {
                    eprintln!("【恢复桌宠窗口失败】【source=tray】【error={}】", error);
                }
            }
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show_pet" => {
                if let Err(error) = show_pet_window(app.clone()) {
                    eprintln!(
                        "【恢复桌宠窗口失败】【source=tray-menu】【error={}】",
                        error
                    );
                }
            }
            "hide_pet" => {
                if let Err(error) = hide_pet_window(app.clone()) {
                    eprintln!(
                        "【隐藏桌宠窗口失败】【source=tray-menu】【error={}】",
                        error
                    );
                }
            }
            "open_home" => {
                if let Err(error) = show_or_create_home_window(app) {
                    eprintln!(
                        "【打开主页窗口失败】【source=tray-menu】【error={}】",
                        error
                    );
                }
            }
            "quit" => {
                save_current_pet_position(app);
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;
    Ok(())
}

fn show_or_create_home_window(app: &AppHandle) -> Result<(), RuntimeError> {
    if let Some(window) = app.get_webview_window(HOME_WINDOW_LABEL) {
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        HOME_WINDOW_LABEL,
        WebviewUrl::App("/?window=home".into()),
    )
    .title("Project Momo")
    .inner_size(HOME_WINDOW_WIDTH, HOME_WINDOW_HEIGHT)
    .min_inner_size(720.0, 520.0)
    .resizable(true)
    .decorations(true)
    .transparent(false)
    .visible(true)
    .build()?;
    Ok(())
}

fn restore_pet_window_position(app: &AppHandle) {
    let Some(window) = app.get_webview_window(PET_WINDOW_LABEL) else {
        return;
    };
    if let Some(saved_position) = position_store::read_pet_window_position(app) {
        let position = PhysicalPosition::new(saved_position.x, saved_position.y);
        if is_position_visible(
            &window,
            position,
            saved_position.width,
            saved_position.height,
        ) {
            if let Err(error) = window.set_position(position) {
                eprintln!("【恢复桌宠位置失败】【window=pet】【error={}】", error);
            }
            return;
        }
    }
    set_default_pet_window_position(&window);
}

fn save_current_pet_position(app: &AppHandle) {
    let Some(window) = app.get_webview_window(PET_WINDOW_LABEL) else {
        return;
    };
    let Ok(position) = window.outer_position() else {
        return;
    };
    let Ok(size) = window.outer_size() else {
        return;
    };
    if let Err(error) = position_store::save_pet_window_position(app, position, size) {
        eprintln!("【保存桌宠位置失败】【window=pet】【error={}】", error);
    }
}

fn set_default_pet_window_position(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window.primary_monitor() {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let x = monitor_position.x + monitor_size.width as i32 - PET_WINDOW_WIDTH as i32 - 48;
        let y = monitor_position.y + monitor_size.height as i32 - PET_WINDOW_HEIGHT as i32 - 72;
        if let Err(error) = window.set_position(PhysicalPosition::new(x.max(0), y.max(0))) {
            eprintln!("【设置默认桌宠位置失败】【window=pet】【error={}】", error);
        }
    }
}

fn is_position_visible(
    window: &WebviewWindow,
    position: PhysicalPosition<i32>,
    width: u32,
    height: u32,
) -> bool {
    let Ok(monitors) = window.available_monitors() else {
        return true;
    };
    monitors.iter().any(|monitor| {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let right = position.x + width as i32;
        let bottom = position.y + height as i32;
        let monitor_right = monitor_position.x + monitor_size.width as i32;
        let monitor_bottom = monitor_position.y + monitor_size.height as i32;
        right > monitor_position.x
            && position.x < monitor_right
            && bottom > monitor_position.y
            && position.y < monitor_bottom
    })
}
