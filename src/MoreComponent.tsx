import React from "react";
import { Box, IconButton, Popover } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LoadingButton } from "@mui/lab";

export const MoreComponent = React.forwardRef((props: { sx: any, savePython: () => Promise<void> }, ref) => {
  const { sx, savePython } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [loading, setLoading] = React.useState(false);

  const clickedSavePython = async () => {
    setLoading(true);
    await savePython();
    setLoading(false);
  }

  return (
    <>
      <IconButton color="inherit" sx={sx} aria-describedby={id} onClick={(event) => { setAnchorEl(event.currentTarget); }} >
        <MoreVertIcon />
      </IconButton>
      <Popover id={id} open={open} anchorEl={anchorEl} onClose={() => { setAnchorEl(null); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} transformOrigin={{ vertical: 'top', horizontal: 'right', }}>
        <Box sx={{ m: 1 }}>
          <LoadingButton size="small" variant="outlined" loading={loading} fullWidth onClick={clickedSavePython}>Python 出力</LoadingButton>
        </Box>
      </Popover>
    </>
  );
});
