import React from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsDialogComponent from './SettingsDialogComponent';
import { tauri } from '@tauri-apps/api';

import BlocklyComponent, { Block, Value, Field, Shadow, Category } from './Blockly';
import './blocks/customblocks';
import './generator/generator';

import { InterpreterInit } from "./JSInterpreter";

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';
hljs.registerLanguage('javascript', javascript);

let interpreterRunning = false;

function App() {
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [code, setCode] = React.useState('alert("1");' + "\n" + 'alert("2");' + "\n" + 'alert("3");' + "\n" + 'alert("4");' + "\n" + 'alert("5");' + "\n" + 'alert("5");' + "\n" + 'alert("5");' + "\n" + 'alert("5");' + "\n" + 'alert("5");' + "\n" + 'alert("5");');

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      hljs.initHighlighting();

      // (async() => {
      //   await tauri.invoke('setting_file_write_command', { content: "aaa" });
      // })()
    }
  }, []);

  const clickedExecute = async () => {
    console.log("clickedExecute1: 開始 ", interpreterRunning);
    setRunning(true);
    interpreterRunning = true;

    //@ts-ignore
    const myInterpreter = new Interpreter('alert("1");alert("2");alert("3");alert("4");alert("5");', InterpreterInit);
    // myInterpreter.run();

    console.log("clickedExecute2: 開始 ", interpreterRunning);
    try {
      console.log("clickedExecute3: 開始 ", interpreterRunning);
      while (interpreterRunning == true && myInterpreter.step()) {
        // console.log("clickedExecute4: 開始 ", interpreterRunning);
        // sleep
        await new Promise(resolve => setTimeout(resolve, 10));
        // console.log("clickedExecute4: 終了 ", interpreterRunning);
      }
      console.log("clickedExecute3: 終了 ", interpreterRunning);
    } catch (error) {
      console.error(error);
    }
    finally {
      // demoWorkspace.highlightBlock(null);
      setRunning(false);
      interpreterRunning = false;
    }
    console.log("clickedExecute2: 終了 ", interpreterRunning);

    console.log("clickedExecute1: 終了 ", interpreterRunning);
  }

  const clickedStop = () => {
    setRunning(false);
    interpreterRunning = false;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>アンドロイド自動操作ツール</Typography>
          <Button variant="contained" disableElevation color="secondary" startIcon={<SettingsIcon />} sx={{ ml: 1 }} onClick={() => { setOpen(true); }}>自動操作設定</Button>
          {running ?
            <Button variant="contained" disableElevation color="primary" startIcon={<StopIcon />} sx={{ ml: 1 }} onClick={clickedStop}>停止</Button> :
            <Button variant="contained" disableElevation color="primary" startIcon={<PlayArrowIcon />} sx={{ ml: 1 }} onClick={clickedExecute}>実行</Button>
          }
        </Toolbar>
      </AppBar>
      <BlocklyComponent readOnly={false}
        trashcan={true} media={'media/'} sounds={false}
        grid={{ spacing: 20, length: 1, colour: '#888', snap: false }}
        move={{ scrollbars: true, drag: true, wheel: true }}
        zoom={{ controls: true, wheel: false, startScale: 1, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }}
        initialXml={`<xml xmlns="http://www.w3.org/1999/xhtml"><block type="controls_ifelse" x="0" y="0"></block></xml>`}>
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
        <Category name="Variables" colour="#a55b80" custom="VARIABLE"></Category>
        <Category name="Functions" colour="#995ba5" custom="PROCEDURE"></Category>
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
      </BlocklyComponent>
      <Box style={{ "position": "absolute", "bottom": "0px", "width": "100%", "height": "200px", "overflow": "scroll" }}>
        <pre style={{"margin": "0px"}}><code>{code}</code></pre>
      </Box>
      <SettingsDialogComponent open={open} setOpen={setOpen} />
    </>
  );
}

export default App;
