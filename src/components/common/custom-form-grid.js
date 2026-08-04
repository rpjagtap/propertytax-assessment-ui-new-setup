import React from "react";
import { Grid } from "@mui/material";

export const FormLabel = ({ label, required = false }) => {
  return (
    <Grid
      item
      sm={4}
      xs={12}
      md={2}
      maxWidth="sm"
      container
      justifyContent={{ xs: "flex-start", sm: "flex-end", md: "flex-end" }}
      alignItems="center"
      padding="5px"
      fontSize="medium"
      sx={{ fontWeight: "600" }}
    >
      {required ? (
        <span>
          {label} <span style={{ color: "red" }}>*</span>
        </span>
      ) : (
        label
      )}
    </Grid>
  );
};

export const FormValue = ({ component }) => {
  return (
    <Grid
      item
      sm={6}
      xs={12}
      md={4}
      maxWidth="sm"
      container
      justifyContent={{ xs: "flex-start", sm: "flex-start", md: "flex-start" }}
      alignItems="center"
      padding="5px"
      fontSize="smaller"
    >
      {component}
    </Grid>
  );
};

export const GridRow = ({ children, ...props }) => {
  return (
    <Grid container direction="row" {...props}>
      {children}
    </Grid>
  );
};
