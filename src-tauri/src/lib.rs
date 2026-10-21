mod fullscreen;
mod tray;

use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, State};

/// Hit rect of the pet UI in CSS px, relative to the window's top-left.
#[derive(Default)]
struct HitRect(Mutex<(f64, f64, f64, f64)>);

#[tauri::command]
fn set_hit_rect(state: State<HitRect>, x: f64, y: f64, w: f64, h: f64) {
    *state.0.lock().unwrap() = (x, y, w, h);
}

#[tauri::command]
fn open_settings(app: tauri::AppHandle) {
    tray::open_settings(&app);
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

// Window-wide ignore is the only click-through primitive Tauri offers, so poll the cursor
// and flip it. shortcut: fixed 100ms poll (40ms cost ~1.4% of a core); skipped while the pet is hidden.
fn spawn_click_through_poll(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut ignoring = None;
        loop {
            std::thread::sleep(Duration::from_millis(100));
            let Some(win) = app.get_webview_window("main") else { continue };
            if !win.is_visible().unwrap_or(true) {
                continue;
            }
            let (Ok(cur), Ok(pos), Ok(scale)) =
                (win.cursor_position(), win.outer_position(), win.scale_factor())
            else {
                continue;
            };
            let (x, y, w, h) = *app.state::<HitRect>().0.lock().unwrap();
            let (cx, cy) = ((cur.x - pos.x as f64) / scale, (cur.y - pos.y as f64) / scale);
            let inside = cx >= x && cx <= x + w && cy >= y && cy <= y + h;
            if ignoring != Some(!inside) {
                ignoring = Some(!inside);
                let _ = win.set_ignore_cursor_events(!inside);
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // must be first: a second launch just brings the pet back
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(HitRect::default())
        .invoke_handler(tauri::generate_handler![set_hit_rect, fullscreen::is_fullscreen_busy, open_settings, quit_app])
        .setup(|app| {
            tray::setup(app)?;
            spawn_click_through_poll(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
