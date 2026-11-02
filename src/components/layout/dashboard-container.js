import React from "react";
import { Box, Grid } from "@mui/material";
import DashboardHeader from "./dashboard-header";
import PoweredByFooter from "./powered-by-footer";

const DashBoardContainer = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",       // fill the whole screen
        display: "flex",
        flexDirection: "column",  // header, content, footer stacked
      }}
    >
      <DashboardHeader />

      <Grid
        sx={{
          flex: 1,                // content takes all free space
          marginBottom: "50px",
          marginLeft: "15px",
          marginRight: "15px",
        }}
      >
        {children}
      </Grid>

      <PoweredByFooter />
    </Box>
  );
};

DashBoardContainer.propTypes = {};

export default DashBoardContainer;