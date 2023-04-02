import React from "react";
import { AppBar, Box, Button, Card, CardActionArea, CardMedia, Dialog, IconButton, Slide, Stack, TextField, Toolbar, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close';
import AdbIcon from '@mui/icons-material/Adb';
import { TransitionProps } from "@mui/material/transitions";
import { AdbManager } from "./AdbManager";
import { CropperComponent, CropperComponentHandles } from "./CropperComponent";
import { ImageModel } from "./ImageModel";
import { tauri } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { LoadingButton } from "@mui/lab";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SettingsDialogComponent(props: {
  openDialog: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  imgs: ImageModel[], setImgs: React.Dispatch<React.SetStateAction<ImageModel[]>>,
  adbPath: string, setAdbPath: React.Dispatch<React.SetStateAction<string>>,
  device: string,
  projectName: string,
}) {
  const { openDialog, setOpen, imgs, setImgs, adbPath, setAdbPath, device, projectName } = props;

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

    }
  }, []);

  const [loading, setLoading] = React.useState(false);
  const clickedScreenCapture = async () => {
    setLoading(true);

    const adb = new AdbManager(adbPath, device, projectName);
    // const aa = await adb.devices();
    const screencap = await adb.getScreencap();
    if (screencap != null) {
      setImgSrc(`data:image/png;base64,${screencap}`);
    }

    setLoading(false);
  }

  const [imgSrc, setImgSrc] = React.useState("data:image/png;base64,");

  const cropperComponentRef = React.useRef<CropperComponentHandles>(null);
  const clickedSaveRectangle = async () => {
    const img = cropperComponentRef.current?.getCropImg();
    if (img != null) {

      // 末尾の番号取得
      const num = Number(imgs[0]?.name.replace('data', '') ?? 0);

      const imageModel = new ImageModel();
      imageModel.name = `data${num + 1}`;
      imageModel.src = img.src;
      setImgs([imageModel, ...imgs]);

      const base64 = img.src.replace('data:image/png;base64,', '');
      await tauri.invoke('img_save_command', { projectName: projectName, base64: base64, fileName: imageModel.name });
    }
  }

  const clickedFileOpenDialog = async () => {
    if (projectName == "") return;

    // Open a selection dialog for image files
    const selected = await open({ multiple: false, title: "adb を選択", defaultPath: "adb" });
    if (Array.isArray(selected)) {
      // user selected multiple files
    } else if (selected == null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      setAdbPath(selected);
    }
  };

  return (
    <Dialog fullScreen open={openDialog} onClose={() => { setOpen(false); }} TransitionComponent={Transition}>
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
            <Button variant="contained" component="label" disableElevation startIcon={<AdbIcon />} onClick={clickedFileOpenDialog}>adb を選択</Button>
          </Grid>
          <Grid xs>
            <TextField value={adbPath} variant="outlined" size="small" fullWidth InputProps={{ readOnly: true, }} />
          </Grid>
        </Grid>
        <LoadingButton variant="contained" disableElevation onClick={clickedScreenCapture} loading={loading}>アンドロイドのスクリーンショットを取得</LoadingButton>
        <Box sx={{ border: "solid 1px rgba(0, 0, 0, 0.23)" }}>
          <CropperComponent ref={cropperComponentRef} src={imgSrc} height="400px" width="100%" />
        </Box>
        <Button variant="contained" disableElevation onClick={clickedSaveRectangle}>選択範囲を保存する</Button>
      </Stack>
      <Grid container spacing={2} sx={{ m: 1 }}>
        {imgs.map((img, idx) => (
          <Grid xs="auto" key={idx}>
            <Card>
              <CardActionArea>
                <CardMedia component="img" image={img.src} />
                <Typography gutterBottom variant="body2" component="div" sx={{ m: 1 }}>{img.name}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Dialog>
  );
}
