#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::Command;
use base64::{encode, decode};
use std::io::{Read, Write};
use std::os::windows::process::CommandExt;
use std::fs;
use std::fs::File;
use std::path::Path;
use serde_json::json;
use opencv::{imgproc, imgcodecs, core};
use opencv::prelude::MatTraitConst;

static mut SCREEN_IMG_BUFFER: Vec<u8> = Vec::new();

#[tauri::command]
async fn project_create_command(project_name: String) -> Result<(), String> {

  let project_root_path = Path::new("./project");
  if project_root_path.exists() == false || project_root_path.is_dir() == false {
    fs::create_dir("project").unwrap();
  }

  let project_path = format!("./project/{}", project_name);
  let folder_path = Path::new(&project_path);
  if folder_path.exists() == false || folder_path.is_dir() == false {
    fs::create_dir(project_path).unwrap();
  }

  Ok(())
}

#[tauri::command]
async fn project_list_command() -> Result<Vec<String>, String> {
  let path = "./project";
  let dirs = fs::read_dir(path).unwrap();

  let mut project_list: Vec<String> = vec![];
  for dir in dirs {
    let dir_entry = dir.unwrap();
    if dir_entry.file_type().unwrap().is_dir() {
      let folder_name = dir_entry.file_name().into_string().unwrap();
      project_list.push(folder_name);
    }
  }

  Ok(project_list)
}

#[tauri::command]
async fn adb_devices_command(adb: String) -> Result<String, String> {
  let result = Command::new(adb)
  .args(["devices"])
  .stdout(std::process::Stdio::piped())
  .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
  .spawn();

  match result {
    Ok(child) => {
      let mut stdout: Vec<u8> = Vec::new();
      child.stdout.unwrap().read_to_end(&mut stdout).expect("failed to read child stdout");
      let devices = format!("{}", String::from_utf8_lossy(&stdout));
      Ok(devices)
    }
    Err(error) => {
      Err(error.to_string())
    }
  }
}

#[tauri::command]
async fn adb_screencap_command(adb: String, device: String) -> Result<String, String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let result = Command::new(adb)
  .args(args)
  .args(["exec-out", "screencap", "-p"])
  .stdout(std::process::Stdio::piped())
  .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
  .spawn();

  match result {
    Ok(child) => {
      let mut stdout: Vec<u8> = Vec::new();
      child.stdout.unwrap().read_to_end(&mut stdout).expect("failed to read child stdout");
      unsafe {SCREEN_IMG_BUFFER = stdout.clone();}
      let encode_bin: String = encode(&stdout);
      Ok(encode_bin)
    }
    Err(error) => {
      Err(error.to_string())
    }
  }
}

#[tauri::command]
async fn setting_file_read_command(project_name: String) -> Result<String, String> {
  println!("setting_file_read_command: {}", project_name);
  
  let path = format!("./project/{}/setting.json", project_name);

  let mut contents = String::new();

  let result = File::open(path);
  match result {
    Ok(mut file) => {
      file.read_to_string(&mut contents).unwrap();
    }
    Err(_) => {
      setting_file_write_command(project_name, "{}".to_string()).await.unwrap();
    }
  }

  Ok(contents)
}

#[tauri::command]
async fn setting_file_write_command(project_name: String, contents: String) -> Result<(), String> {
  println!("setting_file_write_command: {}", project_name);

  let path = format!("./project/{}/setting.json", project_name);
  let mut file = File::create(path).expect("failed to create file");
  file.write_all(contents.as_bytes()).unwrap();
  Ok(())
}

#[tauri::command]
async fn python_file_write_command(project_name: String, contents: String) -> Result<(), String> {
  println!("python_file_write_command: {}", project_name);

  let path = format!("./project/{}/main.py", project_name);
  let mut file = File::create(path).expect("failed to create file");
  file.write_all(contents.as_bytes()).unwrap();
  Ok(())
}

#[tauri::command]
async fn img_save_command(project_name: String, base64: String, file_name: String) -> Result<(), String> {
  let path = format!("./project/{}/img", project_name);
  println!("img_save_command: {}", path);

  let folder_path = Path::new(&path);
  if folder_path.exists() == false || folder_path.is_dir() == false {
      fs::create_dir("img").unwrap();
  }

  let buffer = decode(base64).unwrap();
  let img = image::load_from_memory(&buffer).unwrap();
  image::DynamicImage::save(&img, format!("./project/{}/img/{}.png", project_name, file_name)).unwrap();
  Ok(())
}

#[tauri::command]
async fn img_get_file_name_command(project_name: String) -> Result<String, String> {
  let path = format!("./project/{}/img", project_name);
  println!("img_get_file_name_command: {}", path);

  let img_path = Path::new(&path);
  if img_path.exists() == false || img_path.is_dir() == false {
      fs::create_dir(img_path).unwrap();
  }

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
async fn img_get_file_src_command(project_name: String, file_name: String) -> Result<String, String> {
  let path = format!("./project/{}/img/{}.png", project_name, file_name);
  println!("img_get_file_src_command: {}", path);
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
async fn adb_touchscreen_img_command(adb: String, device: String, project_name: String, img_name: String, clickable: bool) -> Result<bool, String> {
  
  let img: core::Mat;
  unsafe {
    let mat = core::Mat::from_slice(&SCREEN_IMG_BUFFER).unwrap();
    let input_array: &dyn core::ToInputArray = &mat;
    img = imgcodecs::imdecode(input_array, imgcodecs::IMREAD_COLOR).unwrap();
  }
  
  // テンプレートマッチングを実行するための画像とテンプレート画像を読み込みます。
  let project_path = format!("./project/{}/{}", project_name, img_name);
  println!("adb_touchscreen_img_command: {}", &project_path);
  let template = imgcodecs::imread(&project_path, imgcodecs::IMREAD_COLOR).unwrap();

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
async fn adb_save_img_command(project_name: String, file_name: String) -> Result<(), String> {
  let path = format!("./project/{}/img_save", project_name);
  let folder_path = Path::new(&path);
  if folder_path.exists() == false || folder_path.is_dir() == false {
    fs::create_dir(path).unwrap();
  }

  let img: image::DynamicImage;
  unsafe {
    img = image::load_from_memory(&SCREEN_IMG_BUFFER).unwrap();
  }
  
  let file_path = format!("./project/{}/img_save/{}", project_name, file_name);
  image::DynamicImage::save(&img, &file_path).unwrap();
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      project_create_command,
      project_list_command,
      adb_devices_command,
      adb_screencap_command, 
      setting_file_read_command,
      setting_file_write_command,
      python_file_write_command,
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
