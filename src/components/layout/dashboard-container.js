import React from "react";
import { Grid } from "@mui/material";
import DashboardHeader from "./dashboard-header";

const DashBoardContainer = ({ children }) => {
  return (
    <>
      <DashboardHeader />
      <Grid sx={{ marginBottom: "50px", marginLeft: "15px", marginRight: "15px" }}>
        {children}
      </Grid>
      {/* <Container sx={{ marginBottom: "50px", maxWidth: false }}>{children}</Container> */}
    </>
  );
};

DashBoardContainer.propTypes = {};

export default DashBoardContainer;
