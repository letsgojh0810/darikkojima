/// Seconds since the last keyboard or mouse input anywhere on the system (a locked screen counts as no input).
#[cfg(windows)]
#[tauri::command]
pub fn idle_seconds() -> u64 {
    use windows::Win32::System::SystemInformation::GetTickCount;
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    let mut info = LASTINPUTINFO { cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32, dwTime: 0 };
    unsafe {
        if !GetLastInputInfo(&mut info).as_bool() {
            return 0;
        }
        // both are 32-bit millisecond tick counts; wrapping_sub stays right across the 49-day wrap
        u64::from(GetTickCount().wrapping_sub(info.dwTime)) / 1000
    }
}

/// Whether a mouse button is still down: a window drag hands the mouse to the OS, so the page never sees the release.
/// Either physical button counts, so it also holds for swapped (left-handed) buttons.
#[cfg(windows)]
#[tauri::command]
pub fn mouse_held() -> bool {
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LBUTTON, VK_RBUTTON};
    // the high bit means "down right now"
    unsafe { GetAsyncKeyState(VK_LBUTTON.0 as i32) < 0 || GetAsyncKeyState(VK_RBUTTON.0 as i32) < 0 }
}

/// shortcut: on macOS the drag ends when the window stops moving, as before; add it with CGEventSourceButtonState.
#[cfg(not(windows))]
#[tauri::command]
pub fn mouse_held() -> bool {
    false
}

/// shortcut: no away detection on macOS yet (it always looks present); add it with CGEventSourceSecondsSinceLastEventType.
#[cfg(not(windows))]
#[tauri::command]
pub fn idle_seconds() -> u64 {
    0
}
