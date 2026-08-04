import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentResponse = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // navigation hook

  useEffect(() => {
    const txnid = searchParams.get("txnid");
    const status = searchParams.get("status");
    const applicationNo = searchParams.get("applicationNo");

    if (!txnid) {
      setError("Transaction ID missing in URL");
      setLoading(false);
      return;
    }

    //  Optionally call backend to fetch full transaction details
    axios
      .get
      // `https://live.publicptaxpcmc.in:4001/api/payment/status?txnid=${txnid}`
      ()
      .then((res) => {
        const data = res.data;

        data.applicationNo = data.applicationNo || applicationNo;
        setPaymentData(data);
        setLoading(false);
      })
      .catch(() => {
        setPaymentData({ txnid, status, applicationNo });
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <div>Processing payment response...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const handleGoBack = () => {
    if (paymentData?.applicationNo) {
      navigate(
        `/applications-status?applicationNo=${paymentData.applicationNo}`
      );
    } else {
      navigate("/applications-status");
    }
  };

  return (
    <div style={styles.container}>
      <h2>
        Payment{" "}
        <span
          style={{
            color:
              paymentData.status?.toLowerCase() === "success" ? "green" : "red",
          }}
        >
          {paymentData.status?.toUpperCase()}
        </span>
      </h2>

      <p>
        <strong>Transaction ID:</strong> {paymentData.txnid}
      </p>

      {paymentData.amount && (
        <p>
          <strong>Amount:</strong> ₹{paymentData.amount}
        </p>
      )}

      {paymentData.date && (
        <p>
          <strong>Date:</strong> {new Date(paymentData.date).toLocaleString()}
        </p>
      )}

      <p>Thank you for your payment 🙏</p>
      <button onClick={handleGoBack} style={styles.backButton}>
        ⬅ Back
      </button>
    </div>
  );
};

// const styles = {
//   container: {
//     textAlign: "center",
//     marginTop: "80px",
//     fontFamily: "Arial, sans-serif",
//   },
// };

const styles = {
  container: {
    textAlign: "center",
    marginTop: "80px",
    fontFamily: "Arial, sans-serif",
  },
  backButton: {
    marginTop: "20px",
    padding: "10px 18px",
    backgroundColor: "#06b0bfff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

export default PaymentResponse;
