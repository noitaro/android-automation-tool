import { tauri } from '@tauri-apps/api';

export class AdbManager {

  adb: string;

  constructor(adb: string) {
    this.adb = adb;
  }

  getDevices = async () => {

    try {
      await tauri.invoke('adb_devices_command', { adb: this.adb });
      // const message = await tauri.invoke('my_custom_command3');
      // console.log(message);

    } catch (error) {
      console.log(error);
    }

    // try {
    //   const message = await tauri.invoke('my_custom_command4');
    //   console.log(message);
    // } catch (error) {
    //   console.log(error);
    // }

    return null;
  }

  getScreencap = async () => {
    try {
      const binary: Buffer = await tauri.invoke('adb_screencap_command', { adb: this.adb });
      const base64String = binary.toString('base64');
      return base64String;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  touchscreenPos = async (x: string, y: string) => {
    try {
      await tauri.invoke('adb_touchscreen_tap_command', { adb: this.adb, x: x, y: y });
    } catch (error) {
      console.log(error);
    }
  }

  longTouchscreenPos = async (x: string, y: string, ms: string) => {
    try {
      await tauri.invoke('adb_touchscreen_swipe_command', { adb: this.adb, sx: x, sy: y, ex: x, ey: y, ms: ms });
    } catch (error) {
      console.log(error);
    }
  }

  swipeTouchscreenPos = async (sx: string, sy: string, ex: string, ey: string, ms: string) => {
    try {
      await tauri.invoke('adb_touchscreen_swipe_command', { adb: this.adb, sx: sx, sy: sy, ex: ex, ey: ey, ms: ms });
    } catch (error) {
      console.log(error);
    }
  }

  inputText = async (text: string) => {
    try {
      await tauri.invoke('adb_input_text_command', { adb: this.adb, text: text });
    } catch (error) {
      console.log(error);
    }
  }

  inputKeyEvent = async (keycode: string) => {
    try {
      await tauri.invoke('adb_input_keyevent_command', { adb: this.adb, keycode: keycode });
    } catch (error) {
      console.log(error);
    }
  }

  checkScreenImg = async (imgPath: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_touchscreen_img_command', { adb: this.adb, imgPath: imgPath, clickable: false });
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  touchScreenImg = async (imgPath: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_touchscreen_img_command', { adb: this.adb, imgPath: imgPath, clickable: true });
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  imgSave = async (savePath: string) => {
    try {
      const result: boolean = await tauri.invoke('adb_save_img_command', { adb: this.adb, savePath: savePath });
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  
  appStart = async (appPath: string) => {
    try {
      await tauri.invoke('adb_app_start_command', { adb: this.adb, appPath: appPath });
    } catch (error) {
      console.log(error);
    }
  }
  
  appEnd = async (appPath: string) => {
    try {
      await tauri.invoke('adb_app_end_command', { adb: this.adb, appPath: appPath });
    } catch (error) {
      console.log(error);
    }
  }
  
}
