use windows::Win32::UI::Shell::SHQueryUserNotificationState;

/// QUNS_BUSY(2) / RUNNING_D3D_FULL_SCREEN(3) / PRESENTATION_MODE(4).
/// Not covered: QUNS_QUIET_TIME(6) (Focus assist) is left to the user.
fn is_busy(state: i32) -> bool {
    matches!(state, 2..=4)
}

/// True when the user should not be disturbed: fullscreen app, D3D game, or presentation mode.
#[tauri::command]
pub fn is_fullscreen_busy() -> bool {
    unsafe { SHQueryUserNotificationState().map(|s| is_busy(s.0)).unwrap_or(false) }
}

#[cfg(test)]
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
