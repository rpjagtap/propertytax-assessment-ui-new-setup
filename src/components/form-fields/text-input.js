import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { useField } from "formik";

const TextInput = ({ name, onBlur, onChange, disabled=false, InputProps = {}, ...props }) => {
  const [field, meta] = useField(name);

  const handleChange = (event) => {
    field.onChange(event); // Formik's onChange
    if (onChange) {
      onChange(event); // Call the passed onChange prop
    }
  };

  const handleBlur = (event) => {
    field.onBlur(event); // Formik's onBlur
    if (onBlur) {
      onBlur(event); // Call the passed onBlur prop
    }
  };

  const inputStyle = {
    "& .MuiInputBase-input": {
      fontSize: "smaller",
      height: { xs: "22px", md: "15px" },
      padding: "5px",
      backgroundColor: disabled ? "#d7d5d5" : "inherit", // Gray background for read-only
      color: disabled ? "#000" : "inherit", // Gray text for read-only
    },
    width: { xs: "100%", md: "90%" },
  };

  return (
    <TextField
      {...field}
      {...props}
      onChange={handleChange} // Use the custom handleChange
      onBlur={handleBlur} // Use the custom handleBlur
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      sx={inputStyle}
      InputProps={{
        ...InputProps,
        disabled: disabled, // Pass the readOnly prop to the input element
      }}
    />
  );
};

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
};

export default TextInput;
