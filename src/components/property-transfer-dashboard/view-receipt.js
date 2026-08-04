import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Table,
  Typography,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import { useLocation, useSearchParams } from "react-router-dom";
import DashBoardContainer from "../layout/dashboard-container";

import {
  getCitizenApplications,
  viewTransferFees,
} from "../../services/assessment-services";

const ViewReceipt = () => {
  const location = useLocation();
  const transferId = location.state?.transferId;
  const [applicationData, setApplicationData] = useState(null);
  const [feesData, setFeesData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transferId) {
      const fetchApplicationData = async () => {
        try {
          const body = { transferId }; // API needs transferId in body
          const res = await viewTransferFees(body);

          if (res) {
            setApplicationData(res);
            setFeesData(res.feesCalculationRO);
            console.log("Application Data:", res);
          }

          // setApplicationData(res);
        } catch (error) {
          console.error("Error fetching receipt data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchApplicationData();
    } else {
      setLoading(false);
    }
  }, [transferId]);

  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            width: 100px;
            height: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .label {
            font-weight: bold;
            width: 200px;
            display: inline-block;
          }
          .row {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/pcmc_logo.png" alt="PCMC Logo" />
          <h2>PCMC Official Document</h2>
        </div>
        ${content}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <Box p={4}>
        <Button variant="contained" onClick={handlePrint} sx={{ mb: 2 }}>
          Print
        </Button>

        <Box
          ref={printRef}
          sx={{
            border: "2px solid #000", // Black border
            borderRadius: "8px", // Rounded corners (optional)
            padding: "16px", // Add padding inside the border
            marginTop: "16px", // Add some margin on top
            width: "100%",
          }}
        >
          <img
            class="MuiBox-root"
            height="80px"
            src="/pcmclogo.jpeg"
            alt="Logo"
            style={{ marginLeft: "32%" }}
          ></img>

          <Typography
            variant="h6"
            align="center"
            marginTop="-3.7em"
            fontWeight={800}
            gutterBottom
          >
            पिंपरी चिंचवड महानगरपालिका
          </Typography>
          <Typography align="center" fontWeight={550} gutterBottom>
            कर आकारणी व कर संकलन विभाग
          </Typography>

          <Box mt={5}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "bold", mt: 2, mb: 1 }}
            >
              अर्जदाराची संपूर्ण माहिती{" "}
            </Typography>

            <Grid container spacing={2}>
              {/* Row 1 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्ज क्र.:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.applicationNo || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्जदाराचे नाव:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.applicantName || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मोबाईल:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                    {applicationData?.mobileNo || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    ई-मेल:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.email || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>

              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्जदाराचा पत्ता:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                    {applicationData?.applicantAddress || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्ज दिनांक:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.applicationDate || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>
            </Grid>
          </Box>

          <Box mt={5}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "bold", mt: 2, mb: 1 }}
            >
              मालमत्तेचा तपशील{" "}
            </Typography>

            <Grid container spacing={2}>
              {/* Row 1 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्ता क्र.:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.propertyCode || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्तेचे नाव:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.ownerName || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    क्षेत्रफळ:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                    {applicationData?.totalArea || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    वापर:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.finalUseType || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>

              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्तेचा पत्ता:
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                    {applicationData?.propertyAddress || "-"}
                  </span>
                </div>
              </Grid>

              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>
            </Grid>
          </Box>
          {feesData.map((feeItem, index) => (
            <Box key={index} mt={4}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <div className="row" style={{ display: "flex" }}>
                    <span className="label" style={{ fontWeight: "normal" }}>
                      दस्तऐवज प्रकार:
                    </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        marginLeft: "6px",
                      }}
                    >
                      {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                      {feeItem?.documentType || "-"}
                    </span>
                  </div>
                </Grid>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        अ.क्र.
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        कराचे नाव
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        रक्कम (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeItem.feesCalculationDetails.map((fee, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{fee.propertyTaxName}</TableCell>
                        <TableCell>{fee.amount}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right">
                        <strong>एकूण</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{feeItem.totalAmount}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default ViewReceipt;
