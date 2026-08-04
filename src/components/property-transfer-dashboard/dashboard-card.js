import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getBuildingPermissionData } from "../../services/assessment-services";

const DashboardCard = () => {
  const [cards, setCards] = useState([]);

  // useEffect(() => {
  //   fetch("/data/dashboard-card.json") // keep JSON in public folder
  //     .then((res) => res.json())
  //     .then((data) => setCards(data.cards))
  //     .catch((err) => console.error("Error loading dashboard:", err));
  // }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Call your API
        const res = await getBuildingPermissionData();

        // Get first object from response
        const data = res?.lstAssessmentReportVO?.[0] || {};

        // Map API fields into cards dynamically
        const mappedCards = [
          { title: "एकूण मालमत्ता", value: data.totalApplications },
          {
            title: "नागरिकांकडे पोहच झालेल्या विशेष नोटीस संख्या",
            value: data.totalApplications,
          },
          {
            title: "नागरिकांनी आकारणी मान्य केलेल्या मालमत्ता (SR2)",
            value: data.sr2_generated,
          },
          { title: "हरकत घेतलेल्या मालमत्ता", value: data.totalHearing },
          {
            title: "हरकती नंतर सुनावणी झालेल्या मालमत्ता",
            value: data.gpZoSR3Pending,
          },
          {
            title:
              "सुनावणी नंतर मालमत्तेत बदल करून सृ३ साठी प्राप्त झालेल्या मालमत्ता (SR3)",
            value: data.changesDoneForSR3,
          },
          // { title: "सृ२ झालेल्या मालमत्ता", value: data.sr2_generated },
          { title: "सृ३ झालेल्या मालमत्ता (SR3)", value: data.sr3_generated },
        ];

        setCards(mappedCards);
      } catch (err) {
        console.error("Error fetching building permission data:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <Box
      sx={{ padding: "20px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#2c3e50",
          mb: 4,
          mt: 3,
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        🏗️ बांधकाम परवानगी विभाग - मालमत्तांचा तपशील
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              p: 3,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": { transform: "translateY(-5px)" },
              transition: "transform 0.2s",
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                color: "#34495e",
                mb: 1,
                fontWeight: "bold",
              }}
            >
              {card.title}
            </Typography>
            <Typography
              sx={{ fontSize: "28px", fontWeight: "bold", color: "#2c3e50" }}
            >
              {card.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardCard;
