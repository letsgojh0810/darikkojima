use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

pub fn open_settings(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("settings") {
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    // built off the event-loop thread: creating a window from a menu callback can deadlock on Windows
    let app = app.clone();
    std::thread::spawn(move || {
        let _ = WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("settings.html".into()))
            .title("다리꼬지마 설정")
            .inner_size(960.0, 520.0)
            .build();
    });
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let toggle = MenuItemBuilder::with_id("toggle", "펫 숨기기").build(app)?;
    let quiet = MenuItemBuilder::with_id("quiet", "1시간 조용히").build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "설정").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "종료").build(app)?;
    let menu = MenuBuilder::new(app).items(&[&toggle, &quiet, &settings, &quit]).build()?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("다리꼬지마")
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "toggle" => {
                let Some(win) = app.get_webview_window("main") else { return };
                if win.is_visible().unwrap_or(true) {
                    let _ = win.hide();
                    let _ = toggle.set_text("펫 보이기");
                } else {
                    let _ = win.show();
                    let _ = toggle.set_text("펫 숨기기");
                }
            }
            "quiet" => {
                let _ = app.emit("quiet", 60);
            }
            "settings" => open_settings(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}
