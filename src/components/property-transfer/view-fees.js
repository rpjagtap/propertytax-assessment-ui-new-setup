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
  GlobalStyles,
} from "@mui/material";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import DashBoardContainer from "../layout/dashboard-container";

import {
  getCitizenApplications,
  viewTransferFees,
} from "../../services/assessment-services";

const ViewReceipt = () => {
  const location = useLocation();
  const from = location.state?.from;

  const navigate = useNavigate(); // initialize navigate

  const transferId = location.state?.transferId;
  const [applicationData, setApplicationData] = useState(null);
  const [feesData, setFeesData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // dd/mm/yyyy
    setCurrentDate(formattedDate);

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

  // const printRef = useRef();

  // const handlePrint = () => {
  //   const content = printRef.current.innerHTML;
  //   const printWindow = window.open("", "_blank", "width=800,height=600");
  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Print</title>
  //       <style>
  //         body {
  //           font-family: 'Arial', sans-serif;
  //           padding: 20px;
  //         }
  //         .header {
  //           text-align: center;
  //           margin-bottom: 20px;
  //         }
  //         .header img {
  //           width: 100px;
  //           height: auto;
  //         }
  //         table {
  //           width: 100%;
  //           border-collapse: collapse;
  //           margin-top: 20px;
  //         }
  //         th, td {
  //           border: 1px solid #ccc;
  //           padding: 8px;
  //           text-align: center;
  //         }
  //         th {
  //           background-color: #f0f0f0;
  //           font-weight: bold;
  //         }
  //         .label {
  //           font-weight: bold;
  //           width: 200px;
  //           display: inline-block;
  //         }
  //         .row {
  //           margin-bottom: 8px;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="header">
  //         <img src="${window.location.origin}/pcmc_logo.png" alt="PCMC Logo" />
  //         <h2>PCMC Official Document</h2>
  //       </div>
  //       ${content}
  //     </body>
  //   </html>
  // `);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1); // goes back to the previous page
  };

  // const handleBack = () => {
  //   if (from === "TRACK_APPLICATION_STATUS") {
  //     navigate("/track-application-status", { replace: true });
  //   } else {
  //     navigate("/applications-status", { replace: true });
  //   }
  // };

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            ".print-hide": {
              display: "none !important",
            },
          },
        }}
      />
      <style>
        {`
                @media print {
                  button .print-hide {
                    display: none;
                  }
                }
              `}
      </style>

      <Box mt={15}>
        {/* <Button
          variant="contained"
          className="print-hide"
          onClick={handlePrint}
          sx={{ marginLeft: "30%", marginTop: "-12%" }}
        >
          Print
        </Button>
         */}

        <Box
          sx={{
            textAlign: "right",
            mb: 12,
            mt: -15,
            mx: 35,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            className="print-hide"
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="contained"
            color="secondary"
            className="print-hide"
            onClick={handleBack}
          >
            Back
          </Button>
        </Box>

        <Box
          // ref={printRef}
          sx={{
            justifyContent: "center",
            border: "2px solid #f2ededff", // Black border
            borderRadius: "8px", // Rounded corners (optional)
            padding: "16px", // Add padding inside the border
            marginTop: "-7.5%", // Add some margin on top
            width: "50%",
            marginLeft: "23.8%",
            // backgroundColor: " #f4f0f0ff",
          }}
        >
          <img
            class="MuiBox-root"
            height="80px"
            src="/pcmclogo.jpeg"
            alt="Logo"
            style={{ marginLeft: "15%", marginTop: "-10px" }}
          ></img>

          <Typography
            variant="h6"
            align="center"
            marginTop="-4em"
            fontWeight={800}
            marginLeft="70px"
            gutterBottom
          >
            पिंपरी चिंचवड महानगरपालिका
          </Typography>
          <Typography
            align="center"
            fontWeight={700}
            marginTop={-0.5}
            marginLeft="70px"
            gutterBottom
          >
            कर आकारणी व कर संकलन विभाग
          </Typography>

          <Box mt={2}>
            {/* <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              अर्जदाराची संपूर्ण माहिती{" "}
            </Typography> */}

            <Grid container spacing={0.5} sx={{ mt: 1 }}>
              {/* Row 1 */}
              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>

              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्ज क्र.:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                      marginTop: "2px",
                    }}
                  >
                    {applicationData?.applicationNo || "-"}
                  </span>{" "}
                </div>
              </Grid>
              <Grid item xs={6}>
                <div
                  className="row"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्जदाराचे नाव:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.applicantName || "-"}
                  </span>{" "}
                </div>
              </Grid>
              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid> */}

              {/* Row 2 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मोबाईल:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
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
                <div
                  className="row"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <span className="label" style={{ fontWeight: "normal" }}>
                    ई-मेल:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.email || "-"}
                  </span>{" "}
                </div>
              </Grid>
              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid> */}

              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्जदाराचा पत्ता:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
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
                <div
                  className="row"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <span className="label" style={{ fontWeight: "normal" }}>
                    अर्ज दिनांक:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.applicationDate || "-"}
                  </span>{" "}
                </div>
              </Grid>
              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc" }} />
              </Grid> */}
            </Grid>
          </Box>

          <Box>
            {/* <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              मालमत्तेचा तपशील{" "}
            </Typography> */}

            <Grid container spacing={0.5} sx={{ mt: 1 }}>
              {/* Row 1 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्ता क्र.:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                      marginTop: "2px",
                    }}
                  >
                    {applicationData?.propertyCode || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div
                  className="row"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्तेचे नाव:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.ownerName || "-"}
                  </span>
                </div>
              </Grid>
              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid> */}

              {/* Row 2 */}
              <Grid item xs={6}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    क्षेत्रफळ:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                      marginTop: "2px",
                    }}
                  >
                    {/* {applicationData?.propertyTransferDetails?.[0]
                      ?.transferArea || "-"} */}
                    {applicationData?.totalArea || "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div
                  className="row"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <span className="label" style={{ fontWeight: "normal" }}>
                    वापर:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      marginLeft: "6px",
                    }}
                  >
                    {applicationData?.finalUseType || "-"}
                  </span>
                </div>
              </Grid>
              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid> */}

              <Grid item xs={12}>
                <div className="row" style={{ display: "flex" }}>
                  <span className="label" style={{ fontWeight: "normal" }}>
                    मालमत्तेचा पत्ता:
                  </span>
                  <span
                    style={{
                      fontWeight: "normal",
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

              {/* <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid> */}
            </Grid>
          </Box>
          {feesData.map((feeItem, index) => (
            <Box key={index}>
              <TableContainer component={Paper} sx={{ mt: 0.5 }}>
                <Grid item xs={6}>
                  <div className="row" style={{ display: "flex" }}>
                    <span className="label" style={{ fontWeight: "normal" }}>
                      दस्तऐवज प्रकार:
                    </span>
                    <span
                      style={{
                        fontWeight: "normal",
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
                        align="center"
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          p: 1.5,
                        }}
                      >
                        अ.क्र.
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          p: 1.5,
                        }}
                      >
                        कराचे नाव
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          p: 1.5,
                        }}
                      >
                        रक्कम (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeItem.feesCalculationDetails.map((fee, i) => (
                      <TableRow key={i}>
                        <TableCell
                          align="center"
                          sx={{ p: 1.5, fontSize: "0.95rem" }}
                        >
                          {i + 1}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ p: 1.5, fontSize: "0.95rem" }}
                        >
                          {fee.propertyTaxName}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ p: 1.5, fontSize: "0.95rem" }}
                        >
                          {fee.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell
                        colSpan={3} // adjust to your total number of columns
                        sx={{
                          textAlign: "right", // align everything to the right
                          p: 0.5, // smaller padding
                          fontSize: "1rem",
                          fontWeight: "bold",
                        }}
                      >
                        <strong
                          style={{
                            display: "inline-block",
                            padding: "4px 8px", // add padding inside the strong text
                            marginRight: "10%", // adjust if you need more space to right edge
                          }}
                        >
                          एकूण = {feeItem.totalAmount}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
          <Box display="flex" justifyContent="flex-end">
            <Typography
              align="left"
              sx={{
                fontWeight: "normal",
                fontSize: "1rem",
                paddingRight: "45%",
                marginTop: "15px",
              }}
            >
              प्रिंट दिनांक : {currentDate}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                // border: "2px ssolid #000",
                paddingRight: "5%",
                borderRadius: "4px",
                fontSize: "1.1rem",
              }}
            >
              एकूण रक्कम : ₹ {applicationData?.totalAmnt ?? 0}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ViewReceipt;
