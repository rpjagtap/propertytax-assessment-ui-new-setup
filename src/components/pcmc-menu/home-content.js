import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { keyframes } from "@emotion/react";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import StatusCards from "./status";

// ---- Shared civic identity tokens (kept in sync with Login / VerifyOtp) ----
const palette = {
  navy: "#12233F",
  navyDeep: "#0B1729",
  marigold: "#E8A33D",
  teal: "#4FB8C4",
  offWhite: "#F7F7F5",
  muted: "rgba(247,247,245,0.62)",
};

const fontDisplay =
  "'Georgia', 'Iowan Old Style', 'Palatino Linotype', serif";
const fontBody =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Quiet breathing pulse — signals "this is live," not decoration.
const pulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
`;

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = days[currentTime.getDay()];
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const dayOfMonth = currentTime.getDate();
  const year = currentTime.getFullYear();
  const month = currentTime.toLocaleString("default", { month: "short" });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
            borderRadius: 2.5,
            backgroundImage: `linear-gradient(160deg, ${palette.navy} 0%, ${palette.navyDeep} 100%)`,
            boxShadow: "0 12px 28px -12px rgba(18,35,63,0.45)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Icon badge */}
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(232,163,61,0.14)",
              border: `1px solid rgba(232,163,61,0.3)`,
            }}
          >
            <ScheduleOutlinedIcon sx={{ color: palette.marigold, fontSize: 22 }} />
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "1px",
              alignSelf: "stretch",
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />

          {/* Text stack */}
          <Box sx={{ minWidth: 168 }}>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: palette.marigold,
                lineHeight: 1,
              }}
            >
              {dayOfWeek}
            </Typography>

            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: 20,
                color: palette.offWhite,
                lineHeight: 1.3,
                mt: 0.5,
              }}
            >
              {dayOfMonth} {month} {year}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: palette.teal,
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              />
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: 13,
                  fontVariantNumeric: "tabular-nums",
                  color: palette.muted,
                  letterSpacing: "0.02em",
                }}
              >
                {formattedHours}:{minutes} {ampm}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* <StatusCards /> */}
    </>
  );
}