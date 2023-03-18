
export function InterpreterInit(interpreter: any, globalObject: any) {
  interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction((message: any) => window.alert(message)));
}