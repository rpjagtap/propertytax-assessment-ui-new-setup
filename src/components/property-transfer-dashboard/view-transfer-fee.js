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
import DashBoardContainer from "../layout/dashboard-container";
import {
  getViewTransferFees,
  viewTransferFees,
} from "../../services/assessment-services";

const ViewTransferFee = ({
  transferId,
  setPendingAppCountData,
  setOpenViewFee1,
}) => {
  const [feesData, setFeesData] = useState([]);
  const [applicationData, setApplicationData] = useState();

  const handleCalcuateDetails = () => {
    setPendingAppCountData((prev) =>
      prev.map((row) => ({
        ...row,
        propertyTransferDetails: row.propertyTransferDetails.map((detail) =>
          detail.transferId === transferId ? { ...detail, status: "" } : detail
        ),
      }))
    );
    setOpenViewFee1(false);
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const body = { transferId };
        const res = await viewTransferFees(body);
        if (res) {
          setApplicationData(res);
          setFeesData(res.feesCalculationRO || []);
          console.log("Application Data:", res);
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };

    if (transferId) {
      fetchApplicationData();
    }
  }, [transferId]);

  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;

    // Today's date in Marathi (Devanagari digits), e.g. ०४/११/२०२६
    const printDate = new Date().toLocaleDateString("mr-IN-u-nu-deva", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // 1. Collect MUI/Emotion styles (works in dev and production)
    const inlineCss = Array.from(document.styleSheets)
      .filter((sheet) => sheet.ownerNode && sheet.ownerNode.tagName === "STYLE")
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join("\n");
        } catch (e) {
          return "";
        }
      })
      .join("\n");

    // 2. Collect linked stylesheets (global css, fonts, etc.)
    const linkTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    )
      .map((l) => l.outerHTML)
      .join("\n");

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      return;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Transfer Fee</title>
        <base href="${window.location.origin}/" />
        ${linkTags}
        <style>${inlineCss}</style>
        <style>
          @page { size: A4; margin: 10mm; }
          body {
            margin: 0;
            padding: 0;
            font-family: ${getComputedStyle(document.body).fontFamily};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-date {
            margin-top: 12px;
            text-align: left;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${content}
        <div class="print-date">
          प्रिंट दिनांक: <strong>${printDate}</strong>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();

    // Wait for images/fonts/styles to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
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
            border: "2px solid #000",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "16px",
            width: "100%",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <img src="/pcmclogo.jpeg" alt="Logo" style={{ height: 80 }} />
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={800}>
                पिंपरी चिंचवड महानगरपालिका
              </Typography>
              <Typography fontWeight={550}>
                कर आकारणी व कर संकलन विभाग
              </Typography>
            </Box>
          </Box>

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
                    {applicationData?.applicationNo}
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
                    {applicationData?.applicantName}
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
                    {applicationData?.mobileNo}
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
                    {applicationData?.email}
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
                    {applicationData?.applicantAddress}
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
                    {applicationData?.applicationDate}
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
                    {applicationData?.propertyCode}
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
                    {applicationData?.ownerName}
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
                    {applicationData?.totalArea}
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
                    {applicationData?.finalUseType}
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
                    {applicationData?.propertyAddress}
                  </span>
                </div>
              </Grid>

              <Grid item xs={12}>
                <hr style={{ border: "0.5px solid #ccc", margin: "6px 0" }} />
              </Grid>
            </Grid>
          </Box>

          {/* Dynamic Fee Sections */}
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
                      {feeItem?.documentType}
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

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                paddingRight: "19%",
                borderRadius: "4px",
              }}
            >
              एकूण रक्कम : ₹ {applicationData?.totalAmnt ?? 0}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCalcuateDetails}
          sx={{ marginLeft: 50, marginTop: 2 }}
        >
          Recalculate
        </Button>
      </Box>
    </>
  );
};

export default ViewTransferFee;