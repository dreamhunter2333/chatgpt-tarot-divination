// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::{SocketAddr, TcpListener, TcpStream};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Manager, RunEvent, WebviewWindowBuilder};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

const SIDECAR_TIMEOUT: Duration = Duration::from_secs(120);

struct Sidecar(Mutex<Option<CommandChild>>);

// a fixed port breaks when another program holds it, so ask the OS for a free one
fn free_port() -> std::io::Result<u16> {
    Ok(TcpListener::bind(("127.0.0.1", 0))?.local_addr()?.port())
}

fn spawn_sidecar(app: &tauri::AppHandle, port: u16) -> Result<(), String> {
    let (mut rx, child) = app
        .shell()
        .sidecar("awsl-divination")
        .map_err(|e| e.to_string())?
        .args(["--port", &port.to_string()])
        .spawn()
        .map_err(|e| e.to_string())?;
    *app.state::<Sidecar>().0.lock().unwrap() = Some(child);

    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                    log::info!("[sidecar] {}", String::from_utf8_lossy(&line).trim_end());
                }
                CommandEvent::Terminated(payload) => {
                    log::warn!("[sidecar] terminated: {:?}", payload.code);
                    app.state::<Sidecar>().0.lock().unwrap().take();
                }
                _ => {}
            }
        }
    });
    Ok(())
}

fn wait_for_sidecar(app: &tauri::AppHandle, port: u16) -> bool {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
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
        // a second launch would spawn another app and sidecar, focus the running app instead
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        // sidecar output ends up in the app log dir, release builds have no console
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .manage(Sidecar(Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();
            let port = free_port()?;
            if let Err(e) = spawn_sidecar(&handle, port) {
                log::error!("[tauri] Failed to spawn sidecar: {e}");
            }
            // The frontend reads the sidecar address from this global before any request.
            let window_config = app.config().app.windows.first().ok_or("missing window config")?;
            WebviewWindowBuilder::from_config(app.handle(), window_config)?
                .initialization_script(format!("window.__API_BASE__ = 'http://127.0.0.1:{port}';"))
                .build()?;
            // Show the window only after the backend is reachable, without blocking the event loop.
            std::thread::spawn(move || {
                if !wait_for_sidecar(&handle, port) {
                    log::error!("[tauri] Sidecar not reachable on port {port}");
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
