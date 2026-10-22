fn main() {
    // the app icon is baked into the exe at build time; without this, replacing a file in icons/ does not trigger a rebuild
    println!("cargo:rerun-if-changed=icons");
    tauri_build::build()
}
