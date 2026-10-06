import React, { useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import { Search } from "@mui/icons-material";
import {
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import { useNavigate } from "react-router-dom";
import { approved_property_type } from "../../services/assessment-services"; // make sure this API exists
import { sendToZoDashboard } from "../../services/assessment-services"; // make sure this API exists
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { getPropertyDetailsForTransfer } from "../../services/assessment-services";

// Theme tokens — same values used across the other redesigned pages.
// Kept local so this file has no dependency on any shared common/
// component that might not exist in the project.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const headCellSx = {
  bgcolor: NAVY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

// Reusable results card header (avatar + title + optional right side)
const ResultsHeader = ({ title, right }) => (
  <>
    <Box
      sx={{
        px: 2.5,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 34, height: 34, bgcolor: MINT_BG, color: MINT }}>
          <FactCheckOutlined fontSize="small" />
        </Avatar>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: NAVY }}>
          {title}
        </Typography>
      </Stack>
      {right}
    </Box>
    <Divider />
  </>
);

const PropertyType = () => {
  const { loading, setLoading, error, setError } = useApiState();

  const [propertyData, setPropertyData] = useState(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      searchPropertyBy: "",
    },
  });

  const handleSubmit = async () => {
    const value = formik.values.searchPropertyBy;

    if (!value) {
      setError("Please enter Property Code");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await getPropertyDetailsForTransfer({
        propertyCode: value,
      });

      const data = res?.propertyTransactionVO || res;

      setPropertyData(data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch property");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRedZone = async () => {
    try {
      setLoading(true);
      setError("");

      await sendToZoDashboard(propertyData.propertyKey, propertyData.redZone);

      alert("Data sent to ZO Dashboard successfully");

      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Failed to send data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashBoardContainer>
      {error && (
        <AlertMsg message={error} severity="error" onClose={() => setError("")} />
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {/* ---------- Filter card ---------- */}
          <FormikProvider value={formik}>
            <Form>
              <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
                {/* Header band */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "#5DCAA5",
                    }}
                  >
                    <HomeWorkOutlined />
                  </Avatar>
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                      Property Type
                    </Typography>
                    <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                      Look up a property by code or mobile number and mark its red zone status.
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ px: 3, py: 3 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={<SearchOutlined sx={{ color: "text.secondary" }} />}
                      title="Search criteria"
                      titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                      subheader="Enter a property code or mobile number to look up the record"
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        justifyContent="center"
                        alignItems={{ xs: "stretch", sm: "center" }}
                        gap={2}
                      >
                        <Box width={{ xs: "100%", sm: "220px" }}>
                          <Typography fontWeight={600} fontSize={14} color={NAVY}>
                            Property / Mobile No.
                          </Typography>
                        </Box>

                        <TextField
                          variant="outlined"
                          size="small"
                          value={formik.values.searchPropertyBy}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9.]*$/.test(val)) {
                              formik.setFieldValue("searchPropertyBy", val);
                            }
                          }}
                          inputProps={{ maxLength: 15 }}
                          sx={{ width: { xs: "100%", sm: "350px" } }}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      endIcon={<Search />}
                      sx={{
                        px: 4,
                        textTransform: "none",
                        borderRadius: 2,
                        bgcolor: NAVY,
                        "&:hover": { bgcolor: NAVY_LIGHT },
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Form>
          </FormikProvider>

          {/* ---------- Results ---------- */}
          {propertyData && (
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <ResultsHeader
                title="Property details"
                right={
                  propertyData.redZone !== undefined && (
                    <Chip
                      label={propertyData.redZone ? "Red zone" : "Not in red zone"}
                      sx={{
                        bgcolor: propertyData.redZone ? "#FAECE7" : MINT_BG,
                        color: propertyData.redZone ? "#993C1D" : MINT,
                        fontWeight: 600,
                      }}
                    />
                  )
                }
              />

              <Box sx={{ p: 2 }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={headCellSx}>Sr No</TableCell>
                        <TableCell align="center" sx={headCellSx}>Property Code</TableCell>
                        <TableCell align="center" sx={headCellSx}>Property Name</TableCell>
                        <TableCell align="center" sx={headCellSx}>Address</TableCell>
                        <TableCell align="center" sx={headCellSx}>Red Zone</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow hover>
                        <TableCell align="center">1</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          {propertyData.propertyCode || "-"}
                        </TableCell>
                        <TableCell align="center">{propertyData.propertyName || "-"}</TableCell>
                        <TableCell align="center">{propertyData.propertyAddress || "-"}</TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={propertyData.redZone || false}
                            onChange={(e) => {
                              setPropertyData({
                                ...propertyData,
                                redZone: e.target.checked,
                              });
                            }}
                            sx={{
                              color: "#DDE3EC",
                              "&.Mui-checked": { color: MINT },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitRedZone}
                    sx={{
                      px: 4,
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: MINT,
                      "&:hover": { bgcolor: "#0B5A46" },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(PropertyType);