import React, { ChangeEventHandler } from "react";
import { AppBar, Box, Button, Card, CardActionArea, CardContent, CardMedia, Dialog, Divider, IconButton, List, ListItem, ListItemText, Slide, Stack, TextField, Toolbar, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close';
import AdbIcon from '@mui/icons-material/Adb';
import { TransitionProps } from "@mui/material/transitions";
import { AdbManager } from "./AdbManager";
import { CropperComponent, CropperComponentHandles } from "./CropperComponent";
import { ImageModel } from "./ImageModel";
import { tauri } from '@tauri-apps/api';
import { SettingModel } from "./SettingModel";

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
  const [adbPath, setAdbPath] = React.useState("");

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      (async () => {
        const settingJson: string = await tauri.invoke('setting_file_read_command');
        const setting: SettingModel = JSON.parse(settingJson);
        setAdbPath(setting.adbPath);
      })();

      (async () => {
        const filesJson: string = await tauri.invoke('img_get_file_name_command');
        const files: string[] = JSON.parse(filesJson);
        files.sort(((a, b) => {
          if (a < b) return 1;
          if (a > b) return -1;
          return 0;
        }));
        console.log(files);

        const readedImgs: ImageModel[] = [];
        for (const fileName of files) {
          const fileSrc: string = await tauri.invoke('img_get_file_src_command', { fileName: fileName });
          const imageModel = new ImageModel();
          imageModel.name = fileName;
          imageModel.src = `data:image/png;base64,${fileSrc}`;
          readedImgs.push(imageModel);
        }

        setImgs(readedImgs);
      })();
    }
  }, []);

  const clickedScreenCapture = async () => {
    const adb = new AdbManager("D:\\Program Files\\Nox\\bin\\adb.exe");
    // const aa = await adb.devices();
    const screencap = await adb.getScreencap();
    if (screencap != null) {
      setImgSrc(`data:image/png;base64,${screencap}`);
    }
    // const aa = await adb.screencap("D:\Program Files\Nox\bin\adb.exe");
  }

  const [imgSrc, setImgSrc] = React.useState("data:image/png;base64,");
  const [imgs, setImgs] = React.useState<ImageModel[]>([]);

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
      await tauri.invoke('img_save_command', { base64: base64, fileName: imageModel.name });
    }
  }

  const inputFileRef = React.useRef(null);
  const changedInputFile = (event: any) => {
    const file: File = event.target.files[0];
    console.log(file.name);
    setAdbPath(file.name);
  };

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
            <Button variant="contained" component="label" disableElevation startIcon={<AdbIcon />}>adb.exe を選択<input hidden accept=".exe" type="file" ref={inputFileRef} onChange={changedInputFile} /></Button>
          </Grid>
          <Grid xs>
            <TextField value={adbPath} variant="outlined" size="small" fullWidth InputProps={{ readOnly: true, }} />
          </Grid>
        </Grid>
        <Button variant="contained" disableElevation onClick={clickedScreenCapture}>アンドロイドのスクリーンショットを取得</Button>
        <Box sx={{ border: "solid 1px rgba(0, 0, 0, 0.23)" }}>
          <CropperComponent ref={cropperComponentRef} src={imgSrc} />
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
