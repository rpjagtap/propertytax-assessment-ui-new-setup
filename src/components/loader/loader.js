// LoadingSpinner.js
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

const Loader = ({ message }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 9999,
    }}
  >
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <img
          src="/pcmclogo.jpeg"
          alt="Logo"
          style={{ width: "60%", height: "60%" }}
        />
      </Box>
    </Box>
    <Typography sx={{ marginTop: 2 }}>
      {message ? message : "Please wait..."}
    </Typography>
  </Box>
);

export default Loader;
