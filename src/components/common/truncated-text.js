import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { useState } from "react";

export const TruncatedText = ({ text, maxLength = 10 }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <>
      <Typography variant="caption" display="inline">
        {truncatedText}
      </Typography>
      {text.length > maxLength && (
        <Typography
          variant="caption"
          component="span"
          onClick={handleOpen}
          sx={{
            cursor: "pointer",
            color: "primary.main", // Or any color you prefer
            whiteSpace: "nowrap", // Prevent "Show More" from wrapping
          }}
        >
          show more
        </Typography>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="full-text-modal"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "1px solid #000",
            boxShadow: 10,
            p: 4,
            // width: 400,
            maxWidth: "80%", // Prevent modal from being too wide
            maxHeight: "80%", // Prevent modal from being too tall
            // overflowY: "auto", // Add scroll if content overflows
            width: 600, // Or a specific width if needed
            wordWrap: "break-word", // For long words
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {" "}
            <Typography id="full-text-modal" variant="h7" component="h2">
              Hearing close remark
            </Typography>
            <IconButton sx={{ color: "primary.main" }} onClick={handleClose} aria-label="close">
              <Close />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" id="modal-description" sx={{ mt: 2, overflow: "auto" }}>
            {text}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};
