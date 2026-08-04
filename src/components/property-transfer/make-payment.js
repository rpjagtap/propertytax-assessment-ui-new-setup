import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { propertyTransferPaymentRequest } from "../../services/assessment-services";

const MakePayment = () => {
  const location = useLocation();
  const { trackingId, applicationNo, txnAmount, firstname, email, mobileNo } =
    location.state || {};

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingId || !applicationNo) return;

    const fetchPaymentData = async () => {
      try {
        // const body = {
        //   trackingId: "2526000359",
        //   applicationNo: "TR2526000302",
        //   txnAmount: "143",
        //   transactiaonType: "TRANSFERFEE",
        //   firstname: "pranva",
        //   email: "pranav.dabhle@gmail.com",
        //   mobileNo: "999999999",
        // };
        const body = {
          trackingId: trackingId || "2526000359",
          applicationNo: applicationNo || "TR2526000302",
          txnAmount: txnAmount || "143",
          transactiaonType: "TRANSFERFEE", // backend typo version
          firstname: firstname || "pranav",
          email: email || "pranav.dabhle@gmail.com",
          mobileNo: mobileNo || "999999999",
        };

        const response = await propertyTransferPaymentRequest(body);
        setPaymentData(response);
      } catch (err) {
        console.error("Error fetching payment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [trackingId, applicationNo, txnAmount, firstname, email, mobileNo]);

  const handlePayment = () => {
    if (paymentData?.url) {
      // Open Easebuzz URL in a new tab
      window.open(paymentData.url, "_blank");

      // Optional: You can also redirect back to result page after some delay if needed
      // setTimeout(() => {
      //   window.location.href = "/payment-result";
      // }, 10000);
    } else {
      alert("Payment URL not found.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!paymentData) {
    return <Typography align="center">No payment data found.</Typography>;
  }

  const txnDetail = paymentData?.currentTxnDetail?.[0] || {};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#f7f7f7",
        py: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: 2,
          ml: 4,
        }}
      >
        <Box
          component="img"
          src="/pcmclogo.jpeg"
          alt="PCMC Logo"
          sx={{ width: 70, height: 70, mr: 2 }}
        />
        <Box>
          <Typography sx={{ fontSize: "1.3rem", fontWeight: "bold" }}>
            पिंपरी चिंचवड महानगरपालिका
          </Typography>
          <Typography sx={{ fontSize: "1.3rem", fontWeight: "bold" }}>
            कर आकारणी व कर संकलन विभाग
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        PCMC Secure Payment Gateway
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        Please confirm your amount to proceed to the secure Payment Gateway
      </Typography>

      {/* Payment Details Card */}
      <Paper
        elevation={3}
        sx={{
          width: { xs: "85%", sm: 450 },
          p: 2,
          borderRadius: 1,
          backgroundColor: "#eaeaea",
        }}
      >
        <Typography variant="body1" fontWeight="bold" gutterBottom>
          Transaction Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Customer ID</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.customerID || "—"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Transaction Amount</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              ₹{txnDetail.txnAmount || txnAmount}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Payment Type</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.paymentType || "—"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Property Code</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.propertyCode || "—"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Transaction Date</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.transactionDate || "—"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Payment Channel</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.paymentChannel || "—"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Contact Number</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.mobileNo || mobileNo}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize="0.875rem">Email ID</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight="bold" fontSize="0.875rem">
              {txnDetail.email || email}
            </Typography>
          </Grid>
        </Grid>

        {/* Payment Button */}
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            sx={{
              width: "50%",
              backgroundColor: "#06b0bfff",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Confirm & Pay
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>Note: </strong>No extra charges for online payments through
          Credit Card / Debit Card / Net Banking
        </Typography>
      </Paper>

      <Typography
        variant="body2"
        sx={{ mt: 2, color: "#555", textAlign: "center" }}
      >
        For any queries, contact{" "}
        <span style={{ color: "#9847f4ff", fontWeight: "bold" }}>
          ptax@pcmcindia.gov.in
        </span>
      </Typography>
    </Box>
  );
};

export default MakePayment;
