import React from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsDialogComponent from './SettingsDialogComponent';
import { tauri } from '@tauri-apps/api';

import { Block, Value, Field, Shadow, Category } from './Blockly';
import './blocks/customblocks';
import './generator/generator';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-light.css';
import { BlocklyComponent, BlocklyComponentHandles } from './Blockly/BlocklyComponent';
import { LoadingButton } from '@mui/lab';
import { SettingModel } from './SettingModel';
import { CropperComponent, CropperComponentHandles } from './CropperComponent';
import { AdbManager } from './AdbManager';
hljs.registerLanguage('javascript', javascript);

let interpreterRunning = false;

function App() {
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [code, setCode] = React.useState('');

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      hljs.initHighlighting();

      (async () => {
        const settingJson: string = await tauri.invoke('setting_file_read_command');
        const setting: SettingModel = JSON.parse(settingJson);
      })();
    }
  }, []);

  const blocklyComponentRef = React.useRef<BlocklyComponentHandles>(null);

  const InterpreterInit = (interpreter: any, globalObject: any) => {
    const adb = new AdbManager("D:\\Program Files\\Nox\\bin\\adb.exe");

    const aapo = interpreter.nativeToPseudo({});
    interpreter.setProperty(globalObject, 'aapo', aapo);
    interpreter.setProperty(aapo, 'screencap', interpreter.createAsyncFunction(async (callback: any) => {
      console.log("screencap: S");
      const screencap = await adb.getScreencap();
      setImgSrc(`data:image/png;base64,${screencap}`);
      console.log("screencap: E");
      callback();
    }));
    interpreter.setProperty(aapo, 'sleep', interpreter.createAsyncFunction(async (timeout: number, callback: any) => {
      console.log("sleep: S");
      await new Promise((resolve) => setTimeout(resolve, (timeout * 1000)));
      console.log("sleep: E");
      callback();
    }));


    interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction((message: any) => window.alert(message)));
  }

  const clickedExecute = async () => {
    setRunning(true);
    interpreterRunning = true;

    const code = blocklyComponentRef.current?.generateCode();
    if (code == null) return;
    setCode(code);

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

  const imgBlockCategoryRef = React.useRef(null);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>アンドロイド自動操作ツール</Typography>
          <Button variant="contained" disableElevation color="secondary" startIcon={<SettingsIcon />} sx={{ ml: 1 }} onClick={() => { setOpen(true); }}>自動操作設定</Button>
          <LoadingButton variant="contained" disableElevation color="success" startIcon={<PlayArrowIcon />} sx={{ ml: 1 }} onClick={clickedExecute} disabled={running} loading={running}>実行</LoadingButton>
          <Button variant="contained" disableElevation color="error" startIcon={<StopIcon />} sx={{ ml: 1 }} onClick={clickedStop} disabled={!running}>停止</Button>
        </Toolbar>
      </AppBar>
      <BlocklyComponent ref={blocklyComponentRef} setCode={setCode} readOnly={false}
        trashcan={true} media={'media/'} sounds={false}
        grid={{ spacing: 20, length: 1, colour: '#888', snap: false }}
        move={{ scrollbars: true, drag: true, wheel: true }}
        zoom={{ controls: true, wheel: false, startScale: 1, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }}
        initialXml={`<xml><block type="screencap_field" x="10" y="10"></block></xml>`}>
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
        <Category name="自動操作" colour="65">
          <Block type="screencap_field" />
          <Block type="sleep_field">
            <Value name="NAME">
              <Block type="math_number">
                <Field name="NUM">3</Field>
              </Block>
            </Value>
          </Block>
          <Block type="test_react_field" />
          <Block type="test_react_date_field" />
          <Block type="controls_ifelse" />
          <Block type="logic_compare" />
          <Block type="logic_operation" />
          <Block type="controls_repeat_ext">
            <Value name="TIMES">
              <Shadow type="math_number">
                <Field name="NUM">10</Field>
              </Shadow>
            </Value>
          </Block>
          <Block type="logic_operation" />
          <Block type="logic_negate" />
          <Block type="logic_boolean" />
          <Block type="logic_null" disabled="true" />
          <Block type="logic_ternary" />
          <Block type="text_charAt">
            <Value name="VALUE">
              <Block type="variables_get">
                <Field name="VAR">text</Field>
              </Block>
            </Value>
          </Block>
        </Category>
        <Category name="画像ブロック" colour="65" ref={imgBlockCategoryRef}></Category>
        <Category name="Variables" colour="#a55b80" custom="VARIABLE"></Category>
        <Category name="Functions" colour="#995ba5" custom="PROCEDURE"></Category>
      </BlocklyComponent>
      <div style={{ "position": "absolute", "right": "0px", "width": "30%", "height": "calc(100% - 264px)", "display": "flex" }}>
        <img src={imgSrc} style={{ "maxHeight": "100%", "maxWidth": "100%", "margin": "auto" }} />
      </div>
      <Box style={{ "position": "absolute", "bottom": "0px", "width": "100%", "height": "200px", "overflow": "auto" }}>
        <pre style={{ "margin": "0px" }}><code>{code}</code></pre>
      </Box>
      <SettingsDialogComponent openDialog={open} setOpen={setOpen} />
    </>
  );
}

export default App;
