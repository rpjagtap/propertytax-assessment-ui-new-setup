import { createTheme } from "@mui/material/styles";

/**
 * Central design tokens — pulled from the navy/green palette already
 * used across AddUser and PropertyTransferDashBoard.
 */
const colors = {
  navy: "#12233F",
  navyDark: "#0B1830",
  navyLight: "#1B3A63",
  green: "#5DCAA5",
  greenText: "#0F6E56",
  greenBg: "#E1F5EE",
  errorText: "#993C1D",
  errorBg: "#FAECE7",
  border: "#DDE3EC",
  textSecondary: "#5C6B84",
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.navy,
      dark: colors.navyDark,
      light: colors.navyLight,
      contrastText: "#fff",
    },
    secondary: {
      main: colors.green,
      contrastText: colors.navy,
    },
    success: { main: colors.greenText, light: colors.greenBg },
    error: { main: colors.errorText, light: colors.errorBg },
    text: { primary: colors.navy, secondary: colors.textSecondary },
    background: { default: "#F6F8FB" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    /* ---------- Text boxes ---------- */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          fontSize: 14,
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          "& fieldset": { borderColor: colors.border },
          "&:hover fieldset": { borderColor: colors.navyLight },
          "&.Mui-focused fieldset": {
            borderColor: colors.navy,
            borderWidth: 1.5,
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px rgba(18,35,63,0.08)`,
          },
          "&.Mui-disabled": { backgroundColor: "#F5F6F8" },
        },
        input: { padding: "10.5px 14px" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 14,
          color: colors.textSecondary,
          "&.Mui-focused": { color: colors.navy },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 2, fontSize: 12 },
      },
    },

    /* ---------- Dropdowns ---------- */
    MuiSelect: {
      styleOverrides: {
        select: { borderRadius: 10 },
        icon: { color: colors.textSecondary },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 4,
          boxShadow: "0 8px 24px rgba(18,35,63,0.14)",
          border: "1px solid #EEF1F6",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 14,
          borderRadius: 8,
          margin: "2px 6px",
          "&:hover": { backgroundColor: "rgba(93,202,165,0.12)" },
          "&.Mui-selected": {
            backgroundColor: colors.greenBg,
            color: colors.greenText,
            fontWeight: 600,
            "&:hover": { backgroundColor: colors.greenBg },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.border,
          "&.Mui-checked": { color: colors.greenText },
        },
      },
    },

    /* ---------- Calendar / date picker (MUI X) ---------- */
    MuiPickersDay: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 14,
          "&:hover": { backgroundColor: "rgba(93,202,165,0.15)" },
          "&.Mui-selected": {
            backgroundColor: `${colors.navy} !important`,
            color: "#fff",
            "&:hover": { backgroundColor: colors.navyLight },
            "&:focus": { backgroundColor: colors.navy },
          },
          "&.MuiPickersDay-today": {
            borderColor: colors.green,
          },
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          "& .MuiPickersCalendarHeader-label": {
            fontWeight: 600,
            color: colors.navy,
          },
        },
        switchViewIcon: { color: colors.navy },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: { color: colors.navy },
      },
    },
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: "0 12px 32px rgba(18,35,63,0.18)",
          border: "1px solid #EEF1F6",
          marginTop: 6,
          minWidth: 300,
          overflow: "hidden",
        },
      },
    },
    /* Year grid: force an explicit 3-column layout so cells never
       overflow the popper width (default flex-wrap sizing clips the
       right-most column and shows partial rows at top/bottom). */
    MuiYearCalendar: {
      styleOverrides: {
        root: {
          width: "100%",
          maxHeight: 280,
          padding: "4px 8px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          rowGap: 4,
        },
      },
    },
    MuiPickersYear: {
      styleOverrides: {
        root: {
          margin: 0,
          display: "flex",
          justifyContent: "center",
        },
        yearButton: {
          width: "100%",
          margin: 0,
          borderRadius: 8,
          fontSize: 15,
          "&.Mui-selected": {
            backgroundColor: `${colors.navy} !important`,
            color: "#fff",
          },
        },
      },
    },

    /* ---------- Buttons ---------- */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          paddingInline: 20,
          paddingBlock: 8,
          boxShadow: "none",
        },
        contained: {
          background: `linear-gradient(90deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          boxShadow: "0 4px 12px rgba(18,35,63,0.22)",
          "&:hover": {
            background: `linear-gradient(90deg, ${colors.navyDark} 0%, ${colors.navy} 100%)`,
            boxShadow: "0 6px 16px rgba(18,35,63,0.3)",
          },
          "&.Mui-disabled": {
            background: "#C9D0DC",
            color: "#fff",
          },
        },
        outlined: {
          borderColor: colors.navy,
          color: colors.navy,
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
            borderColor: colors.navy,
            backgroundColor: "rgba(18,35,63,0.05)",
          },
        },
        text: {
          color: colors.navy,
          "&:hover": { backgroundColor: "rgba(18,35,63,0.06)" },
        },
      },
    },

    /* ---------- Pagination ---------- */
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          "&.Mui-selected": {
            backgroundColor: colors.navy,
            color: "#fff",
            "&:hover": { backgroundColor: colors.navyLight },
          },
        },
      },
    },

    /* ---------- Surfaces ---------- */
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 14 } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 14 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.navy,
          fontSize: 12,
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;