import React from "react";
import { Alert } from "@mui/material";
import { errorMsg } from "../../utils/constants";

const AlertMsg = ({ message, severity, onClose }) => {
  return (
    // <Box
    //   sx={{
    //     display: "flex", // Use flexbox for layout
    //     justifyContent: "center", // Center horizontally within the parent container
    //     alignItems: "center", // Center vertically within the parent container
    //     width: "100%", // Ensure the Box takes the full width of its container
    //     height: "100%",
    //     margin: "5px", // Ensure the Box takes the full height of its container
    //   }}
    // >
    <Alert
      sx={{
        padding: "0px",
        paddingLeft: "10px",
        paddingRight: "10px",
        marginTop: "15px",
      }}
      severity="error"
      onClose={onClose}
    >
      {message || errorMsg}
    </Alert>

    // </Box>
  );
};

export default AlertMsg;
