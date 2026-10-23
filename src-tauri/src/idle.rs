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

/// shortcut: no away detection on macOS yet (it always looks present); add it with CGEventSourceSecondsSinceLastEventType.
#[cfg(not(windows))]
#[tauri::command]
pub fn idle_seconds() -> u64 {
    0
}
