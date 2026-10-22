use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder};

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
            // measured: the tallest tabs are pet with its square cards (~514) and calendar with two calendars (508)
            .inner_size(960.0, 520.0)
            .build();
    });
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let toggle = MenuItemBuilder::with_id("toggle", "펫 숨기기").build(app)?;
    let reset = MenuItemBuilder::with_id("reset", "펫 위치 초기화").build(app)?;
    let quiet = MenuItemBuilder::with_id("quiet", "조용히 하기").build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "설정").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "종료").build(app)?;
    let menu = MenuBuilder::new(app).items(&[&toggle, &reset, &quiet, &settings, &quit]).build()?;

    // the pet window owns the quiet switch (it remembers it across restarts) and reports every change here
    let quiet_label = quiet.clone();
    app.listen_any("quiet-state", move |e| {
        let on = e.payload() == "true";
        let _ = quiet_label.set_text(if on { "다시 말 걸기" } else { "조용히 하기" });
    });

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
            // the way back for a pet dragged into a corner or off-screen: the tray is reachable even when the pet is not
            "reset" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = toggle.set_text("펫 숨기기");
                }
                let _ = app.emit("reset-position", ());
            }
            "quiet" => {
                let _ = app.emit("quiet-toggle", ());
            }
            "settings" => open_settings(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}
