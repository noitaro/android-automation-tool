#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::Command;
use base64::{encode, decode};
use std::io::{Read, Write};
use std::fs;
use std::fs::File;
use std::path::Path;
use serde_json::json;
use opencv::{imgproc, imgcodecs, core};
use opencv::prelude::MatTraitConst;

static mut SCREEN_IMG_BUFFER: Vec<u8> = Vec::new();

#[tauri::command]
async fn adb_devices_command(adb: String) -> Result<String, String> {
  let output = Command::new(adb)
    .args(["devices"])
    .output()
    .expect("Failed to execute command");

  let devices = format!("{}", String::from_utf8_lossy(&output.stdout));
  Ok(devices)
}

#[tauri::command]
async fn adb_screencap_command(adb: String, device: String) -> Result<String, String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["exec-out", "screencap", "-p"])
    .output()
    .expect("Failed to execute command");

  let buffer = output.stdout;
  unsafe {
    SCREEN_IMG_BUFFER = buffer.clone();
  }

  let encode_bin: String = encode(&buffer);
  Ok(encode_bin)
}

#[tauri::command]
async fn setting_file_read_command() -> Result<String, String> {
  let mut file = File::open("setting.json").unwrap();
  let mut contents = String::new();
  file.read_to_string(&mut contents).unwrap();
  Ok(contents)
}

#[tauri::command]
async fn setting_file_write_command(contents: String) -> Result<(), String> {
  let mut file = File::create("setting.json").expect("failed to create file");
  file.write_all(contents.as_bytes()).unwrap();
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
  let img_path = Path::new(&path);

  // 画像ファイルを読み込む
  let mut img_file = File::open(img_path).unwrap();
  
  let mut buffer = Vec::new();
  img_file.read_to_end(&mut buffer).unwrap();
  
  // Base64エンコードする
  let encode_bin: String = encode(&buffer);
  Ok(encode_bin)
}

#[tauri::command]
async fn adb_app_start_command(adb: String, device: String, app_path: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "am", "start", "-n", &app_path])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_app_end_command(adb: String, device: String, app_path: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "am", "force-stop", &app_path])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_touchscreen_swipe_command(adb: String, device: String, sx: String, sy: String, ex: String, ey: String, ms: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "input", "touchscreen", "swipe", &sx, &sy, &ex, &ey, &ms])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_touchscreen_tap_command(adb: String, device: String, x: String, y: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "input", "touchscreen", "tap", &x, &y])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_input_text_command(adb: String, device: String, text: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "input", "text", &text])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_input_keyevent_command(adb: String, device: String, keycode: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let output = Command::new(adb)
    .args(args)
    .args(["shell", "input", "keyevent", &keycode])
    .output()
    .expect("Failed to execute command");

  println!("status code: {}", output.status);
  Ok(())
}

#[tauri::command]
async fn adb_touchscreen_img_command(adb: String, device: String, img_path: String, clickable: bool) -> Result<bool, String> {
  
  let img: core::Mat;
  unsafe {
    let mat = core::Mat::from_slice(&SCREEN_IMG_BUFFER).unwrap();
    let input_array: &dyn core::ToInputArray = &mat;
    img = imgcodecs::imdecode(input_array, imgcodecs::IMREAD_COLOR).unwrap();
  }
  
  // テンプレートマッチングを実行するための画像とテンプレート画像を読み込みます。
  let template = imgcodecs::imread(&img_path, imgcodecs::IMREAD_COLOR).unwrap();

  // 画像のグレースケール化を行います。
  let mut gray_img = core::Mat::default();
  imgproc::cvt_color(&img, &mut gray_img, imgproc::COLOR_BGR2GRAY, 0).unwrap();
  let mut gray_template = core::Mat::default();
  imgproc::cvt_color(&template, &mut gray_template, imgproc::COLOR_BGR2GRAY, 0).unwrap();

  // テンプレートマッチングを実行します。
  let mut result = core::Mat::default();
  imgproc::match_template(&gray_img, &gray_template, &mut result, imgproc::TM_CCOEFF_NORMED, &core::no_array()).unwrap();

  // テンプレートマッチングの結果を取得します。
  let mut max_val = 0.0;
  let mut max_loc = core::Point::new(0, 0);
  core::min_max_loc(&result, None, Some(&mut max_val), None, Some(&mut max_loc), &core::no_array()).unwrap();
  println!("Max Location: {} {:?}", max_val, max_loc);

  if 0.9 <= max_val {
    if clickable {
      // 幅と高さを取得します。
      let width = &template.cols();
      let height = &template.rows();
      
      adb_touchscreen_tap_command(adb, device, (max_loc.x + (width/2)).to_string(), (max_loc.y + (height/2)).to_string()).await?;
    }
    Ok(true)
  } else {
    Ok(false)
  }

}

#[tauri::command]
async fn adb_save_img_command(save_path: String) -> Result<(), String> {
  let folder_path = Path::new("./img_save");
  if folder_path.exists() && folder_path.is_dir() {
      println!("The folder exists.");
  } else {
      println!("The folder does not exist.");
      fs::create_dir("img_save").unwrap();
  }

  let img: image::DynamicImage;
  unsafe {
    img = image::load_from_memory(&SCREEN_IMG_BUFFER).unwrap();
  }
  
  image::DynamicImage::save(&img, &save_path).unwrap();
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      adb_devices_command,
      adb_screencap_command, 
      setting_file_read_command,
      setting_file_write_command,
      img_save_command,
      img_get_file_name_command,
      img_get_file_src_command,
      adb_app_start_command,
      adb_app_end_command,
      adb_touchscreen_swipe_command,
      adb_touchscreen_tap_command,
      adb_touchscreen_img_command,
      adb_input_text_command,
      adb_input_keyevent_command,
      adb_save_img_command,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
