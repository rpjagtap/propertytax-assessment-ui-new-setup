import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Grid,
} from "@mui/material";
import { getCitizenApplications } from "../../services/assessment-services";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTransferNotice } from "../../services/assessment-services";

const ApplicationStatus = () => {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationNo = searchParams.get("applicationNo"); // read ?propertyCode=

  const handleNoticeClick = async (row) => {
    try {
      navigate("/property-transfer-notice", {
        state: {
          applicationNo: row.applicationNo,
          trackingId: row.trackingId,
        },
      });
    } catch (err) {
      console.error("Error navigating to notice", err);
    }
  };

  const handleOrderClick = (row) => {
    navigate("/property-transfer-order", {
      state: { applicationNo: row.applicationNo, trackingId: row.trackingId },
    });
  };

  const handleViewReceiptClick = (transferId) => {
    navigate("/view-receipt", { state: { transferId } });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const body = {
          applicationNo: applicationNo,
        };
        // TR2526000259
        const data = await getCitizenApplications(body);
        setRows(data.lstDetails || []);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }
    fetchData();
  }, []);

  //       useEffect(() => {
  //     async function fetchData() {
  //       if (!applicationNo) return; // don’t call API if empty
  //       try {
  //         const data = await getCitizenApplications({ applicationNo });
  //         setRows(data.lstDetails || []);
  //       } catch (err) {
  //         console.error("Error fetching dashboard data", err);
  //         setRows([]);
  //       }
  //     }
  //     fetchData();
  //   }, [applicationNo]); // runs every time applicationNo changes

  return (
    <Box sx={{ maxWidth: "100%", margin: "auto", mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // mb: 2,
          // backgroundColor: "#daf6a9ff",
          padding: 5,
        }}
      >
        <Box
          component="img"
          src="/pcmclogo.jpeg"
          alt="PCMC Logo"
          sx={{ width: 90, height: 90, mr: 2 }}
        />
        <Box>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            पिंपरी चिंचवड महानगरपालिका पिंपरी - ४११०१८
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
            कर आकारणी व कर संकलन विभाग
          </Typography>
          <Typography sx={{ fontSize: "0.9rem" }}>
            Help-line Number - 8888006666 Email - ptax@pcmcindia.gov.in
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: "#1E3A8A", height: "35px", mb: 2 }} />

      {/* Tip Text */}
      <Typography
        sx={{
          fontSize: "0.95rem",
          mb: 2,
          paddingLeft: "100px",
          paddingRight: "100px",
        }}
      >
        <b>टीप:</b> आपला मालमत्ता हस्तांतरण अर्ज क्रमांक प्राप्त झाला असून तो
        मंजूर केल्यानंतर मालमत्ता हस्तांतरण फी भरणेकरिता आपणास ई-मेलद्वारे
        कळविण्यात येईल. तसेच Dashboard ला या ठिकाणी आपले अर्जाबाबत अद्ययावत
        माहिती पाहोषणास मिळेल
      </Typography>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: "auto", width: "100%" }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e8f5e9", height: "40px" }}>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #ccc",
                  width: "3%",
                }}
              >
                Sr No
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #ccc",
                  width: "6%",
                }}
              >
                Application No
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #ccc",
                  width: "6%",
                }}
              >
                Applicant Name
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                Application Date
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                Property code
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                Property Address
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                New Owner Name
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #ccc",
                  width: "6%",
                }}
              >
                Status
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                Reason Of Rejection
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
              >
                Transfer Fees
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", minWidth: "250px" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <TableRow
                  key={i}
                  hover
                  sx={{
                    height: "40px",
                    "& .MuiTableCell-root": {
                      lineHeight: "40px",
                      padding: "0 8px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {i + 1}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.applicationNo}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.applicantName}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.applicationDate}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.propertyCode}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      whiteSpace: "pre-line",
                      borderRight: "1px solid #ccc",
                    }}
                  >
                    {row.propertyAddress}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.newOwnerName}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.status}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.reasonOfRejection || "reasonOfRejection"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #ccc" }}
                  >
                    {row.totalAmount || "-"}
                  </TableCell>
                  {/* <TableCell align="center">
                    <Button size="small" sx={{ textTransform: "none" }}>
                      View Receipt
                    </Button>
                    <Button size="small" sx={{ textTransform: "none" }}>
                      Notice
                    </Button>
                    <Button size="small" sx={{ textTransform: "none" }}>
                      Generate Order
                    </Button>
                  </TableCell> */}

                  <TableCell align="center">
                    {row.flag ? ( // check if flag exists
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {row.flag === "C" && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleViewReceiptClick(row.transferId)
                            }
                          >
                            View fees
                          </Button>
                        )}
                        {row.flag === "O" && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleViewReceiptClick(row.transferId)
                            }
                          >
                            Reupload Document{" "}
                          </Button>
                        )}

                        {row.flag === "D" && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() =>
                                handleViewReceiptClick(row.transferId)
                              }
                            >
                              View Fees
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => handleNoticeClick(row)}
                            >
                              Notice
                            </Button>
                          </>
                        )}
                        {row.flag === "Z" && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() =>
                                handleViewReceiptClick(row.transferId)
                              }
                            >
                              View Fees
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => handleNoticeClick(row)}
                            >
                              Notice
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleOrderClick(row)}
                            >
                              Generate Order
                            </Button>
                          </>
                        )}
                      </Box>
                    ) : (
                      "" // blank if flag is empty
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={11}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Steps Section */}
      <Box
        sx={{
          backgroundColor: "#fdecea",
          p: 2,
          mt: 3,
          borderRadius: "8px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Steps to follow property transfer Dashboard
            </Typography>
            <ol style={{ paddingLeft: "20px" }}>
              <li>
                After applying you can view the application on this Dashboard.
              </li>
              <li>Your application will be in pending status initially.</li>
              <li>
                Once approved by tax department, a payment link will be shown on
                the Dashboard.
              </li>
              <li>
                After successful payment, verification will be done by
                department.
              </li>
              <li>
                Once verified, Dashboard status will be shown as property
                Transferred.
              </li>
            </ol>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              मालमत्ता हस्तांतरण डॅशबोर्डचे टप्पे
            </Typography>
            <ol style={{ paddingLeft: "20px" }}>
              <li>अर्ज केल्यानंतर तुम्ही अर्ज पाहू शकता.</li>
              <li>सुरुवातीला तुमचा अर्ज पेंडिंग स्थितीत असेल.</li>
              <li>अर्ज मंजूर झाल्यावर डॅशबोर्डवर पेमेंट लिंक दिसेल.</li>
              <li>पेमेंट पूर्ण झाल्यानंतर विभागाकडून पडताळणी केली जाईल.</li>
              <li>पडताळणीनंतर, डॅशबोर्डवर मालमत्ता हस्तांतरीत स्थिती दिसेल.</li>
            </ol>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ApplicationStatus;
