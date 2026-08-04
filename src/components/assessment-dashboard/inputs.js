import React from "react";
import { MenuItem, Select, TextField } from "@mui/material";
import "./styles.css"; // Import the custom CSS
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export const SelectComponent = ({ options, id, value, name, handleInputChange, isDisabled }) => {
  return (
    <Select
      labelId={name}
      value={value}
      name={name}
      displayEmpty
      sx={{
        height: "30px",
        fontSize: "12px",
        minWidth: "150px",
      }}
      onChange={(e) => handleInputChange(id, name, e.target.value)}
      disabled={isDisabled}
    >
      <MenuItem value="">Select ...</MenuItem>
      {options.map((item, index) => {
        return (
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export const TextComponent = ({
  id,
  value,
  name,
  handleInputChange,
  required,
  isDisabled,
  multiline = false,
  maxLength = 300,
  handleOnBlur,
}) => {
  const [showHelperText, setShowHelperText] = React.useState(required && !value);
  const [limitText, setLimitText] = React.useState("");

  // Sync `showHelperText` with `value` changes
  React.useEffect(() => {
    if (required) {
      setShowHelperText(!value); // Update if the `value` changes
    } else {
      setShowHelperText(false);
    }
  }, [value, required]);
  const handleValueChange = (event) => {
    const inputValue = event.target.value;
    if (inputValue.length <= maxLength) {
      handleInputChange(id, name, inputValue,"onChange");
      setShowHelperText(required && !inputValue); // Show helper text only if the field is required and empty
    } else {
      setLimitText("Character limit exceeded");
    }
  };

  const handleOnBlurChange = (event) => {
    const inputValue = event.target.value;
    if (inputValue.length <= maxLength) {
      handleOnBlur(id, name, inputValue,"onBlur");
      setShowHelperText(required && !inputValue); // Show helper text only if the field is required and empty
    } else {
      setLimitText("Character limit exceeded");
    }
  };

  //   const handleBlur = (event) => {
  //     const inputValue = event.target.value;
  //     if (inputValue.length <= maxLength) {
  //       handleInputChange(id, name, inputValue);
  //       setShowHelperText(required && !inputValue); // Show helper text only if the field is required and empty
  //     } else {
  //       setLimitText("Character limit exceeded");
  //     }
  //   };

  return (
    <TextField
      className="custom-textfield"
      value={value}
      variant="outlined" // or "filled" or "standard"
      InputLabelProps={{
        shrink: true, // Ensure the label doesn't overlap
      }}
      //   onChange={handleValueChange}
      //   onBlur={handleValueChange}
      onChange={handleValueChange}
      onBlur={handleOnBlur ? handleOnBlurChange : undefined}
      required={required}
      helperText={
        showHelperText ? <span style={{ color: "red" }}>Required!!</span> : limitText ? limitText : ""
      }
      error={showHelperText}
      disabled={isDisabled}
      multiline={multiline}
      sx={{ padding: "0px !important" }}
      inputProps={{ maxLength: maxLength }}
    />
  );
};

export const DateComponent = ({ id, value, name, isDisabled, handleInputChange }) => {
  const handleDateChange = (date) => {
    const newDate = date ? dayjs(date).format("DD/MM/YYYY") : "";
    handleInputChange(id, name, newDate);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        className="custom-datefield"
        name={name}
        defaultValue={dayjs(value)}
        disabled={isDisabled}
        format="DD/MM/YYYY"
        value={value ? dayjs(value, "DD/MM/YYYY") : null}
        onChange={handleDateChange}
        style={{ width: "62px" }}
      />
    </LocalizationProvider>
  );
};

export const TimePickerComponent = ({ defaultValue, name, handleInputChange, id, isDisabled }) => {
  const [value, setValue] = React.useState(dayjs(defaultValue, "h:mm:A"));
  const handleTimeChange = (newValue) => {
    const formattedValue = newValue.format("h:mm:A");
    setValue(newValue);
    handleInputChange(id, name, formattedValue);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        className="custom-datefield"
        value={value}
        onChange={(newValue) => {
          handleTimeChange(newValue);
        }}
        disabled={isDisabled}
      />
    </LocalizationProvider>
  );
};
