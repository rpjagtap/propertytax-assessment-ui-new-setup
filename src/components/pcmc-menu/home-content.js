import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import StatusCards from "./status";
import { Grid } from "@mui/material";

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = days[currentTime.getDay()];
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const dayOfMonth = currentTime.getDate();
  const year = currentTime.getFullYear();
  const month = currentTime.toLocaleString("default", { month: "short" });

  // const hours = currentTime.getHours().toString().padStart(2, "0");
  // const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  // const seconds = currentTime.getSeconds().toString().padStart(2, "0");
  return (
    <>
      <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
        <Grid item xs={12} sm={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Card
            sx={{
              backgroundColor: "#f0f0f0",
              padding: 1,
              margin: 1,
              borderRadius: 2,
              width: "50%",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" sx={{ color: "gray" }}>
                {dayOfWeek}
              </Typography>
              <Typography variant="h5" sx={{ color: "black" }}>
                {dayOfMonth} {month} {year}
              </Typography>
              <Typography variant="body1" sx={{ color: "gray" }}>
                {formattedHours}:{minutes} {ampm}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* <StatusCards /> */}
    </>
  );
}
