import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCitizenDashboard } from "../../services/assessment-services";

const ViewApplications = () => {
  const [searchParams] = useSearchParams();
  const propertyKey = searchParams.get("propertyKey"); // read from URL
  const [applications, setApplications] = useState([]); // use applications array
  const navigate = useNavigate();

  useEffect(() => {
    if (propertyKey) {
      getCitizenDashboard(propertyKey)
        .then((data) => {
          if (data && Array.isArray(data.lstDetails)) {
            setApplications(data.lstDetails);
          } else {
            setApplications([]);
          }
        })
        .catch((err) =>
          console.error("Error fetching citizen dashboard:", err)
        );
    }
  }, [propertyKey]);

  return (
    <Box sx={{ maxWidth: "95%", margin: "auto", mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          component="img"
          src="/pcmclogo.jpeg"
          alt="PCMC Logo"
          sx={{ width: 80, height: 80, mr: 2 }}
        />
        <Box>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: "bold" }}>
            पिंपरी चिंचवड महानगरपालिका, पिंपरी - ४११०१८
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
            कर संकलन विभाग
          </Typography>
        </Box>
      </Box>

      {/* Blue Horizontal Line */}
      <Divider sx={{ backgroundColor: "#1E3A8A", height: "35px", mb: 2 }} />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, border: "1px solid #ccc" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium", pl: 4 }}
              >
                अ.क्र.
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                अर्ज
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                अर्ज क्र.
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                अर्ज दिनांक
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{app.transactiontype}</TableCell>
                  <TableCell align="center">{app.applicationNo}</TableCell>
                  <TableCell align="center">{app.applicationDate}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(
                          `/application-status?applicationNo=${app.applicationNo}`
                        )
                      }
                    >
                      Show
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewApplications;
