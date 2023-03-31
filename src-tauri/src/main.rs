#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::Command;
use base64::{encode, decode};
use std::io::{Read, Write};
use std::fs;
use std::fs::File;
use std::path::Path;
use serde_json::json;
use opencv::{imgproc, imgcodecs, core};

static mut SCREEN_IMG_BUFFER: Vec<u8> = Vec::new();

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

  let buffer = output.stdout;
  unsafe {
    SCREEN_IMG_BUFFER = buffer.clone();
  }

  let encode_bin: String = encode(&buffer);
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
  let image_path = Path::new(&path);

  // 画像ファイルを読み込む
  let mut img_file = File::open(image_path).unwrap();
  
  let mut buffer = Vec::new();
  img_file.read_to_end(&mut buffer).unwrap();
  
  // Base64エンコードする
  let encode_bin: String = encode(&buffer);
  Ok(encode_bin)
}

#[tauri::command]
async fn adb_touchscreen_img_command(adb: String, img_path: String) -> Result<bool, String> {

  let image: core::Mat;
  unsafe {
    let mat = core::Mat::from_slice(&SCREEN_IMG_BUFFER).unwrap();
    let input_array: &dyn core::ToInputArray = &mat;
    image = imgcodecs::imdecode(input_array, imgcodecs::IMREAD_COLOR).unwrap();
  }
  
  // テンプレートマッチングを実行するための画像とテンプレート画像を読み込みます。
  // let image = imgcodecs::imread("./image.png", imgcodecs::IMREAD_COLOR).unwrap();
  let template = imgcodecs::imread(&img_path, imgcodecs::IMREAD_COLOR).unwrap();

  // 画像のグレースケール化を行います。
  let mut gray_image = core::Mat::default();
  imgproc::cvt_color(&image, &mut gray_image, imgproc::COLOR_BGR2GRAY, 0).unwrap();
  let mut gray_template = core::Mat::default();
  imgproc::cvt_color(&template, &mut gray_template, imgproc::COLOR_BGR2GRAY, 0).unwrap();

  // テンプレートマッチングを実行します。
  let mut result = core::Mat::default();
  imgproc::match_template(&gray_image, &gray_template, &mut result, imgproc::TM_CCOEFF_NORMED, &core::no_array()).unwrap();

  // テンプレートマッチングの結果を取得します。
  let mut min_val = 0.9; // 閾値
  let mut max_loc = core::Point::new(0, 0);
  core::min_max_loc(&result, Some(&mut min_val), None, None, Some(&mut max_loc), &core::no_array()).unwrap();
  println!("Max Location: {:?}", max_loc);

  Ok(false)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      my_custom_command1, 
      adb_devices_command,
      adb_screencap_command, 
      my_custom_command3, 
      my_custom_command4,
      setting_file_read_command,
      setting_file_write_command,
      img_save_command,
      img_get_file_name_command,
      img_get_file_src_command,
      adb_touchscreen_img_command,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
