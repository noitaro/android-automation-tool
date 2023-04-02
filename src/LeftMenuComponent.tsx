import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled, useTheme } from "@mui/material";
import React from "react";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CreateProjectComponent } from "./CreateProjectComponent";
import { tauri } from "@tauri-apps/api";
import ArticleIcon from '@mui/icons-material/Article';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export const LeftMenuComponent = React.forwardRef((props: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, setProject: (projectName: string) => void, projectName: string }, ref) => {
  const { open, setOpen, setProject, projectName } = props;
  const [openCreateProject, setOpenCreateProject] = React.useState(false);

  const theme = useTheme();
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }));

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      (async () => {
        await refreshProjectList();
      })();
    }
  }, []);

  const [projectList, setProjectList] = React.useState<string[]>([]);
  const refreshProjectList = async () => {
    setProjectList([]);

    const result: string[] = await tauri.invoke('project_list_command');
    
    setProjectList(result);
  }

  return (
    <>
      <Drawer anchor="left" open={open} onClose={() => { setOpen(false); }}>
        <DrawerHeader>
          <IconButton onClick={() => { setOpen(false); }}>{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
        </DrawerHeader>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => { setOpen(false); }} onKeyDown={() => { setOpen(false); }}>
          <List>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setOpenCreateProject(true); }}>
                <ListItemIcon><CreateNewFolderIcon /><ListItemText primary="新規プロジェクト" /></ListItemIcon>
              </ListItemButton>
            </ListItem>
            <Divider />
            {projectList.map((project) => (
              <ListItem key={project} disablePadding>
                <ListItemButton onClick={() => {setProject(project);}}>
                  <ListItemIcon>
                    {projectName == project ? <KeyboardArrowRightIcon /> : null}
                    <ListItemText primary={project} />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
          </List>
        </Box>
      </Drawer>
      <CreateProjectComponent open={openCreateProject} setOpen={setOpenCreateProject} refreshProjectList={refreshProjectList} />
    </>
  );
});
