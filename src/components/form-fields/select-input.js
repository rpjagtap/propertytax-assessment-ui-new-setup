import React from "react";
import PropTypes from "prop-types";
import { MenuItem, Select, FormHelperText, FormControl } from "@mui/material";
import { useField } from "formik";

const inputSelectStyle = {
  "& .MuiSelect-select": {
    fontSize: "smaller",
    height: { xs: "22px", md: "15px" },
    padding: "3px",
  },
  width: { xs: "100%", md: "100%" },
};

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
      width: "20%", // You can set a fixed width or use 'auto'
    },
  },
};

const SelectInput = ({ name, options, required, onChange, ...props }) => {
  const [field, meta] = useField(name);
  const handleChange = (event) => {
    // console.log("!!event from select", event);
    field.onChange(event); // Formik's onChange
    if (onChange) {
      onChange(event); // Call the passed onChange prop
    }
  };
  // const isEmptyValue = (val) => {
  //   return val === "" || val === undefined || val === null;
  // };


  return (
    <FormControl
      sx={{ width: { xs: "100%", md: "90%" } }}
      error={meta.touched && Boolean(meta.error)}
    >
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        {...field}
        {...props}
        sx={inputSelectStyle}
        displayEmpty
        MenuProps={menuProps}
        onChange={handleChange} // Use the custom handleChange
      >
        <MenuItem value="" sx={{ fontSize: "12px", fontWeight: "600" }}>
          Choose One
        </MenuItem>
        {options.map((option, index) => (
          <MenuItem
            key={index}
            value={option.value || option.id || option.bankkey}
            defaultValue=""
            sx={{ fontSize: "12px", fontWeight: "600" }}
          >
            {option.label ||
              option.modeofpayment ||
              option.bankname ||
              option.name}
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

SelectInput.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      id: PropTypes.any,
      label: PropTypes.string,
      modeofpayment: PropTypes.any,
      bankkey: PropTypes.any,
      bankname: PropTypes.string,
    })
  ).isRequired,
  required: PropTypes.bool,
};

export default SelectInput;
