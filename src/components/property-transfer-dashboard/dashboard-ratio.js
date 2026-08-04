import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [zones, setZones] = useState([]);

  // Load JSON
  useEffect(() => {
    fetch("/data/dashboard-ratio.json")
      .then((res) => res.json())
      .then((data) => {
        setCards(data.cards);
        setZones(data.zones);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Title */}
      <Typography variant="h4" align="center" gutterBottom>
        अर्ज अहवाल डॅशबोर्ड
      </Typography>

      {/* Top cards */}
      <Grid container spacing={2} justifyContent="center" mb={2}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                backgroundColor: card.bg,
                color: card.color,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h6">{card.label}</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Typography variant="h6" mt={4} mb={1}>
        तपशीलवार झोन माहिती
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#212121" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>अ.क्र.</TableCell>
              <TableCell sx={{ color: "#fff" }}>झोन</TableCell>
              <TableCell sx={{ color: "#fff" }}>एकूण</TableCell>
              <TableCell sx={{ color: "#fff" }}>SR2</TableCell>
              <TableCell sx={{ color: "#fff" }}>SR3</TableCell>
              <TableCell sx={{ color: "#fff" }}>प्रलंबित</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.total}</TableCell>
                <TableCell>{row.SR2}</TableCell>
                <TableCell>{row.SR3}</TableCell>
                <TableCell>{row.pending}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Dashboard;
