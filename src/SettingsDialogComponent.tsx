import React from "react";
import { AppBar, Button, Dialog, Divider, IconButton, List, ListItem, ListItemText, Slide, Stack, TextField, Toolbar, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close';
import AdbIcon from '@mui/icons-material/Adb';
import { TransitionProps } from "@mui/material/transitions";
import { AdbManager } from "./AdbManager";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SettingsDialogComponent(props: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { open, setOpen } = props;

  const clickedScreenCapture = async () => {
    const adb = new AdbManager("D:\\Program Files\\Nox\\bin\\adb.exe");
    // const aa = await adb.devices();
    const screencap = await adb.getScreencap();
    if (screencap != null) {
      setImgsrc(`data:image/png;base64,${screencap}`);
    }
    // const aa = await adb.screencap("D:\Program Files\Nox\bin\adb.exe");
  }

  const [imgsrc, setImgsrc] = React.useState("data:image/png;base64,");

  return (
    <Dialog fullScreen open={open} onClose={() => { setOpen(false); }} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => { setOpen(false); }} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">自動操作設定</Typography>
        </Toolbar>
      </AppBar>
      <Stack spacing={2} sx={{ m: 1 }}>
        <Grid container spacing={0}>
          <Grid xs="auto">
            <Button variant="contained" component="label" disableElevation startIcon={<AdbIcon />}>adb.exe を選択<input hidden accept=".exe" type="file" /></Button>
          </Grid>
          <Grid xs>
            <TextField variant="outlined" size="small" fullWidth InputProps={{ readOnly: true, }} />
          </Grid>
        </Grid>
        <Button variant="contained" disableElevation onClick={clickedScreenCapture}>アンドロイドのスクリーンショットを取得</Button>
        <img src={imgsrc} style={{"maxWidth": "100%"}} />
      </Stack>
    </Dialog>
  );
}