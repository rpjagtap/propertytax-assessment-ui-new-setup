import React, { useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "@mui/material";

const theme = createTheme({
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#1976d2",
            color: "white",
            "&:hover": {
              backgroundColor: "#115293",
            },
          },
        },
      },
    },
  },
});
const LanguageSelector = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const dispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState(lang);

  const handleChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setSelectedLanguage(newLanguage);
      dispatch({
        type: "SET_LANG",
        payload: newLanguage,
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="center" alignItems="center">
        <ToggleButtonGroup
          value={selectedLanguage}
          exclusive
          onChange={handleChange}
          aria-label="language selection"
          sx={{ height: "18px", paddingRight: "10px" }}
        >
          <Tooltip title="मराठी" arrow>
            <ToggleButton
              value="ma"
              aria-label="मराठी"
              sx={{
                backgroundColor: "#f0f0f0",
                color: "#12233F",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                },
              }}
            >
              अ
            </ToggleButton>
          </Tooltip>
          <Tooltip title="English" arrow>
            <ToggleButton
              value="en"
              aria-label="English"
              sx={{
                backgroundColor: "#f0f0f0",
                color: "#12233F",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                },
              }}
            >
              EN
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
    </ThemeProvider>
  );
};

export default LanguageSelector;
