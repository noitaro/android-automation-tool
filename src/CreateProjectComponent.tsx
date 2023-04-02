import { LoadingButton } from "@mui/lab";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { tauri } from "@tauri-apps/api";
import React from "react";

export const CreateProjectComponent = React.forwardRef((props: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, refreshProjectList: (createProjectName?: string) => Promise<void> }, ref) => {
  const { open, setOpen, refreshProjectList } = props;
  const [loading, setLoading] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");

  const clickedCreateProject = async () => {
    setLoading(true);

    await tauri.invoke('project_create_command', { projectName: projectName });

    await refreshProjectList(projectName);
    setOpen(false);
    setLoading(false);
  }

  return (
    <Dialog onClose={() => { setOpen(false); }} open={open}>
      <DialogTitle>新規プロジェクト</DialogTitle>
      <DialogContent>
        <TextField label="プロジェクト名" variant="outlined" size="small" sx={{ mt: 1 }} fullWidth value={projectName} onChange={(event) => { setProjectName(event.target.value); }} />
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={clickedCreateProject} loading={loading}>作成</LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
