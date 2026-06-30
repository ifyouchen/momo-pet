use crate::{position_store, runtime_error::RuntimeError};
use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewWindow, Window, WindowEvent,
};

const PET_WINDOW_LABEL: &str = "pet";
const HOME_WINDOW_LABEL: &str = "home";
const PET_WINDOW_WIDTH: f64 = 420.0;
const PET_WINDOW_HEIGHT: f64 = 520.0;

/// Current pet window placement and monitor bounds used by the frontend life engine.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PetWindowPlacement {
    /// Current physical x coordinate.
    pub x: i32,
    /// Current physical y coordinate.
    pub y: i32,
    /// Current physical window width.
    pub width: u32,
    /// Current physical window height.
    pub height: u32,
    /// Current monitor left coordinate.
    pub monitor_x: i32,
    /// Current monitor top coordinate.
    pub monitor_y: i32,
    /// Current monitor width.
    pub monitor_width: u32,
    /// Current monitor height.
    pub monitor_height: u32,
}
/// Initializes desktop runtime window behavior.
///
/// Precondition: the Tauri app has already loaded configured windows. Postcondition: the pet
/// window position is restored and a tray/menu recovery entry is installed when supported.
pub fn setup(app: &AppHandle) -> Result<(), RuntimeError> {
    log_runtime_windows(app);
    configure_pet_window(app);
    configure_home_window(app);
    restore_pet_window_position(app);
    create_tray(app)?;
    Ok(())
}

/// Handles native window movement so the pet window can restore its position after restart.
///
/// Precondition: called from Tauri's window event hook. Postcondition: pet window movement is
/// persisted on a best-effort basis without crashing the app.
pub fn handle_window_event(window: &Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        handle_close_requested(window, api);
        return;
    }

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
    eprintln!("【打开主页窗口】【target=home-window】");
    show_or_create_home_window(&app)
}

/// Shows the transparent pet window from tray/menu or frontend fallback controls.
///
/// Precondition: the pet window label is configured. Postcondition: the pet window is visible and
/// focused.
#[tauri::command]
pub fn show_pet_window(app: AppHandle) -> Result<(), RuntimeError> {
    eprintln!("【显示桌宠窗口】【target=pet-window】");
    let window = app
        .get_webview_window(PET_WINDOW_LABEL)
        .ok_or_else(|| RuntimeError::new("PET_WINDOW_NOT_FOUND", "pet window is not available"))?;
    apply_pet_window_runtime_options(&window);
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

/// Hides all user-facing windows while keeping tray/menu recovery available.
///
/// Precondition: at least one runtime window may exist. Postcondition: pet and home windows are
/// hidden on a best-effort basis, and the process keeps running in the tray/menu bar.
#[tauri::command]
pub fn hide_all_windows_to_tray(app: AppHandle) -> Result<(), RuntimeError> {
    save_current_pet_position(&app);
    hide_window_if_available(&app, PET_WINDOW_LABEL)?;
    hide_window_if_available(&app, HOME_WINDOW_LABEL)?;
    Ok(())
}

/// Starts native dragging for the current pet window.
///
/// Precondition: called from a mouse-down interaction in the desktop runtime. Postcondition: the
/// operating system takes over window movement for this drag gesture.
#[tauri::command]
pub fn start_pet_window_drag(window: WebviewWindow) -> Result<(), RuntimeError> {
    window.start_dragging()?;
    Ok(())
}

/// Returns pet window placement and active monitor bounds for autonomous movement.
///
/// Precondition: called from the pet window webview. Postcondition: returns current placement
/// without changing native window state.
#[tauri::command]
pub fn get_pet_window_placement(window: WebviewWindow) -> Result<PetWindowPlacement, RuntimeError> {
    if window.label() != PET_WINDOW_LABEL {
        return Err(RuntimeError::new(
            "PET_WINDOW_REQUIRED",
            "pet window placement can only be read from the pet window",
        ));
    }
    let position = window.outer_position()?;
    let size = window.outer_size()?;
    let monitor = window
        .current_monitor()?
        .or_else(|| window.primary_monitor().ok().flatten())
        .ok_or_else(|| RuntimeError::new("MONITOR_NOT_FOUND", "monitor is not available"))?;
    let monitor_position = monitor.position();
    let monitor_size = monitor.size();
    Ok(PetWindowPlacement {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        monitor_x: monitor_position.x,
        monitor_y: monitor_position.y,
        monitor_width: monitor_size.width,
        monitor_height: monitor_size.height,
    })
}

/// Moves the pet window to a bounded physical position.
///
/// Precondition: x and y come from the frontend life engine. Postcondition: the pet window is moved
/// and the new position is saved for restart restore.
#[tauri::command]
pub fn set_pet_window_position(
    app: AppHandle,
    window: WebviewWindow,
    x: i32,
    y: i32,
) -> Result<(), RuntimeError> {
    if window.label() != PET_WINDOW_LABEL {
        return Err(RuntimeError::new(
            "PET_WINDOW_REQUIRED",
            "pet window position can only be set from the pet window",
        ));
    }
    let position = PhysicalPosition::new(x, y);
    window.set_position(position)?;
    let size = window.outer_size()?;
    position_store::save_pet_window_position(&app, position, size)?;
    Ok(())
}

/// Returns the mode for the current runtime window.
///
/// Precondition: called from a Tauri webview. Postcondition: returns `pet-window` for the pet
/// label and `home-window` otherwise.
#[tauri::command]
pub fn get_runtime_window_mode(window: WebviewWindow) -> String {
    let label = window.label().to_string();
    let mode = if label == PET_WINDOW_LABEL {
        "pet-window"
    } else {
        "home-window"
    };
    eprintln!("【窗口模式识别】【label={}】【mode={}】", label, mode);
    mode.to_string()
}

fn log_runtime_windows(app: &AppHandle) {
    for label in [PET_WINDOW_LABEL, HOME_WINDOW_LABEL] {
        let exists = app.get_webview_window(label).is_some();
        eprintln!(
            "【桌面启动窗口检查】【label={}】【exists={}】",
            label, exists
        );
    }
}

fn configure_pet_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(PET_WINDOW_LABEL) else {
        return;
    };
    apply_pet_window_runtime_options(&window);
}

