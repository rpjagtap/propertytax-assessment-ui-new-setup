import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const ConfirmationDialog = ({
  open,
  title,
  description,
  handleClose,
  handleApprove,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          padding: "10px",
          fontSize: "15px",
          fontWeight: "600",
        }}
      >
        <WarningIcon sx={{ marginRight: 1 }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography
          id="confirmation-dialog-description"
          sx={{ fontWeight: "500" }}
        >
          {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          size="small"
          variant="contained"
          color="warning"
          sx={{ background: "red" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApprove}
          variant="contained"
          size="small"
          color="success"
          autoFocus
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
