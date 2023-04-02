import { tauri } from '@tauri-apps/api';

export class AdbManager {

  adb: string;
  device: string;
  projectName: string;

  constructor(adb: string, device: string, projectName: string) {
    this.adb = adb;
    this.device = device;
    this.projectName = projectName;
  }

  getScreencap = async () => {
    try {
      const binary: Buffer = await tauri.invoke('adb_screencap_command', { adb: this.adb, device: this.device });
      const base64String = binary.toString('base64');
      return base64String;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  touchscreenPos = async (x: string, y: string) => {
    try {
      await tauri.invoke('adb_touchscreen_tap_command', { adb: this.adb, device: this.device, x: x, y: y });
    } catch (error) {
      console.error(error);
    }
  }

  longTouchscreenPos = async (x: string, y: string, ms: string) => {
    try {
      await tauri.invoke('adb_touchscreen_swipe_command', { adb: this.adb, device: this.device, sx: x, sy: y, ex: x, ey: y, ms: ms });
    } catch (error) {
      console.error(error);
    }
  }

  swipeTouchscreenPos = async (sx: string, sy: string, ex: string, ey: string, ms: string) => {
    try {
      await tauri.invoke('adb_touchscreen_swipe_command', { adb: this.adb, device: this.device, sx: sx, sy: sy, ex: ex, ey: ey, ms: ms });
    } catch (error) {
      console.error(error);
    }
  }

  inputText = async (text: string) => {
    try {
      await tauri.invoke('adb_input_text_command', { adb: this.adb, device: this.device, text: text });
    } catch (error) {
      console.error(error);
    }
  }

  inputKeyEvent = async (keycode: string) => {
    try {
      await tauri.invoke('adb_input_keyevent_command', { adb: this.adb, device: this.device, keycode: keycode });
    } catch (error) {
      console.error(error);
    }
  }

  checkScreenImg = async (imgName: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_touchscreen_img_command', { adb: this.adb, device: this.device, projectName: this.projectName, imgName: imgName, clickable: false });
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  touchScreenImg = async (imgName: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_touchscreen_img_command', { adb: this.adb, device: this.device, projectName: this.projectName, imgName: imgName, clickable: true });
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  imgSave = async (savePath: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_save_img_command', { adb: this.adb, device: this.device, savePath: savePath });
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  appStart = async (appPath: string) => {
    try {
      await tauri.invoke('adb_app_start_command', { adb: this.adb, device: this.device, appPath: appPath });
    } catch (error) {
      console.error(error);
    }
  }
  
  appEnd = async (appPath: string) => {
    try {
      await tauri.invoke('adb_app_end_command', { adb: this.adb, device: this.device, appPath: appPath });
    } catch (error) {
      console.error(error);
    }
  }
  
}
