#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;
use base64::{encode, decode};
use std::fs::File;
use std::io::{Read, Write};
use image::{GenericImageView, ImageBuffer};
use image::io::Reader as ImageReader;
use std::fs;

#[tauri::command]
fn my_custom_command1() {
  println!("I was invoked from JS!");
}

#[tauri::command]
async fn adb_devices_command(adb: String) {
  let output = Command::new(adb)
    .args(["devices"])
    .output()
    .expect("Failed to execute command");

  println!("{}", String::from_utf8_lossy(&output.stdout));
}

#[tauri::command]
async fn adb_screencap_command(adb: String) -> Result<String, String> {
  let output = Command::new(adb)
    .args(["exec-out", "screencap", "-p"])
    .output()
    .expect("Failed to execute command");

  let encode_bin: String = encode(&output.stdout);
  Ok(encode_bin)
}

#[tauri::command]
async fn my_custom_command3() -> String {
  "Hello from Rust!".into()
}

#[tauri::command]
async fn my_custom_command4(invoke_message: String) -> Result<String, String> {
  if invoke_message == "" {
    // If something fails
    Err("This failed!".into())
  } else {
    // If it worked
    Ok("This worked!".into())
  }
}

#[tauri::command]
async fn setting_file_write_command(content: String) -> Result<(), String> {
  let mut file = File::create("foo.txt").expect("failed to create file");
  file.write_all(b"Hello, world!");
  Ok(())
}

#[tauri::command]
async fn img_save_command(base64: String, file_name: String) -> Result<(), String> {
  fs::create_dir("img");

  let buffer = decode(base64).unwrap();
  let img = image::load_from_memory(&buffer).unwrap();
  image::DynamicImage::save(&img, format!("{}{}{}", "./img/", file_name, ".png"));
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      my_custom_command1, 
      adb_devices_command,
      adb_screencap_command, 
      my_custom_command3, 
      my_custom_command4,
      setting_file_write_command,
      img_save_command,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
