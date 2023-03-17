#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;
use base64::{encode, decode};
use std::io::{Read, Write};
use std::fs;
use std::fs::File;
use std::path::Path;
use serde_json::json;

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
  file.write_all(b"Hello, world!").unwrap();
  Ok(())
}

#[tauri::command]
async fn img_save_command(base64: String, file_name: String) -> Result<(), String> {
  let folder_path = Path::new("./img");
  if folder_path.exists() && folder_path.is_dir() {
      println!("The folder exists.");
  } else {
      println!("The folder does not exist.");
      fs::create_dir("img").unwrap();
  }

  let buffer = decode(base64).unwrap();
  let img = image::load_from_memory(&buffer).unwrap();
  image::DynamicImage::save(&img, format!("{}{}{}", "./img/", file_name, ".png")).unwrap();
  Ok(())
}

#[tauri::command]
async fn img_get_file_name_command() -> Result<String, String> {
  let folder_path = Path::new("./img");
  if folder_path.exists() && folder_path.is_dir() {
      println!("The folder exists.");
  } else {
      println!("The folder does not exist.");
      fs::create_dir("img").unwrap();
  }

  let img_path = Path::new("./img");
  let entries = fs::read_dir(img_path).unwrap();

  let mut vec = Vec::new();
  for entry in entries {
      let entry = entry.unwrap();
      let mut path_buf = entry.path();
      path_buf.set_extension("");
      let file_name = path_buf.file_name().unwrap().to_string_lossy().into_owned();
      vec.push(file_name);
  }

  let json_string = json!(vec).to_string();
  Ok(json_string)
}

#[tauri::command]
async fn img_get_file_src_command(file_name: String) -> Result<String, String> {
  println!("img_get_file_src_command: {}", file_name);
  let path = format!("{}{}{}", "./img/", file_name, ".png");
  let image_path = Path::new(&path);

  // 画像ファイルを読み込む
  let mut img_file = File::open(image_path).unwrap();
  
  let mut buffer = Vec::new();
  img_file.read_to_end(&mut buffer).unwrap();
  
  // Base64エンコードする
  let encode_bin: String = encode(&buffer);
  Ok(encode_bin)
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
      img_get_file_name_command,
      img_get_file_src_command,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
