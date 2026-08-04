import React from "react";
import PropTypes from "prop-types";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useField } from "formik";

const inputStyle = {
  "& .MuiInputBase-input": {
    fontSize: "smaller",
    height: { xs: "22px", md: "15px" },
    padding: "5px",
  },
  width: { xs: "100%", sm: "73%", md: "73%" },
};

const DateInput = ({ name,disabled }) => {
  const [field, meta, helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;

  const handleDateChange = (date) => {
    setValue(date ? dayjs(date).format("DD/MM/YYYY") : "");
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          name={name}
          value={value ? dayjs(value, "DD/MM/YYYY") : null}
          format="DD/MM/YYYY"
          sx={inputStyle}
          onChange={handleDateChange}
          textField={(params) => <input {...params} {...field} />}
          disabled={disabled}
        />
      </LocalizationProvider>
      {meta.touched && meta.error ? (
        <div style={{ color: "red", fontSize: "small" }}>{meta.error}</div>
      ) : null}
    </div>
  );
};

DateInput.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: false,
};

export default DateInput;
