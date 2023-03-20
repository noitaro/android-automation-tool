import { AdbManager } from "./AdbManager";

export function InterpreterInit(interpreter: any, globalObject: any) {
  const adb = new AdbManager("D:\\Program Files\\Nox\\bin\\adb.exe");

  const aapo = interpreter.nativeToPseudo({});
  interpreter.setProperty(globalObject, 'aapo', aapo);
  interpreter.setProperty(aapo, 'screencap', interpreter.createAsyncFunction(async (callback: any) => {
    console.log("screencap: S");
    const screencap = await adb.getScreencap();
    callback();
    console.log("screencap: E");
  }));

  interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction((message: any) => window.alert(message)));
}