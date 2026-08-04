import React, { useRef, useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableContainer,
  TextField,
  CircularProgress,
  Radio,
  FormControlLabel,
  RadioGroup,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RenderTableHead } from "../common/table";
import {
  ArrowBack,
  Calculate,
  DocumentScannerOutlined,
  Height,
  Save,
} from "@mui/icons-material";
import { Navigate } from "react-router-dom";
import { labels } from "../../lang/labels";
import TextInput from "../form-fields/text-input";
import {
  getCalculateTransferFees,
  getViewTransferFees,
  saveTransferFees,
  saveTrevertApplication,
  downloadTransferDoc,
  getPropertyTransferDocumentType,
} from "../../services/assessment-services";
import ViewTransferFee from "./view-transfer-fee";
import SplitTable from "./split-table";
import TransferTable from "./transfer-table";

import { showToastError, showToastSuccess } from "../common/toastHelper";
const TransferDashboardTable = ({
  data,
  handleBackClick,
  stage,
  resetData,
}) => {
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const res = await getPropertyTransferDocumentType();
        console.log(" API Response:", res);

        const docList = res?.lstDocVO || [];

        if (Array.isArray(docList) && docList.length > 0) {
          const options = docList.map((item) => item.label);
          console.log("Extracted Options:", options);
          setDocumentTypeOptions(options);
        } else {
          console.warn("No document types found in response:", res);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchDocumentTypes();
  }, []);

  const lang = useSelector((state) => state.userDetails.lang) || "ma";
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");
  // const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  const [nondaniDate, setNondaniDate] = useState("");
  const [rateableValuesum, setRateableValueSum] = useState("");
  const [bajarMulya, setBajarMulya] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [transferId, settransferId] = useState("");

  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveFeesDetails, setSaveFeesDetails] = useState(null);
  const [resResponce, setResResponce] = useState(null);
  sessionStorage.setItem("application_details", JSON.stringify(data));
  const remarkInputRef = useRef(null);
  const [pendingAppCountData, setPendingAppCountData] = useState(
    data ? [data] : []
  );

  const handleRevertSubmit = async () => {
    try {
      // if (remark.length <= 0) {
      //   if (remarkInputRef.current) {
      //     remarkInputRef.current.focus(); //  Focus the TextField
      //   }
      //   showToastError("Please enter remark");
      //   return;
      // }
      // setLoading(true); // Ensure loading starts

      const body = {
        propertyKey: data.propertyKey,
        propertyCode: data.propertyCode,

        ownerName: data.ownerName,
        // occupantName: data.occupantName,
        finalUseType: data.finalUseType,
        ratableValuesum: data.ratableValuesum,
        // propertyAddress: data.propertyAddress,
        // description: data.description,
        propertyDetailsROLst: data.propertyDetailsROLst.map((item) => ({
          useTypeName: item.useTypeName,
          ratableValue: item.ratableValue,
          area: item.area,
          subuseTypeName: item.subuseTypeName,
          propertyTransferMainDetailsId: item.propertyTransferMainDetailsId,
        })),
        propertyTransferDetails: data.propertyTransferDetails.map((item) => ({
          propertyCode: item.propertyCode,
          // newoccupantName: item.newoccupantName,
          newOwnerName: item.newOwnerName,
          // mobileNo: item.mobileNo,
          documentType: item.documentType,
          // documentURL: item.documentURL,
          // transferArea: item.transferArea,
          transferId: item.transferId,
        })),
        revertFormVO: {
          revertAction: "accept",
          remark: remark,
        },
        propertyTransferMainId: data.propertyTransferMainId,
      };

      const res = await saveTrevertApplication(body);

      if (res?.status === "Approved Successfully..!!") {
        // setSuccessMessage(res.message || "Data saved successfully!");
        showToastSuccess(res.message || "Data Approved successfully!");
        resetData();
        handleBackClick();
      } else {
        showToastSuccess(res?.message || "Faild to save");
      }
    } catch (error) {
      console.error("Error on revert-application:", error);
      showToastError(error?.message || "Error on revert-application");
      // toast.error("Failed to revert application.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      if (remark.length <= 0) {
        if (remarkInputRef.current) {
          remarkInputRef.current.focus(); // Focus the TextField
        }
        showToastError("Please enter remark");
        return;
      }
      setLoading(true);

      const body = {
        propertyKey: data.propertyKey,
        propertyCode: data.propertyCode,
        ownerName: data.ownerName,
        finalUseType: data.finalUseType,
        ratableValuesum: data.ratableValuesum,
        propertyDetailsROLst: data.propertyDetailsROLst.map((item) => ({
          useTypeName: item.useTypeName,
          ratableValue: item.ratableValue,
          area: item.area,
          subuseTypeName: item.subuseTypeName,
          propertyTransferMainDetailsId: item.propertyTransferMainDetailsId,
        })),
        propertyTransferDetails: data.propertyTransferDetails.map((item) => ({
          propertyCode: item.propertyCode,
          newOwnerName: item.newOwnerName,
          documentType: item.documentType,
          // documentURL: item.documentURL,
          transferId: item.transferId,
        })),
        revertFormVO: {
          revertAction: "reject",
          remark: remark,
        },
        propertyTransferMainId: data.propertyTransferMainId,
      };

      const res = await saveTrevertApplication(body);

      if (res?.status === "Revert Successfully..!!") {
        showToastSuccess(res.message || "Data Reverted Successfully!");
        handleBackClick();
      } else {
        showToastError(res?.message || "Failed to revert");
      }
    } catch (error) {
      console.error("Error on reject-application:", error);
      showToastError(error?.message || "Error on reject-application");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true); // Ensure loading starts

  //     const body = {
  //       propertyKey: data.propertyKey,
  //       propertyCode: data.propertyCode,

  //       ownerName: data.ownerName,
  //       // occupantName: data.occupantName,
  //       finalUseType: data.finalUseType,
  //       // propertyAddress: data.propertyAddress,
  //       // description: data.description,
  //       propertyDetailsROLst: data.propertyDetailsROLst.map((item) => ({
  //         useTypeName: item.useTypeName,
  //         ratableValue: item.ratableValue,
  //         area: item.area,
  //         subuseTypeName: item.subuseTypeName,
  //         propertyTransferMainDetailsId: item.propertyTransferMainDetailsId,
  //       })),
  //       propertyTransferDetails: data.propertyTransferDetails.map((item) => ({
  //         propertyCode: item.propertyCode,
  //         // newoccupantName: item.newoccupantName,
  //         newOwnerName: item.newOwnerName,
  //         // mobileNo: item.mobileNo,
  //         documentType: item.documentType,
  //         documentURL: item.documentURL,
  //         // transferArea: item.transferArea,
  //         transferId: item.transferId,
  //       })),
  //       revertFormVO: {
  //         revertAction: "reject",
  //         remark: remark,
  //       },
  //       propertyTransferMainId: data.propertyTransferMainId,
  //     };

  //     const res = await saveTrevertApplication(body);

  //     if (res?.status === "reverted Successfully..!!") {
  //       // setSuccessMessage(res.message || "Data saved successfully!");
  //       showToastSuccess(res.message || "Data reverted successfully!");
  //       handleBackClick();
  //     } else {
  //       showToastSuccess(res?.message || "Faild to save");
  //     }
  //   } catch (error) {
  //     console.error("Error on revert-application:", error);
  //     showToastError(error?.message || "Error on revert-application");
  //     // toast.error("Failed to revert application.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveFeesDetails = async () => {
    try {
      const dataWithTrackingAndApplicationNo = {
        // trackingId: "2425000028",
        // applicationNo: "TR2425000018",
        transferId: transferId,
        feesCalculationRO: rows.map((row) => row.feesData).flat(),
      };

      const res = await saveTransferFees(dataWithTrackingAndApplicationNo);
      setResResponce(res);

      //new code added
      // setPendingAppCountData((prev) =>
      //   prev.map((row) =>
      //     row.transferId === transferId ? { ...row, status: "C" } : row
      //   )
      // );

      // setPendingAppCountData((prev) =>
      //   prev.map((row) => {
      //     const updatedDetails = row.propertyTransferDetails.map((detail) =>
      //       detail.transferId === transferId
      //         ? { ...detail, status: "C" }
      //         : detail
      //     );
      //     return { ...row, propertyTransferDetails: updatedDetails };
      //   })
      // );

      setPendingAppCountData((prev) =>
        prev.map((row) => ({
          ...row,
          propertyTransferDetails: row.propertyTransferDetails.map((detail) =>
            detail.transferId === transferId
              ? { ...detail, status: "C" }
              : detail
          ),
        }))
      );

      handleClose();
    } catch (error) {
      console.error("Error fetching transfer fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setRows([documentTypeOptions]);
  };
  const [openViewFee, setOpenViewFee] = useState(false);
  const [openViewFee1, setOpenViewFee1] = useState(false);
  const [openSplitView, setOpenSplitView] = useState(false);
  const [openTransferView, setOpenTransferView] = useState(false);
  const handleClickOpenFee = async () => {
    setOpenViewFee(true);
    try {
      const body = {
        transferId: transferId, // or use dynamic transferId
      };

      const response = await getViewTransferFees(body);

      // Set fees data to state if needed
      if (response?.feesCalculationRO) {
        setFeesData(response); // assuming you're using useState for this
      }
    } catch (error) {
      console.error("View Fee calculation error:", error);
    }
  };

  const handleCloseFee = () => setOpenViewFee(false);
  const [rows, setRows] = useState([
    {
      documentType: "",
      nondaniDate: "",
      bajarMulya: "",
      rateableValue: "",
      feesData: null,
    },
  ]);

  const handleChange = async (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated); // Set the changed value first
    if (field === "bajarMulya" && pendingAppCountData.length > 0) {
      const { documentType, nondaniDate } = updated[index];

      const body = {
        documentType,
        nondaniDate,
        bajarMulya: value,
        rateableValue: pendingAppCountData[0].ratableValueSum,
      };

      try {
        const response = await getCalculateTransferFees(body);
        if (response?.totalAmount) {
          const feesData = {
            documentType: body.documentType,
            nondaniDate: body.nondaniDate.replace(/-/g, "/"),
            bajarMulya: body.bajarMulya,
            rateableValue: body.rateableValuesum,
            totalAmount: response.totalAmount.toString(),
            feesCalculationDetails: response.feesCalculationDetails.map(
              (item) => ({
                propertyTaxName: item.propertyTaxName,
                propertyTaxKey: item.propertyTaxKey,
                amount: item.amount.toFixed(2),
              })
            ),
          };
          updated[index].feesData = feesData;
        }
        setRows([...updated]); // Trigger UI update with fees
      } catch (error) {
        console.error("Fee calculation error:", error);
        updated[index].feesData = {
          feesCalculationDetails: [],
          totalAmount: 0,
        };
        setRows([...updated]);
      }
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { documentType: "", nondaniDate: "", bajarMulya: "", feesData: null },
    ]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  // const handleDownload = async (transferId) => {
  //   try {
  //     const response = await downloadTransferDoc(transferId);

  //     // Create blob using the response type from headers
  //     const contentType = response.type || "application/pdf"; // default PDF
  //     const blob = new Blob([response], { type: contentType });
  //     const url = window.URL.createObjectURL(blob);

  //     // Open in new tab
  //     const newWindow = window.open(url, "_blank");
  //     if (!newWindow) {
  //       alert("Please allow popups to view the file.");
  //     }

  //     // Optional: revoke the object URL after a while
  //     setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //   }
  // };

  // useEffect(() => {
  //   const fetchDocumentTypes = async () => {
  //     try {
  //       const res = await getPropertyTransferDocumentType();

  //       if (Array.isArray(res)) {
  //         // Pick correct property name — adjust based on API structure
  //         const options = res.map((item) => item.documentTypeName);

  //         setDocumentTypeOptions(options);
  //       } else {
  //         console.error("Invalid document type response:", res);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching document types:", error);
  //     }
  //   };

  //   fetchDocumentTypes();
  // }, []);

  const handleDownload = async (doc) => {
    try {
      const file = await downloadTransferDoc(doc.documentId);

      const blob = new Blob([file], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(url, "_blank");

      // Clean up URL after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Box sx={{ overflowX: "auto", padding: 2 }}>
      {!openViewFee1 && !openSplitView && !openTransferView && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={handleBackClick}
              >
                {labels?.Back?.[lang] || "Back"}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ minWidth: 1800 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#abd9e3" }}>
                      {[
                        labels?.propertyCode?.[lang] || "Property Code",
                        labels?.ownerName?.[lang] || "Owner Name",
                        // labels?.occupantName?.[lang] || "Occupant Name",
                        labels?.FinalUseType?.[lang] || "Use Type",
                        // labels?.propertyAddress?.[lang] || "Property Address",
                        // labels?.description?.[lang] || "Description",
                        // labels?.details?.[lang] || "Details",
                        labels?.ownerDetails?.[lang] || "Owner Details",
                      ].map((label, idx) => (
                        <TableCell
                          key={idx}
                          sx={{
                            fontWeight: 600,
                            border: "1px solid #ccc",
                            backgroundColor: "#abd9e3",
                            whiteSpace: "nowrap",
                            padding: 1,
                            textAlign: "center",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pendingAppCountData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            border: "1px solid #ccc",
                            textAlign: "center",
                            padding: 1,
                          }}
                        >
                          {item.propertyCode}
                        </TableCell>
                        <TableCell
                          sx={{
                            border: "1px solid #ccc",
                            textAlign: "center",
                            padding: 1,
                          }}
                        >
                          {item.ownerName}
                        </TableCell>
                        <TableCell
                          sx={{
                            border: "1px solid #ccc",
                            textAlign: "center",
                            padding: 1,
                          }}
                        >
                          {item.finalUseType}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ccc", padding: 0 }}
                        >
                          <Table size="small">
                            <RenderTableHead
                              thSx={{
                                bgcolor: "#cbd5d7",
                                fontWeight: 600,
                                textAlign: "center",
                                border: "1px solid #ccc",
                                padding: 1,
                              }}
                              cells={[
                                labels?.newOwnerName?.[lang] ||
                                  "New Owner Name",
                                labels?.documentType?.[lang] || "Document Type",
                                // labels?.documentURL?.[lang] || "Document Url",
                                "",
                              ]}
                            />
                            <TableBody>
                              {(item.propertyTransferDetails || []).map(
                                (row, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell
                                      sx={{
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                        padding: 1,
                                      }}
                                    >
                                      {row.newOwnerName}
                                    </TableCell>

                                    {/* <TableCell
                                      sx={{
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                        padding: 1,
                                        cursor: "pointer", 
                                      }}
                                      onClick={() =>
                                        handleDownload(row.transferId)
                                      } 
                                      style={{
                                        color: "#1976d2",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {row.documentType}
                                    </TableCell> */}

                                    <TableCell
                                      sx={{
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                        padding: 1,
                                      }}
                                    >
                                      {(row.lstDocument || []).map(
                                        (doc, index) => (
                                          <Typography
                                            key={doc.documentId}
                                            sx={{
                                              color: "#1976d2",
                                              cursor: "pointer",
                                              textDecoration: "underline",
                                              fontSize: "0.85rem",
                                              mt: 0.5,
                                            }}
                                            onClick={() => handleDownload(doc)}
                                          >
                                            {row.documentType}{" "}
                                            {row.lstDocument.length > 1
                                              ? `(${index + 1})`
                                              : ""}
                                          </Typography>
                                        )
                                      )}
                                    </TableCell>

                                    {/* <TableCell
                                      sx={{
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                        padding: 1,
                                      }}
                                    > */}
                                    {/* <span
                                        onClick={() =>
                                          handleDownload(row.transferId)
                                        }
                                        style={{
                                          color: "#1976d2",
                                          cursor: "pointer",
                                          textDecoration: "underline",
                                        }}
                                      >
                                        index 2
                                      </span> */}
                                    {/* </TableCell> */}

                                    <TableCell
                                      sx={{
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                      }}
                                    >
                                      <Box
                                        display="flex"
                                        flexDirection="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap={2}
                                        flexWrap="nowrap"
                                      >
                                        {row.status === "" && (
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => {
                                              setDocumentType(row.documentType);
                                              settransferId(row.transferId);
                                              handleClickOpen();
                                            }}
                                            startIcon={<Calculate />}
                                            sx={{
                                              padding: "6px 16px",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            Calculate Transfer Fee
                                          </Button>
                                        )}
                                        {row.status === "C" && (
                                          <>
                                            {/* {JSON.stringify(data)} */}
                                            <Button
                                              variant="contained"
                                              color="primary"
                                              onClick={() => {
                                                settransferId(row.transferId);
                                                setOpenViewFee1(true);
                                              }}
                                              startIcon={
                                                <DocumentScannerOutlined />
                                              }
                                              sx={{
                                                padding: "6px 16px",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              View Transfer Fee
                                            </Button>
                                            {data.transferType ==
                                            "Property Transfer" ? (
                                              <>
                                                <Button
                                                  variant="contained"
                                                  color="primary"
                                                  onClick={() => {
                                                    settransferId(
                                                      row.transferId
                                                    );
                                                    setOpenTransferView(true);
                                                  }}
                                                  startIcon={
                                                    <DocumentScannerOutlined />
                                                  }
                                                  sx={{
                                                    padding: "6px 16px",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  Transfer
                                                </Button>
                                              </>
                                            ) : (
                                              <>
                                                <Button
                                                  variant="contained"
                                                  color="primary"
                                                  onClick={() => {
                                                    settransferId(
                                                      row.transferId
                                                    );
                                                    setOpenSplitView(true);
                                                  }}
                                                  startIcon={
                                                    <DocumentScannerOutlined />
                                                  }
                                                  sx={{
                                                    padding: "6px 16px",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  Split
                                                </Button>
                                              </>
                                            )}
                                          </>
                                        )}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            {/* Dialog for popup */}
            <Dialog
              open={open}
              onClose={handleClose}
              PaperProps={{
                sx: { width: "46%", height: "102%", maxHeight: "none" },
              }}
            >
              <DialogTitle>Calculate Transfer Fee</DialogTitle>
              <DialogContent>
                {rows.map((row, index) => (
                  <Box
                    key={index}
                    border="1px solid #ccc"
                    padding={2}
                    marginBottom={2}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          Document Type
                        </Typography>
                        <RadioGroup
                          value={row.documentType}
                          onChange={(e) =>
                            handleChange(index, "documentType", e.target.value)
                          }
                        >
                          {documentTypeOptions.map((docType, i) => (
                            <FormControlLabel
                              key={i}
                              value={docType}
                              control={<Radio />}
                              label={docType}
                            />
                          ))}
                        </RadioGroup>
                      </Grid>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid item xs={12}>
                          <DatePicker
                            label="नोंदणी तारीख"
                            format="DD/MM/YYYY"
                            value={
                              row.nondaniDate
                                ? dayjs(row.nondaniDate, "DD/MM/YYYY")
                                : null
                            }
                            onChange={(date) =>
                              handleChange(
                                index,
                                "nondaniDate",
                                dayjs(date).format("DD/MM/YYYY")
                              )
                            }
                            slotProps={{
                              textField: {
                                required: true,
                                sx: { maxWidth: 150 }, // Decrease width

                                fullWidth: true,
                              },
                            }}
                          />
                        </Grid>
                      </LocalizationProvider>

                      <Grid item xs={12}>
                        <TextField
                          // fullWidth
                          label="बाजार मुल्य"
                          type="number"
                          value={row.bajarMulya}
                          required
                          onChange={(e) => {
                            handleChange(index, "bajarMulya", e.target.value);
                            // handleCalculate(index, e.target.value);
                          }}
                          sx={{ width: 150 }}
                        />
                      </Grid>

                      {row.feesData && (
                        <Grid item xs={12}>
                          <Box mt={1}>
                            <Table border="1">
                              <TableHead
                                sx={{
                                  "& th": {
                                    border: "1px solid grey",
                                    padding: "4px 8px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    bgcolor: "#abd9e3",
                                  },
                                }}
                              >
                                <TableRow>
                                  <TableCell>
                                    <b>Property Tax Name</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Amount</b>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.feesData.feesCalculationDetails.map(
                                  (item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        {item.propertyTaxName}
                                      </TableCell>
                                      <TableCell>{item.amount}</TableCell>
                                    </TableRow>
                                  )
                                )}
                                <TableRow
                                  sx={{
                                    "& td": {
                                      border: "1px solid grey",
                                      padding: "4px 8px",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      bgcolor: "#abd9e3",
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <b>Total</b>
                                  </TableCell>
                                  <TableCell>
                                    {row.feesData.totalAmount}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Box>
                        </Grid>
                      )}

                      {/* Action Buttons */}
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                          {index === rows.length - 1 && (
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={handleAddRow}
                            >
                              Add
                            </Button>
                          )}
                          {index != 0 && (
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleDeleteRow(index)}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveFeesDetails}
                  >
                    Save
                  </Button>
                </Box>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleClose} color="secondary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog for popup */}
            <Dialog open={openViewFee} onClose={handleCloseFee}>
              <DialogTitle>
                {labels?.popupTitle?.[lang] || "Property Details"}
              </DialogTitle>
              <DialogContent>
                {feesData?.feesCalculationRO?.map((item, idx) => (
                  <Box
                    key={idx}
                    mb={3}
                    border="1px solid #ccc"
                    borderRadius={1}
                    p={2}
                  >
                    {/* Document Type Heading */}
                    <Typography
                      variant="h6"
                      sx={{
                        bgcolor: "#abd9e3",
                        p: 1,
                        fontWeight: "bold",
                        borderRadius: 1,
                      }}
                    >
                      {item.documentType}
                    </Typography>

                    {/* Table for Fees */}
                    <Table size="small" sx={{ mt: 1 }}>
                      <TableHead
                        sx={{
                          "& th": {
                            border: "1px solid grey",
                            fontWeight: 600,
                            fontSize: "13px",
                            bgcolor: "#f5f5f5",
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell>Property Tax Name</TableCell>
                          <TableCell>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ border: "1px solid grey" }}>
                            bajar Mulya
                          </TableCell>
                          <TableCell sx={{ border: "1px solid grey" }}>
                            {item.bajarMulya}
                          </TableCell>
                        </TableRow>
                        {item.feesCalculationDetails.map((detail, dIdx) => (
                          <TableRow key={dIdx}>
                            <TableCell sx={{ border: "1px solid grey" }}>
                              {detail.propertyTaxName}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid grey" }}>
                              {detail.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow
                          sx={{
                            "& td": {
                              border: "1px solid grey",
                              fontWeight: 600,
                              bgcolor: "#abd9e3",
                            },
                          }}
                        >
                          <TableCell>Total</TableCell>
                          <TableCell>{item.totalAmount}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                ))}
              </DialogContent>

              <DialogActions>
                <Button onClick={handleCloseFee} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Box mt={4} ml={27} mb={1}>
            <Typography variant="body2" sx={{ fontWeight: 550 }}>
              Please review the document above and provide your consent
            </Typography>
          </Box>
          {/* Remark Box with Label + TextField inside border */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #059cf3ff",
              borderRadius: "6px",
              padding: "8px 12px",
              width: "60%",
              marginLeft: "17%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                fontSize: "medium",
                minWidth: "90px",
                mr: 2,
              }}
            >
              Remark :
            </Typography>

            <TextField
              variant="standard"
              inputRef={remarkInputRef}
              value={remark}
              fullWidth
              placeholder="Enter your remark"
              InputProps={{ disableUnderline: true }}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Box>
          <Grid item xs={12}>
            <Grid container justifyContent="center" spacing={2} marginTop={0}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleRevertSubmit}
                >
                  {labels?.Approve?.[lang] || "Approve"}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleRejectSubmit}
                >
                  {labels?.Revert?.[lang] || "Revert"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      {openViewFee1 && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => {
              setOpenViewFee1(false);
            }}
          >
            Back
          </Button>
          <ViewTransferFee
            transferId={transferId}
            setPendingAppCountData={setPendingAppCountData}
            setOpenViewFee1={setOpenViewFee1}
          />
        </>
      )}
      {openSplitView && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => {
              setOpenSplitView(false);
            }}
          >
            Back
          </Button>
          <SplitTable
            transferId={transferId}
            setOpenSplitView={setOpenSplitView}
          />
        </>
      )}

      {openTransferView && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => {
              setOpenTransferView(false);
            }}
          >
            Back
          </Button>
          <TransferTable
            transferId={transferId}
            setOpenTransferView={setOpenTransferView}
          />
        </>
      )}
    </Box>
  );
};

export default TransferDashboardTable;
