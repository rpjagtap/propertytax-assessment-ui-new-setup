import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HttpsIcon from "@mui/icons-material/Https";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
const UnAuthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/home"); // Navigate to the home page
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
    >
      <Typography color="error" variant="h5" gutterBottom>
        <HttpsIcon />
      </Typography>
      <Typography color="error" variant="h5" gutterBottom>
        Unauthorized
      </Typography>
      <Typography variant="body1" paragraph>
        You don't have access for this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoBack}
        startIcon={<ArrowBackIcon />}
      >
        Go Back to Home
      </Button>
    </Box>
  );
};

export default UnAuthorized;