fn configure_home_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(HOME_WINDOW_LABEL) else {
        return;
    };
    apply_home_window_runtime_options(&window);
    if let Err(error) = window.hide() {
        eprintln!("【隐藏初始主页窗口失败】【window=home】【error={}】", error);
    }
}

fn apply_pet_window_runtime_options(window: &WebviewWindow) {
    if let Err(error) = window.set_title("Momo Pet") {
        eprintln!("【配置桌宠标题失败】【window=pet】【error={}】", error);
    }
    if let Err(error) = window.set_size(PhysicalSize::new(
        PET_WINDOW_WIDTH as u32,
        PET_WINDOW_HEIGHT as u32,
    )) {
        eprintln!("【配置桌宠尺寸失败】【window=pet】【error={}】", error);
    }
    if let Err(error) = window.set_resizable(false) {
        eprintln!("【配置桌宠缩放失败】【window=pet】【error={}】", error);
    }
    if let Err(error) = window.set_decorations(false) {
        eprintln!("【配置桌宠边框失败】【window=pet】【error={}】", error);
    }
    if let Err(error) = window.set_always_on_top(true) {
        eprintln!("【配置桌宠置顶失败】【window=pet】【error={}】", error);
    }
    if let Err(error) = window.set_skip_taskbar(true) {
        eprintln!(
            "【配置桌宠任务栏隐藏失败】【window=pet】【error={}】",
            error
        );
    }
    if let Err(error) = window.set_shadow(false) {
        eprintln!("【配置桌宠阴影失败】【window=pet】【error={}】", error);
    }
}

fn apply_home_window_runtime_options(window: &WebviewWindow) {
    if let Err(error) = window.set_title("Project Momo") {
        eprintln!("【配置主页标题失败】【window=home】【error={}】", error);
    }
    if let Err(error) = window.set_size(PhysicalSize::new(960, 720)) {
        eprintln!("【配置主页尺寸失败】【window=home】【error={}】", error);
    }
    if let Err(error) = window.set_resizable(true) {
        eprintln!("【配置主页缩放失败】【window=home】【error={}】", error);
    }
    if let Err(error) = window.set_decorations(true) {
        eprintln!("【配置主页边框失败】【window=home】【error={}】", error);
    }
    if let Err(error) = window.set_always_on_top(false) {
        eprintln!("【配置主页置顶失败】【window=home】【error={}】", error);
    }
    if let Err(error) = window.set_skip_taskbar(false) {
        eprintln!(
            "【配置主页任务栏显示失败】【window=home】【error={}】",
            error
        );
    }
    if let Err(error) = window.set_shadow(true) {
        eprintln!("【配置主页阴影失败】【window=home】【error={}】", error);
    }
}

fn handle_close_requested(window: &Window, api: &tauri::CloseRequestApi) {
    api.prevent_close();
    if window.label() == HOME_WINDOW_LABEL {
        eprintln!("【关闭主页窗口】【action=hide】【source=titlebar】");
        if let Err(error) = window.hide() {
            eprintln!("【隐藏主页窗口失败】【window=home】【error={}】", error);
        }
        return;
    }
    if window.label() == PET_WINDOW_LABEL {
        eprintln!("【关闭桌宠窗口】【action=hide】【source=titlebar】");
        save_current_pet_position(&window.app_handle());
        if let Err(error) = window.hide() {
            eprintln!("【隐藏桌宠窗口失败】【window=pet】【error={}】", error);
        }
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
                if let Err(error) = hide_all_windows_to_tray(app.clone()) {
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
                std::process::exit(0);
            }
            _ => {}
        })
        .build(app)?;
    Ok(())
}

fn show_or_create_home_window(app: &AppHandle) -> Result<(), RuntimeError> {
    if let Some(window) = app.get_webview_window(HOME_WINDOW_LABEL) {
        eprintln!("【显示主页窗口】【label=home】【source=configured-window】");
        apply_home_window_runtime_options(&window);
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    Err(RuntimeError::new(
        "HOME_WINDOW_NOT_FOUND",
        "home window is not available",
    ))
}

fn hide_window_if_available(app: &AppHandle, label: &str) -> Result<(), RuntimeError> {
    if let Some(window) = app.get_webview_window(label) {
        window.hide()?;
    }
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
