import { DEV_BASE_URL, errorMsg, PROD_BASE_URL } from "./constants";

export const capitalizeFirstLetter = (string) => {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const formatDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const isEmptyObj = (obj) => Object.keys(obj).length === 0;

export const getCurrentDate = () => {
  const date = new Date();

  // Format date parts
  const day = String(date.getDate()).padStart(2, "0"); // Add leading 0 if necessary
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  // Combine in the desired format
  return `${day}/${month}/${year}`;
};

export const getErrorMsg = (error) => {
  return error?.response?.data?.message || errorMsg;
};

export const getApiErrorMessage = (error) => {
  // If backend sends the message under "message"
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // If backend sends the message under "error"
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // If backend sends an object with multiple keys
  if (error?.response?.data && typeof error.response.data === "object") {
    // pick the first string value it finds
    const firstKey = Object.keys(error.response.data)[0];
    return error.response.data[firstKey];
  }

  // Fallback
  return error.message || "Something went wrong";
};

export const getApiBaseUrl = () => {
  const { host } = window.location;
  let apiBaseUrl = "";
  if (
    host === "live.publicptaxpcmc.in:4002" ||
    host === "103.224.247.159:4002"
    
    // hostname === "localhost" ||
    // hostname === "127.0.0.1" ||
    // hostname === "103.224.247.158"
  ) {
    // In a production environment
    apiBaseUrl = `${PROD_BASE_URL}`;
  } else {
    // Running locally or DEV
    apiBaseUrl = `${DEV_BASE_URL}`;
  }

  return apiBaseUrl;
};

// export const capitalizeFirstLetter = (string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }

export const calculateFinalPendingAmt = (receiptData, value) => {
  const {
    lblTotalAmt,
    lblIllegalFajil,
    lblFajilbal,
    lblConsAmt,
    lblBalanceAmount,
  } = receiptData;
  if (
    parseInt(value) !== parseInt(lblBalanceAmount) &&
    parseInt(value) < parseInt(lblBalanceAmount)
  ) {
    return (
      parseInt(lblTotalAmt) -
      parseInt(lblIllegalFajil) -
      parseInt(lblFajilbal) -
      parseInt(value)
    );
  } else if (parseInt(value) > parseInt(lblBalanceAmount)) {
    return 0;
  } else {
    return (
      parseInt(lblTotalAmt) -
      parseInt(lblIllegalFajil) -
      parseInt(lblFajilbal) -
      parseInt(lblConsAmt) -
      parseInt(value)
    );
  }
};

export const getBalanceAmt = (receiptData) => {
  const { lblTotalAmt, lblIllegalFajil, lblFajilbal, lblConsAmt } = receiptData;
  return (
    parseInt(lblTotalAmt) -
    parseInt(lblIllegalFajil) -
    parseInt(lblFajilbal) -
    parseInt(lblConsAmt)
  );
};
