use windows::Win32::UI::Shell::SHQueryUserNotificationState;

/// True when the user should not be disturbed: fullscreen app, D3D game, or presentation mode.
/// QUNS_BUSY(2) / RUNNING_D3D_FULL_SCREEN(3) / PRESENTATION_MODE(4); the raw value is returned
/// so the PoC can show it. Not covered: QUNS_QUIET_TIME(6) (Focus assist) is left to the user.
#[tauri::command]
pub fn notification_state() -> i32 {
    unsafe { SHQueryUserNotificationState().map(|s| s.0).unwrap_or(-1) }
}

pub fn is_busy(state: i32) -> bool {
    matches!(state, 2..=4)
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
