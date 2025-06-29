#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use tauri::command;

#[command]
fn run_poram(input: String) -> Result<String, String> {
    let poram_path = "./bin/poram.exe";

    let mut child = Command::new(poram_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start poram.exe: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        use std::io::Write;
        stdin
            .write_all(input.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for output: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!(
            "poram.exe failed:\n--- stdout ---\n{}\n--- stderr ---\n{}",
            stdout, stderr
        ))
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_poram])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
