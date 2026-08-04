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
import { useSearchParams, useNavigate } from "react-router-dom";
import { getBasicPropertyDetails } from "../../services/assessment-services";

const ViewNumberOfProperties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyCode = searchParams.get("propertyCode"); // read ?propertyCode=
  const [properties, setProperties] = useState([]);

  // Fetch data when propertyCode changes
  useEffect(() => {
    if (propertyCode) {
      //  Call your API function
      getBasicPropertyDetails(propertyCode)
        .then((data) => {
          if (Array.isArray(data)) {
            setProperties(data);
          } else {
            setProperties([data]); // wrap in array if single object
          }
        })
        .catch((err) => console.error("Error fetching property details:", err));
    }
  }, [propertyCode]);

  // const handleShow = (prop) => {
  //   navigate(`/view-applications?propertyKey=${prop.propertyKey}`);
  // };

  return (
    <Box sx={{ maxWidth: "95%", margin: "auto", mt: 4 }}>
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eeebebff" }}>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium", paddingLeft: 2 }}
              >
                अ.क्र.
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                मालमत्ता क्र.
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                मालकाचे नाव
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "medium" }}
              >
                मालमत्तेचा पत्ता
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
            {properties.length > 0 ? (
              properties.map((prop, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{prop.propertyCode}</TableCell>
                  <TableCell align="center">{prop.propertyName}</TableCell>
                  <TableCell>{prop.propertyAddress}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      // onClick={() => handleShow(prop)}
                      onClick={() =>
                        navigate(
                          `/view-applications?propertyKey=${prop.propertyKey}`
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
                  no records found{" "}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewNumberOfProperties;
