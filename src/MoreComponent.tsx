import React from "react";
import { Box, IconButton, Popover } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LoadingButton } from "@mui/lab";
import { OutputDoneDialogComponent } from "./OutputDoneDialogComponent";
import { tauri } from "@tauri-apps/api";

export const MoreComponent = React.forwardRef((props: { sx: any, savePython: () => Promise<void>, projectName: string }, ref) => {
  const { sx, savePython, projectName } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [loadingOpenProjectFolder, setLoadingOpenProjectFolder] = React.useState(false);
  const clickedOpenProjectFolder = async () => {
    setLoadingOpenProjectFolder(true);
    await tauri.invoke('project_open_folder_command', { projectName: projectName });
    setAnchorEl(null);
    setLoadingOpenProjectFolder(false);
  }

  const [loadingSavePython, setLoadingSavePython] = React.useState(false);
  const clickedSavePython = async () => {
    setLoadingSavePython(true);
    await savePython();
    setOpenOutputDoneDialog(true);
    setAnchorEl(null);
    setLoadingSavePython(false);
  }
  
  const [openOutputDoneDialog, setOpenOutputDoneDialog] = React.useState(false);

  return (
    <>
      <IconButton color="inherit" sx={sx} aria-describedby={id} onClick={(event) => { setAnchorEl(event.currentTarget); }} disabled={projectName == ""} >
        <MoreVertIcon />
      </IconButton>
      <Popover id={id} open={open} anchorEl={anchorEl} onClose={() => { setAnchorEl(null); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} transformOrigin={{ vertical: 'top', horizontal: 'right', }}>
        <Box sx={{ m: 1 }}>
          <LoadingButton size="small" variant="outlined" loading={loadingOpenProjectFolder} fullWidth onClick={clickedOpenProjectFolder}>プロジェクトフォルダーを開く</LoadingButton>
          <LoadingButton size="small" variant="outlined" loading={loadingSavePython} fullWidth onClick={clickedSavePython} sx={{ mt: 1 }}>Python 出力</LoadingButton>
        </Box>
      </Popover>
      <OutputDoneDialogComponent open={openOutputDoneDialog} setOpen={setOpenOutputDoneDialog} />
    </>
  );
});
