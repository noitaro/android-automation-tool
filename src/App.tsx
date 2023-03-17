import React from 'react';
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsDialogComponent from './SettingsDialogComponent';
import { tauri } from '@tauri-apps/api';

import BlocklyComponent, { Block, Value, Field, Shadow } from './Blockly';
import './blocks/customblocks';
import './generator/generator';

import Interpreter from 'js-interpreter';

function App() {
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;


      // (async() => {
      //   await tauri.invoke('setting_file_write_command', { content: "aaa" });
      // })()
    }
  }, []);

  const clickedExecute = () => {
    setRunning(true);

    const myInterpreter = new Interpreter('2 * 2');
    console.log(myInterpreter);
    
  }

  const clickedStop = () => {
    setRunning(false);
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
      <SettingsDialogComponent open={open} setOpen={setOpen} />
    </>
  );
}

export default App;
