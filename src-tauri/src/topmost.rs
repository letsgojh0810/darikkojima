/// Puts the window back at the top of the always-on-top band. Tauri's `set_always_on_top(true)` does nothing when the
/// flag is already set, which is exactly the case after another topmost window has pushed the pet down, so this asks
/// Windows directly. Z-order only: the window is not activated and the focused app keeps the keyboard.
#[cfg(windows)]
pub fn raise(win: &tauri::WebviewWindow) {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{
        SetWindowPos, HWND_TOPMOST, SWP_ASYNCWINDOWPOS, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
    };
    let Ok(h) = win.hwnd() else { return };
    unsafe {
        let _ = SetWindowPos(
            HWND(h.0 as _),
            Some(HWND_TOPMOST),
            0,
            0,
            0,
            0,
            SWP_ASYNCWINDOWPOS | SWP_NOACTIVATE | SWP_NOMOVE | SWP_NOSIZE,
        );
    }
}

/// shortcut: only seen on Windows; macOS keeps the window level by itself, revisit if the Mac build shows it too.
#[cfg(not(windows))]
pub fn raise(_win: &tauri::WebviewWindow) {}
