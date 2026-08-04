import React, { useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import { Search } from "@mui/icons-material";
import { Checkbox } from "@mui/material"; // make sure added
import { approved_property_type } from "../../services/assessment-services"; // make sure this API exists
import { sendToZoDashboard } from "../../services/assessment-services"; // make sure this API exists
import { useNavigate } from "react-router-dom";
import {
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
} from "@mui/material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import FormTitle from "../form-fields/form-title";
import { getPropertyDetailsForTransfer } from "../../services/assessment-services";

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
        // propertykey: value,
      });

      console.log("API Response:", res);

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

    await sendToZoDashboard(
      propertyData.propertyKey,
      propertyData.redZone
    );

    alert("Data sent to ZO Dashboard successfully");

    // Redirect to starting page
    // navigate("/property-type"); // change route as per your app
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
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => setError("")}
        />
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <FormikProvider value={formik}>
          <Form>
            <Paper elevation={4} sx={{ p: 3 }}>
              <FormTitle title="Property Type" />

              {/* Input Row */}
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={2}
              >
                <Box width="200px">
                  <Typography fontWeight="bold">
                    Property / Mobile No.
                  </Typography>
                </Box>

                <TextField
                  variant="outlined"
                  size="small"
                  value={formik.values.searchPropertyBy}
                  onChange={(e) => {
                    const val = e.target.value;

                    // allow numbers + dot
                    if (/^[0-9.]*$/.test(val)) {
                      formik.setFieldValue("searchPropertyBy", val);
                    }
                  }}
                  inputProps={{ maxLength: 15 }}
                  sx={{ width: "350px" }}
                />
              </Box>

              {/* Button */}
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={<Search />}
                  sx={{ px: 4 }}
                >
                  SEARCH
                </Button>
              </Box>

              {/* RESULT TABLE */}
              {propertyData && (
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#e6eaeb" }}>
                        <TableCell align="center">Sr No</TableCell>
                        <TableCell align="center">Property Code</TableCell>
                        <TableCell align="center">Property Name</TableCell>
                        <TableCell align="center">Address</TableCell>                        
                        <TableCell align="center">Red Zone</TableCell> {/* ✅ added */}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow>
                        <TableCell align="center">1</TableCell>
                        <TableCell align="center">
                          {propertyData.propertyCode || "-"}
                        </TableCell>
                        <TableCell align="center">
                          {propertyData.propertyName || "-"}
                        </TableCell>
                        <TableCell align="center">
                          {propertyData.propertyAddress || "-"}
                        </TableCell>                        
                        <TableCell align="center">
                          <Checkbox
                            checked={propertyData.redZone || false}
                            onChange={(e) => {
                              setPropertyData({
                                ...propertyData,
                                redZone: e.target.checked,
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell align="center" colSpan={6}>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={handleSubmitRedZone}
                          >
                            SUBMIT
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Form>
        </FormikProvider>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(PropertyType);