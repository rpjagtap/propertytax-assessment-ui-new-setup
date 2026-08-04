import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";

const FormTitle = ({ title }) => {
  return (
    <Grid
      container
      justifyContent="Left"
      alignItems="Left"
      style={{ background: "#e4f0f4", height: "40px", width: "100%",padding:"10px" }}
      mt="15px"
      fontSize="large"
      fontWeight={600}
    >
      {title}
    </Grid>
  );
};

FormTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export default FormTitle;
