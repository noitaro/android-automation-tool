import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";

export const OutputDoneDialogComponent = React.forwardRef((props: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }, ref) => {
  const { open, setOpen } = props;

  return (
    <Dialog onClose={() => {setOpen(false);}} open={open}>
    <DialogContent>
      <DialogContentText>
        Python の出力が完了しました。
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => {setOpen(false);}}>閉じる</Button>
    </DialogActions>
    </Dialog>
  );
});
