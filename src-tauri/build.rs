use std::fs::File;
use std::io::prelude::*;

fn main() {
    let path = "./xodus/xodus-cli/src/lib.rs".to_string();
    let contents = "
pub mod commands;
pub mod license;
mod package;
mod webview;
";

    let mut file = File::create(path).expect("xodus cli lib.rs could not be created.");
    write!(file, "{}", contents).expect("could not write text context to xodus cli lib.rs");

    tauri_build::build()
}
