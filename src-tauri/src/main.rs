#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::process::Command;
use base64::{encode, decode};
use std::io::{Read, Write};
use std::os::windows::process::CommandExt;
use std::fs;
use std::fs::File;
use std::path::Path;
use opencv::{imgproc, imgcodecs, core};
use opencv::prelude::MatTraitConst;

static mut SCREEN_IMG_BUFFER: Vec<u8> = Vec::new();

#[tauri::command]
async fn project_create_command(project_name: String) -> Result<(), String> {

  let document_dir = dirs::document_dir().unwrap();
  let project_dir = format!("{}/android-automation-tool/project/{}", &document_dir.display(), project_name);
  println!("project_create_command: {}", project_dir);

  let project_path = Path::new(&project_dir);
  if project_path.exists() == false || project_path.is_dir() == false {
    fs::create_dir(&project_dir).unwrap();
  }

  Ok(())
}

#[tauri::command]
async fn project_open_folder_command(project_name: String) -> Result<(), String> {

  let document_dir = dirs::document_dir().unwrap();
  let project_dir = format!("{}\\android-automation-tool\\project\\{}", &document_dir.display(), project_name);
  println!("project_open_folder_command: {}", project_dir);

  let mut child = Command::new("explorer")
    .args([project_dir])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn project_list_command() -> Result<Vec<String>, String> {
  
  let document_dir = dirs::document_dir().unwrap();
  let aat_dir = format!("{}/android-automation-tool", &document_dir.display());
  let aat_path = Path::new(&aat_dir);
  if aat_path.exists() == false || aat_path.is_dir() == false {
    fs::create_dir(&aat_dir).unwrap();
  }

  let project_root_dir = format!("{}/android-automation-tool/project", &document_dir.display());
  let project_root_path = Path::new(&project_root_dir);
  if project_root_path.exists() == false || project_root_path.is_dir() == false {
    fs::create_dir(&project_root_dir).unwrap();
  }

  println!("project_list_command: {}", project_root_dir);

  let dirs = fs::read_dir(project_root_dir).unwrap();

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
  
  let document_dir = dirs::document_dir().unwrap();
  let setting_dir = format!("{}/android-automation-tool/project/{}/setting.json", &document_dir.display(), project_name);
  println!("setting_file_read_command: {}", setting_dir);

  let mut contents = String::new();

  let result = File::open(setting_dir);
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

  let document_dir = dirs::document_dir().unwrap();
  let setting_dir = format!("{}/android-automation-tool/project/{}/setting.json", &document_dir.display(), project_name);
  println!("setting_file_write_command: {}", setting_dir);

  let mut file = File::create(setting_dir).unwrap();
  file.write_all(contents.as_bytes()).unwrap();
  Ok(())
}

#[tauri::command]
async fn python_file_write_command(project_name: String, contents: String) -> Result<(), String> {

  let document_dir = dirs::document_dir().unwrap();
  let python_dir = format!("{}/android-automation-tool/project/{}/main.py", &document_dir.display(), project_name);
  println!("python_file_write_command: {}", python_dir);

  let mut file = File::create(python_dir).unwrap();
  file.write_all(contents.as_bytes()).unwrap();
  Ok(())
}

#[tauri::command]
async fn img_save_command(project_name: String, base64: String, file_name: String) -> Result<(), String> {
  
  let document_dir = dirs::document_dir().unwrap();
  let img_dir = format!("{}/android-automation-tool/project/{}/img", &document_dir.display(), project_name);
  println!("img_save_command: {}", img_dir);

  let folder_path = Path::new(&img_dir);
  if folder_path.exists() == false || folder_path.is_dir() == false {
      fs::create_dir(&img_dir).unwrap();
  }

  let buffer = decode(base64).unwrap();
  let img = image::load_from_memory(&buffer).unwrap();
  image::DynamicImage::save(&img, format!("{}/android-automation-tool/project/{}/img/{}.png", &document_dir.display(), project_name, file_name)).unwrap();
  Ok(())
}

#[tauri::command]
async fn img_get_file_name_command(project_name: String) -> Result<Vec<String>, String> {
  
  let document_dir = dirs::document_dir().unwrap();
  let img_dir = format!("{}/android-automation-tool/project/{}/img", &document_dir.display(), project_name);
  println!("img_get_file_name_command: {}", img_dir);

  let img_path = Path::new(&img_dir);
  let result = fs::read_dir(img_path);

  let mut vec = Vec::new();
  match result {
    Ok(read_dir) => {
      for entry in read_dir {
        let entry = entry.unwrap();
        let mut path_buf = entry.path();
        path_buf.set_extension("");
        let file_name = path_buf.file_name().unwrap().to_string_lossy().into_owned();
        vec.push(file_name);
      }
    }
    Err(_) => {}
  }

  Ok(vec)
}

#[tauri::command]
async fn img_get_file_src_command(project_name: String, file_name: String) -> Result<String, String> {
  
  let document_dir = dirs::document_dir().unwrap();
  let img_dir = format!("{}/android-automation-tool/project/{}/img/{}.png", &document_dir.display(), project_name, file_name);
  println!("img_get_file_src_command: {}", img_dir);

  // 画像ファイルを読み込む
  let img_path = Path::new(&img_dir);
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

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "am", "start", "-n", &app_path])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn adb_app_end_command(adb: String, device: String, app_path: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "am", "force-stop", &app_path])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn adb_touchscreen_swipe_command(adb: String, device: String, sx: String, sy: String, ex: String, ey: String, ms: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "input", "touchscreen", "swipe", &sx, &sy, &ex, &ey, &ms])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn adb_touchscreen_tap_command(adb: String, device: String, x: String, y: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "input", "touchscreen", "tap", &x, &y])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn adb_input_text_command(adb: String, device: String, text: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "input", "text", &text])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
  Ok(())
}

#[tauri::command]
async fn adb_input_keyevent_command(adb: String, device: String, keycode: String) -> Result<(), String> {
  
  let mut args = vec![];
  if device != "" {
    args = vec!["-s", &device];
  }

  let mut child = Command::new(adb)
    .args(args)
    .args(["shell", "input", "keyevent", &keycode])
    .stdout(std::process::Stdio::null())
    .creation_flags(winapi::um::winbase::CREATE_NO_WINDOW)
    .spawn()
    .expect("Failed to execute command");

  child.wait().expect("failed to wait for child process");
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
  
  let document_dir = dirs::document_dir().unwrap();
  let template_dir = format!("{}/android-automation-tool/project/{}/{}", &document_dir.display(), project_name, img_name);
  println!("adb_touchscreen_img_command: {}", template_dir);

  // テンプレートマッチングを実行するための画像とテンプレート画像を読み込みます。
  let template = imgcodecs::imread(&template_dir, imgcodecs::IMREAD_COLOR).unwrap();

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
  
  let document_dir = dirs::document_dir().unwrap();
  let folder_dir = format!("{}/android-automation-tool/project/{}/img_save", &document_dir.display(), project_name);

  let folder_path = Path::new(&folder_dir);
  if folder_path.exists() == false || folder_path.is_dir() == false {
    fs::create_dir(&folder_dir).unwrap();
  }

  let img: image::DynamicImage;
  unsafe {img = image::load_from_memory(&SCREEN_IMG_BUFFER).unwrap();}
  
  let file_dir = format!("{}/android-automation-tool/project/{}/img_save/{}", &document_dir.display(), project_name, file_name);
  println!("adb_save_img_command: {}", file_dir);
  image::DynamicImage::save(&img, &file_dir).unwrap();
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      project_create_command,
      project_open_folder_command,
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
