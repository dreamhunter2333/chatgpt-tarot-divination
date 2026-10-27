// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::{SocketAddr, TcpStream};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

const SIDECAR_PORT: u16 = 12333;
const SIDECAR_TIMEOUT: Duration = Duration::from_secs(120);

struct Sidecar(Mutex<Option<CommandChild>>);

fn spawn_sidecar(app: &tauri::AppHandle) -> Result<(), String> {
    let (mut rx, child) = app
        .shell()
        .sidecar("awsl-divination")
        .map_err(|e| e.to_string())?
        .spawn()
        .map_err(|e| e.to_string())?;
    *app.state::<Sidecar>().0.lock().unwrap() = Some(child);

    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                    print!("[sidecar] {}", String::from_utf8_lossy(&line));
                }
                CommandEvent::Terminated(payload) => {
                    println!("[sidecar] terminated: {:?}", payload.code);
                    app.state::<Sidecar>().0.lock().unwrap().take();
                }
                _ => {}
            }
        }
    });
    Ok(())
}

fn wait_for_sidecar(app: &tauri::AppHandle) -> bool {
    let addr = SocketAddr::from(([127, 0, 0, 1], SIDECAR_PORT));
    let deadline = Instant::now() + SIDECAR_TIMEOUT;
    while Instant::now() < deadline {
        if app.state::<Sidecar>().0.lock().unwrap().is_none() {
            return false;
        }
        if TcpStream::connect_timeout(&addr, Duration::from_millis(500)).is_ok() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(250));
    }
    false
}

fn shutdown_sidecar(app: &tauri::AppHandle) {
    let Some(mut child) = app.state::<Sidecar>().0.lock().unwrap().take() else {
        return;
    };
    // PyInstaller one-file builds run the server in a child of the bootloader,
    // so `child.kill()` would orphan it; ask the sidecar to exit itself instead.
    if child.write(b"sidecar shutdown\n").is_err() {
        let _ = child.kill();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Sidecar(Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();
            if let Err(e) = spawn_sidecar(&handle) {
                eprintln!("[tauri] Failed to spawn sidecar: {e}");
            }
            // Show the window only after the backend is reachable, without blocking the event loop.
            std::thread::spawn(move || {
                if !wait_for_sidecar(&handle) {
                    eprintln!("[tauri] Sidecar not reachable on port {SIDECAR_PORT}");
                }
                if let Some(window) = handle.get_webview_window("main") {
                    let _ = window.show();
                }
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Error while running tauri application")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                shutdown_sidecar(app);
            }
        });
}
