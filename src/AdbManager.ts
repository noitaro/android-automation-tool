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
}
