mod position_store;
mod runtime_error;
mod window_manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            window_manager::setup(app.handle())?;
            Ok(())
        })
        .on_window_event(window_manager::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            window_manager::open_home_window,
            window_manager::show_pet_window,
            window_manager::hide_pet_window,
            window_manager::hide_all_windows_to_tray,
            window_manager::get_runtime_window_mode,
            window_manager::start_pet_window_drag
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Project Momo desktop shell");
}
