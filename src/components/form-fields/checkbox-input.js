import React from "react";
import PropTypes from "prop-types";
import { useField } from "formik";
import { Checkbox } from "@mui/material"; // Note the correct import from MUI

const CheckBoxInput = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (event) => {
    helpers.setValue(event.target.checked); // Manually update the value in Formik
  };

  return (
    <Checkbox
      {...field}
      {...props}
      checked={field.value || false} // Set checked based on the field value
      color="primary"
      onChange={handleChange}
      error={meta.touched && Boolean(meta.error)}
    />
  );
};

CheckBoxInput.propTypes = {
  name: PropTypes.string.isRequired,
};

export default CheckBoxInput;