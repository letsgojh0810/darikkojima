/// QUNS_BUSY(2) / RUNNING_D3D_FULL_SCREEN(3) / PRESENTATION_MODE(4).
/// Not covered: QUNS_QUIET_TIME(6) (Focus assist) is left to the user.
#[cfg(windows)]
fn is_busy(state: i32) -> bool {
    matches!(state, 2..=4)
}

/// True when the user should not be disturbed: fullscreen app, D3D game, or presentation mode.
#[cfg(windows)]
#[tauri::command]
pub fn is_fullscreen_busy() -> bool {
    busy()
}

/// The same check for Rust callers (the always-on-top keeper in lib.rs).
#[cfg(windows)]
pub fn busy() -> bool {
    use windows::Win32::UI::Shell::SHQueryUserNotificationState;
    unsafe { SHQueryUserNotificationState().map(|s| is_busy(s.0)).unwrap_or(false) }
}

#[cfg(not(windows))]
pub fn busy() -> bool {
    false
}

/// shortcut: no fullscreen detection on macOS yet, so the pet may speak during a fullscreen app there; add it with
/// the frontmost window's bounds (CGWindowList) once the Mac build is in use.
#[cfg(not(windows))]
#[tauri::command]
pub fn is_fullscreen_busy() -> bool {
    busy()
}

#[cfg(all(test, windows))]
mod tests {
    use super::is_busy;

    #[test]
    fn busy_states() {
        for s in [2, 3, 4] {
            assert!(is_busy(s));
        }
        for s in [-1, 1, 5, 6, 7] {
            assert!(!is_busy(s));
        }
    }
}
