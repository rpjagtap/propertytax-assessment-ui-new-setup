import React from "react";
import { useField } from "formik";
import TextField from "@mui/material/TextField";

const NumericTextInput = ({ name, onBlur, onChange, disabled=false, InputProps = {}, maxLength, ...props }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (e) => {
    // Remove non-digit characters
    let value = e.target.value.replace(/\D/g, "");

    // Limit length
    if (maxLength) {
      value = value.slice(0, maxLength);
    }

    helpers.setValue(value);
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
      value={field.value || ""}
      onChange={handleChange}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      sx={inputStyle}
    />
  );
};

export default NumericTextInput;