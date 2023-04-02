import React from "react";
import { Alert, FormControl, InputLabel, MenuItem, Popover, Select, SelectChangeEvent, Snackbar, } from "@mui/material";
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import Button from "@mui/material/Button";
import { Box } from "@mui/system";
import { LoadingButton } from "@mui/lab";
import { tauri } from '@tauri-apps/api';

export interface DeviceSelectComponentHandles {
  getDevice(): string;
}

export const DeviceSelectComponent = React.forwardRef((props: { sx: any, adbPath: string, setDevice: React.Dispatch<React.SetStateAction<string>> }, ref) => {
  const { sx, adbPath, setDevice } = props;
  const [age, setAge] = React.useState('');

  React.useImperativeHandle(ref, () => ({
    getDevice() {
      return age;
    }
  }));

  React.useEffect(() => {
    setDevice(age);
  }, [age]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [loading, setLoading] = React.useState(false);
  const [devices, setDevices] = React.useState<string[]>([]);
  const clickedReload = async () => {
    setLoading(true);
    setAge("");
    setDevices([]);

    try {
      const result: string = await tauri.invoke('adb_devices_command', { adb: adbPath });

      const lst = result.split("\n");

      const tmp: string[] = [];
      lst.forEach(item => {
        const cols = item.split("\t");
        if (cols.length == 2) {
          tmp.push(cols[0]);
        }
      });

      if (tmp.length >= 1) {
        setDevices(tmp);
        setAge(tmp[0]);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error as string);
      setOpenSnackbar(true);
    }

    setLoading(false);
  }

  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('error message');


  return (
    <>
      <Button variant="contained" disableElevation aria-describedby={id} onClick={(event) => { setAnchorEl(event.currentTarget); }} sx={sx}>
        <DeviceUnknownIcon />
      </Button>
      <Popover id={id} open={open} anchorEl={anchorEl} onClose={() => { setAnchorEl(null); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }} transformOrigin={{ vertical: 'top', horizontal: 'center', }}>
        <Box sx={{ m: 1 }}>
          <LoadingButton size="small" variant="outlined" loading={loading} fullWidth onClick={clickedReload}>端末リスト最新化</LoadingButton>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel size="small">端末</InputLabel>
            <Select value={age} label="端末" onChange={(event) => { setAge(event.target.value as string); }} size="small">
              {devices.map((device) => (
                <MenuItem key={device} value={device}>{device}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Popover>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => { setOpenSnackbar(false); }}>
        <Alert onClose={() => { setOpenSnackbar(false); }} severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
      </Snackbar>
    </>
  );
});
