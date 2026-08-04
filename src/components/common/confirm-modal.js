import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Alert,
} from "@mui/material";

function ShowAlertModal({ msg }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open the modal
    //   const handleOpen = () => {
    setOpen(true);
    //   };
  }, []);

  // Close the modal
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Alert severity="warning">{msg}</Alert>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ShowAlertModal;
