import React from 'react';
import { AppBar, Backdrop, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsDialogComponent from './SettingsDialogComponent';
import { tauri } from '@tauri-apps/api';

import Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { Block, Value, Field, Shadow, Category, Sep } from './Blockly';
import './blocks/customblocks';
import './generator/generator';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-light.css';
import { BlocklyComponent, BlocklyComponentHandles } from './Blockly/BlocklyComponent';
import { LoadingButton } from '@mui/lab';
import { SettingModel } from './SettingModel';
import { CropperComponentHandles } from './CropperComponent';
import { AdbManager } from './AdbManager';
import { ImageModel } from './ImageModel';
import { DeviceSelectComponent, DeviceSelectComponentHandles } from './DeviceSelectComponent';
import { LeftMenuComponent } from './LeftMenuComponent';
import { MoreComponent } from './MoreComponent';
hljs.registerLanguage('javascript', javascript);

let interpreterRunning = false;

function App() {
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [javaScriptCode, setJavaScriptCode] = React.useState('');
  const [device, setDevice] = React.useState("");
  const [initialXml, setInitialXml] = React.useState("");
  const [imgs, setImgs] = React.useState<ImageModel[]>([]);

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      hljs.initHighlighting();
    }
  }, []);

  const [adbPath, setAdbPath] = React.useState("");
  React.useEffect(() => {
    if (adbPath == "") return;

    (async () => {
      const settingJson: string = await tauri.invoke('setting_file_read_command', { projectName: projectName });
      const setting: SettingModel = JSON.parse(settingJson);
      if (setting.adbPath == adbPath) return;

      setting.adbPath = adbPath;
      await tauri.invoke('setting_file_write_command', { projectName: projectName, contents: JSON.stringify(setting) });
    })();
  }, [adbPath]);

  // JavaScriptコードが変わったら、ファイル保存
  const [javaScriptCodeTimeout, setJavaScriptCodeTimeout] = React.useState<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (javaScriptCodeTimeout != null) {
      clearTimeout(javaScriptCodeTimeout);
      setJavaScriptCodeTimeout(null);
    }

    if (javaScriptCode == "") return;
    if (projectName == "") return;
    const tmpProjectName = JSON.parse(JSON.stringify(projectName));

    const timeout = setTimeout(async () => {
      const workspace = blocklyComponentRef.current?.getWorkspace();
      const dom = Blockly.Xml.workspaceToDom(workspace);
      const xml = Blockly.Xml.domToPrettyText(dom);

      const settingJson: string = await tauri.invoke('setting_file_read_command', { projectName: tmpProjectName });
      const setting: SettingModel = JSON.parse(settingJson);
      if (setting.xml === xml) return;
      setting.xml = xml;
      await tauri.invoke('setting_file_write_command', { projectName: tmpProjectName, contents: JSON.stringify(setting) });
    }, 3000);
    setJavaScriptCodeTimeout(timeout);

  }, [javaScriptCode]);

  React.useEffect(() => {
    // 画像ブロックカテゴリの更新
    const workspace = blocklyComponentRef.current?.getWorkspace();
    const imgBlockCategory = workspace.getToolbox().getToolboxItemById('imgBlockCategory');

    const contents: { kind: string; blockxml: string; }[] = [];

    for (const img of imgs) {
      const block = {
        "kind": "block",
        "blockxml": `<block type="image_serializable_field"><field name="IMG">${img.src}</field><field name="NAME">${img.name}</field><field name="PATH">${img.path}</field></block>`
      };
      contents.push(block);
    }

    imgBlockCategory.updateFlyoutContents(contents);
  }, [imgs]);

  const blocklyComponentRef = React.useRef<BlocklyComponentHandles>(null);

  const InterpreterInit = (interpreter: any, globalObject: any) => {
    if (projectName == "") return;

    const device = deviceSelectComponentRef.current?.getDevice() ?? "";
    const adb = new AdbManager(adbPath, device, projectName);
    const workspace = blocklyComponentRef.current?.getWorkspace();

    const aapo = interpreter.nativeToPseudo({});
    interpreter.setProperty(globalObject, 'aapo', aapo);
    interpreter.setProperty(aapo, 'screencap', interpreter.createAsyncFunction(async (callback: any) => {
      const screencap = await adb.getScreencap();
      setImgSrc(`data:image/png;base64,${screencap}`);
      callback();
    }));
    interpreter.setProperty(aapo, 'sleep', interpreter.createAsyncFunction(async (timeout: number, callback: any) => {
      await new Promise((resolve) => setTimeout(resolve, (timeout * 1000)));
      callback();
    }));
    interpreter.setProperty(aapo, 'chkImg', interpreter.createAsyncFunction(async (imgPath: string, callback: any) => {
      const result: boolean = await adb.checkScreenImg(imgPath);
      callback(result);
    }));
    interpreter.setProperty(aapo, 'touchImg', interpreter.createAsyncFunction(async (imgPath: string, callback: any) => {
      const result: boolean = await adb.touchScreenImg(imgPath);
      callback(result);
    }));
    interpreter.setProperty(aapo, 'touchPos', interpreter.createAsyncFunction(async (x: number, y: number, callback: any) => {
      await adb.touchscreenPos(x.toString(), y.toString());
      callback();
    }));
    interpreter.setProperty(aapo, 'longTouchPos', interpreter.createAsyncFunction(async (x: number, y: number, ms: number, callback: any) => {
      await adb.longTouchscreenPos(x.toString(), y.toString(), ms.toString());
      callback();
    }));
    interpreter.setProperty(aapo, 'swipeTouchPos', interpreter.createAsyncFunction(async (sx: number, sy: number, ex: number, ey: number, ms: number, callback: any) => {
      await adb.swipeTouchscreenPos(sx.toString(), sy.toString(), ex.toString(), ey.toString(), ms.toString());
      callback();
    }));
    interpreter.setProperty(aapo, 'inputtext', interpreter.createAsyncFunction(async (text: string, callback: any) => {
      await adb.inputText(text);
      callback();
    }));
    interpreter.setProperty(aapo, 'inputkeyevent', interpreter.createAsyncFunction(async (keycode: number, callback: any) => {
      await adb.inputKeyEvent(keycode.toString());
      callback();
    }));
    interpreter.setProperty(aapo, 'imgSave', interpreter.createAsyncFunction(async (savePath: string, callback: any) => {
      await adb.imgSave(savePath);
      callback();
    }));
    interpreter.setProperty(aapo, 'start', interpreter.createAsyncFunction(async (appPath: string, callback: any) => {
      await adb.appStart(appPath);
      callback();
    }));
    interpreter.setProperty(aapo, 'end', interpreter.createAsyncFunction(async (appPath: string, callback: any) => {
      await adb.appEnd(appPath);
      callback();
    }));







    interpreter.setProperty(globalObject, 'highlightBlock', interpreter.createNativeFunction((id: string) => workspace.highlightBlock(id)));
    interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction((message: any) => window.alert(message)));
  }

  const clickedExecute = async () => {
    setRunning(true);
    interpreterRunning = true;

    const workspace = blocklyComponentRef.current?.getWorkspace();
    javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    const code: string = javascriptGenerator.workspaceToCode(workspace);
    if (code == null) return;

    //@ts-ignore
    const myInterpreter = new Interpreter(code, InterpreterInit);

    try {
      while (interpreterRunning == true && myInterpreter.step()) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      workspace.highlightBlock(null);
      setRunning(false);
      interpreterRunning = false;
    }
  }

  const clickedStop = () => {
    setRunning(false);
    interpreterRunning = false;
  }

  const cropperComponentRef = React.useRef<CropperComponentHandles>(null);
  const [imgSrc, setImgSrc] = React.useState("data:image/png;base64,");

  const deviceSelectComponentRef = React.useRef<DeviceSelectComponentHandles>(null);
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const [projectName, setProjectName] = React.useState("");
  React.useEffect(() => {
    setAdbPath("");
    setInitialXml("");
    setImgs([]);
    const workspace = blocklyComponentRef.current?.getWorkspace();
    workspace.clear();

    if (projectName == "") return;

    (async () => {
      const settingJson: string = await tauri.invoke('setting_file_read_command', { projectName: projectName });
      const setting: SettingModel = JSON.parse(settingJson);
      setAdbPath(setting.adbPath ?? "");
      setInitialXml(setting.xml ?? "");
    })();

    (async () => {
      const filesJson: string = await tauri.invoke('img_get_file_name_command', { projectName: projectName });
      const files: string[] = JSON.parse(filesJson);
      files.sort(((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      }));
      console.log(files);

      const readedImgs: ImageModel[] = [];
      for (const fileName of files) {
        const fileSrc: string = await tauri.invoke('img_get_file_src_command', { projectName: projectName, fileName: fileName });
        const imageModel = new ImageModel();
        imageModel.name = fileName;
        imageModel.path = `./img/${fileName}.png`;
        imageModel.src = `data:image/png;base64,${fileSrc}`;
        readedImgs.push(imageModel);
      }

      setImgs(readedImgs);
    })();

  }, [projectName]);

  const savePython = async () => {
    const workspace = blocklyComponentRef.current?.getWorkspace();
    const code = pythonGenerator.workspaceToCode(workspace);
    console.log(code);

    const contents = `
# This Python file uses the following encoding: utf-8

# pip install android-auto-play-opencv
import android_auto_play_opencv as am
import datetime # 日時を取得するために必要

aapo = am.AapoManager(r'${adbPath}')

${code}
    `;
    
    await tauri.invoke('python_file_write_command', { projectName: projectName, contents: contents });
  }

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => { setOpenDrawer(true); }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>アンドロイド自動操作ツール</Typography>
          <Button variant="contained" disableElevation color="secondary" startIcon={<SettingsIcon />} sx={{ ml: 1 }} onClick={() => { setOpen(true); }}>自動操作設定</Button>
          <DeviceSelectComponent ref={deviceSelectComponentRef} sx={{ ml: 1 }} adbPath={adbPath} setDevice={setDevice} />
          <LoadingButton variant="contained" disableElevation color="success" startIcon={<PlayArrowIcon />} sx={{ ml: 1 }} onClick={clickedExecute} disabled={running} loading={running}>実行</LoadingButton>
          <Button variant="contained" disableElevation color="error" startIcon={<StopIcon />} sx={{ ml: 1 }} onClick={clickedStop} disabled={!running}>停止</Button>
          <MoreComponent sx={{ ml: 2 }} savePython={savePython} />
        </Toolbar>
      </AppBar>
      <LeftMenuComponent open={openDrawer} setOpen={setOpenDrawer} setProject={setProjectName} projectName={projectName} />
      <BlocklyComponent ref={blocklyComponentRef} setCode={setJavaScriptCode} readOnly={false}
        trashcan={true} media={'media/'} sounds={false}
        grid={{ spacing: 20, length: 1, colour: '#888', snap: false }}
        move={{ scrollbars: true, drag: true, wheel: true }}
        zoom={{ controls: true, wheel: false, startScale: 1, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }}
        initialXml={initialXml}>
        <Category name="Logic" colour="#5b80a5">
          <Block type="controls_if"></Block>
          <Block type="logic_compare">
            <Field name="OP">EQ</Field>
          </Block>
          <Block type="logic_operation">
            <Field name="OP">AND</Field>
          </Block>
          <Block type="logic_negate"></Block>
          <Block type="logic_boolean">
            <Field name="BOOL">TRUE</Field>
          </Block>
          <Block type="logic_null"></Block>
          <Block type="logic_ternary"></Block>
        </Category>
        <Category name="Loops" colour="#5ba55b">
          <Block type="controls_repeat_ext">
            <Value name="TIMES">
              <Shadow type="math_number">
                <Field name="NUM">10</Field>
              </Shadow>
            </Value>
          </Block>
          <Block type="controls_whileUntil">
            <Field name="MODE">WHILE</Field>
          </Block>
          <Block type="controls_for">
            <Field name="VAR" id="bo2n{wZ7fe}5+p8YNl*(">i</Field>
            <Value name="FROM">
              <Shadow type="math_number">
                <Field name="NUM">1</Field>
              </Shadow>
            </Value>
            <Value name="TO">
              <Shadow type="math_number">
                <Field name="NUM">10</Field>
              </Shadow>
            </Value>
            <Value name="BY">
              <Shadow type="math_number">
                <Field name="NUM">1</Field>
              </Shadow>
            </Value>
          </Block>
          <Block type="controls_forEach">
            <Field name="VAR" id="*GJ9w;=z27oZab)Pbs~[">j</Field>
          </Block>
          <Block type="controls_flow_statements">
            <Field name="FLOW">BREAK</Field>
          </Block>
        </Category>
        <Category name="Math" colour="#5b67a5">
          <Block type="math_number">
            <Field name="NUM">0</Field>
          </Block>
        </Category>
        <Sep></Sep>
        <Category name="自動操作" colour="65">
          <Block type="screencap_field" />
          <Block type="sleep_field">
            <Field name="NAME">3</Field>
          </Block>
          <Block type="image_touchscreen_field1" />
          <Block type="image_touchscreen_field2" />
          <Block type="tap_touchscreen_field">
            <Field name="X">100</Field>
            <Field name="Y">150</Field>
          </Block>
          <Block type="longtap_touchscreen_field">
            <Field name="X">100</Field>
            <Field name="Y">150</Field>
            <Field name="TIME">5</Field>
          </Block>
          <Block type="swipe_touchscreen_field">
            <Field name="SX">100</Field>
            <Field name="SY">150</Field>
            <Field name="EX">200</Field>
            <Field name="EY">300</Field>
            <Field name="TIME">5</Field>
          </Block>
          <Block type="input_text_field">
            <Value name="NAME">
              <Block type="text">
                <Field name="TEXT">konomoji</Field>
              </Block>
            </Value>
          </Block>
          <Block type="input_keyevent_field">
            <Field name="NAME">3</Field>
          </Block>
          <Block type="image_save_field" />
          <Block type="app_start_field">
            <Value name="PACKAGE_NAME">
              <Block type="text">
                <Field name="TEXT">com.android.settings</Field>
              </Block>
            </Value>
            <Value name="CLASS_NAME">
              <Block type="text">
                <Field name="TEXT">com.android.settings.Settings</Field>
              </Block>
            </Value>
          </Block>
          <Block type="app_end_field">
            <Value name="PACKAGE_NAME">
              <Block type="text">
                <Field name="TEXT">com.android.settings</Field>
              </Block>
            </Value>
          </Block>
        </Category>
        <Category name="画像ブロック" colour="65" toolboxitemid="imgBlockCategory"></Category>
        <Sep></Sep>
        <Category name="Variables" colour="#a55b80" custom="VARIABLE"></Category>
        <Category name="Functions" colour="#995ba5" custom="PROCEDURE"></Category>
      </BlocklyComponent>
      <div style={{ "position": "absolute", "right": "0px", "top": "64px", "width": "30%", "height": "calc(100% - 264px)", "display": "flex" }}>
        <img src={imgSrc} style={{ "maxHeight": "100%", "maxWidth": "100%", "margin": "auto" }} />
      </div>
      <Box style={{ "position": "absolute", "bottom": "0px", "width": "100%", "height": "200px", "overflow": "auto" }}>
        <pre style={{ "margin": "0px" }}><code>{javaScriptCode}</code></pre>
      </Box>
      <SettingsDialogComponent openDialog={open} setOpen={setOpen} imgs={imgs} setImgs={setImgs} adbPath={adbPath} setAdbPath={setAdbPath} device={device} projectName={projectName} />
    </>
  );
}

export default App;
