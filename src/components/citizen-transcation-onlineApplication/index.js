import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Grid,
  Paper,
  Alert,
  Button,
  TextField,
  Box,
  Autocomplete,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { labels } from "../../lang/labels";
import { GridRow, FormValue } from "../common/custom-form-grid";
import { useFormik, FormikProvider, Form } from "formik";
import DashBoardContainer from "../layout/dashboard-container";
import LanguageSelector from "../form-fields/language-selector";
import Loader from "../loader/loader";
import useApiState from "../common/useApiState";
import { useSelector } from "react-redux";

import {
  getAssessmentDocuments,
  getPropertyDetailsForTransfer,
  submitCitizenPropertyUpdateApplication,
  getAllProTransactions,
} from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getApiErrorMessage, getErrorMsg } from "../../utils/helpers";
import FormButtons from "../common/buttons";
import { toast } from "react-toastify";

const FormLabel = ({ label, required = false }) => {
  return (
    <Grid
      item
      sm={4}
      xs={12}
      md={8}
      maxWidth="sm"
      container
      justifyContent={{ xs: "flex-start", sm: "flex-start", md: "flex-start" }}
      alignItems="center"
      padding="5px"
      fontSize="large"
      sx={{ fontWeight: "600" }}
    >
      {required ? (
        <span>
          {label} <span style={{ color: "red" }}>*</span>
        </span>
      ) : (
        label
      )}
    </Grid>
  );
};

const FormTitle = ({ title }) => {
  return (
    <Grid
      container
      justifyContent="flex-start"
      alignContent={"space-around"}
      style={{ background: "#e4f0f4", height: "40px", width: "100%" }}
      paddingLeft="13%"
      fontSize="larger"
      fontWeight={800}
    >
      {title}
    </Grid>
  );
};

// Glossy alert (written inside this file)
const GlossyAlert = ({ open, severity = "error", message, onClose }) => {
  const [from, to, symbol, title] = {
    error: ["#ff6b6b", "#c62828", "✕", "Validation Error"],
    warning: ["#ffb74d", "#ef6c00", "!", "Attention"],
    success: ["#4cd98a", "#1b8a4b", "✓", "Success"],
  }[severity] || ["#ff6b6b", "#c62828", "✕", "Validation Error"];

  return (
    <Snackbar
      open={open}
      autoHideDuration={4500}
      onClose={(e, reason) => reason !== "clickaway" && onClose()}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 320,
          maxWidth: 480,
          px: 2.5,
          py: 1.5,
          borderRadius: 3,
          color: "#fff",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow:
            "0 12px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0))",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18,
            background: "rgba(255,255,255,0.25)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6)",
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {symbol}
        </Box>
        <Box sx={{ flex: 1, zIndex: 1 }}>
          <Box sx={{ fontWeight: 700, fontSize: 14 }}>{title}</Box>
          <Box sx={{ fontSize: 13, opacity: 0.95 }}>{message}</Box>
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: "pointer", fontSize: 18, zIndex: 1, px: 0.5 }}
        >
          ×
        </Box>
      </Box>
    </Snackbar>
  );
};

// "", only spaces, "-" or a single "." are not real text
const isJunk = (v) => {
  const t = (v ?? "").toString().trim();
  return t === "" || t === "-" || t === ".";
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Safe UUID generator for browsers and Node
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);

    // Per RFC 4122 section 4.4
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;

    return [...buf]
      .map((b, i) =>
        [4, 6, 8, 10].includes(i)
          ? "-" + b.toString(16).padStart(2, "0")
          : b.toString(16).padStart(2, "0")
      )
      .join("");
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const CitizenApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialState = {
    transactionTypeId: "",
    mobileno: "",
    email: "",
    propertyAddress: "",
    propertyHolderName: "",
    propertyno: "",
    totalAddress: "",
    documentURL: "",
    documentType: "",
    mobileNo: "",
    zoneKey: "",
    gatKey: "",
    ownerName: "",
    newOwnerName: "",
    propertyDetailsROLst: [],
  };

  const [allTrsactions, setAllTrsactions] = useState([]);
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const { loading, setLoading, error, setError, success, setSuccess } =
    useApiState();

  // ---------- Alert state (uses shared AlertMsg) ----------
  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const showAlert = (message, severity = "error") =>
    setAlertState({ open: true, severity, message });
  const closeAlert = () => setAlertState((p) => ({ ...p, open: false }));

  const lang = useSelector((state) => state.userDetails.lang);
  const formik = useFormik({
    initialValues: initialState,
  });
  const [properyDetails, setProperyDetails] = useState({});

  const updateDetail = (key, value) =>
    setProperyDetails((prev) => ({ ...prev, [key]: value }));

  const [PropertyNumberoptions, setPropertyNumberOptions] = useState([""]);
  const [PropertyHolderNameoptions, setPropertyHolderNameOptions] = useState([""]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [mobile, setMobile] = useState("");

  // for row logic
  const initialRow = {
    documentType: "",
    documentURL: "",
  };
  const [rows, setRows] = useState([initialRow]);

  // ---------- Validation ----------
  const validateForm = () => {
    const v = formik.values;
    const code = (properyDetails.propertyCode || "").toString().trim();
    const mobileVal = (properyDetails.propertyMobileNo || "").toString().trim();

    if (isJunk(code) || code.length < 13)
      return "Please enter a valid Property Number.";
    if (isJunk(properyDetails.propertyName))
      return "Property Holder Name is required.";
    if (isJunk(properyDetails.propertyAddress))
      return "Property Address is required.";
    if (!/^\d{10}$/.test(mobileVal))
      return "Mobile number must be exactly 10 digits (numbers only).";
    if (!v.transactionType) return "Please select a Type.";
    if (v.email && !emailRegex.test(v.email.trim()))
      return "Please enter a valid email address (must contain @).";

    const hasAnyDoc = rows.some((r) => r.documentId || r.documentURLbase64);
    if (!hasAnyDoc) return "Please upload at least one document.";

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].documentId)
        return `Please select Document Type in row ${i + 1}.`;
      if (!rows[i].documentURLbase64)
        return `Please upload file (PDF) in row ${i + 1}.`;
    }
    return null;
  };

  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      showAlert(errorMsg, "error");
      return;
    }

    formik.setFieldValue("propertyTransferDetails", rows);
    try {
      const values = formik.values;

      const body = {
        requestId: generateUUID(),
        channelName: "PropertyTax",
        propertyTransactionVO: [
          {
            transactionTypeId: values.transactionType,
            applicantName: properyDetails.propertyName,
            applicantMobile: properyDetails.propertyMobileNo,
            zoneKey: properyDetails.zoneKey,
            gatKey: properyDetails.gatKey,
            applicantEmail: values.email,
            propertyCode: values.propertyCode,

            documentVOs: rows.map((row) => ({
              documentId: row.documentId,
              documentURLbase64: row.documentURLbase64,
            })),
          },
        ],
      };

      setLoading(true);

      const response = await submitCitizenPropertyUpdateApplication(body);

      if (response?.applicationNo) {
        showAlert(
          `Thank you for your application. Your application number is ${response.applicationNo}. You will be redirected in 10 seconds...`,
          "success"
        );
        setTimeout(() => {
          navigate("/CitizenApplication");
        }, 10000);

        formik.resetForm();
        setRows([initialRow]);
      } else {
        showAlert("Error occurred. Please try again.", "error");
      }
    } catch (error) {
      showToastError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetStateData = () => {
    window.location.reload();
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyCodeFromURL = queryParams.get("propertyCode");
    setPropertyNumberOptions([propertyCodeFromURL]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes] = await Promise.all([
          getAllProTransactions(),
        ]);
        setAllTrsactions(allProTransactionsRes);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transactionsOptions = useMemo(
    () =>
      allTrsactions.map((item) => ({
        value: item.id,
        label: item.marTransactionTypeName,
      })),
    [allTrsactions]
  );

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getAssessmentDocuments();
      setDocumentTypeOptions(res);
    };
    fetchTypes();
  }, []);

  // property details api call on property number change
  useEffect(() => {
    const apiGetPropertyDetails = async (propertyCode) => {
      if (!propertyCode || propertyCode.trim() === "" || propertyCode.length < 13)
        return;

      try {
        const details = await getPropertyDetailsForTransfer({
          propertyCode: propertyCode.trim(),
        });

        setProperyDetails(details);

        const updatedValues = {
          ...formik.values,
          propertyAddress: details.propertyAddress || "",
          ownerName: details.ownerName || "",
          propertyKey: details.propertyKey || "",
          zoneKey: details.zoneKey || "",
          occupantName: details.propertyName || "",
          gatKey: details.gatKey || "",
          propertyCode: details.propertyCode || "",
          propertyMobileNo: details.propertyMobileNo || "",
          finalUseType: details.finalUseType || "",
          description: details.description || "",
          totalArea: details.totalArea || 0,
        };

        formik.setValues(updatedValues);

        setPropertyHolderNameOptions([details.propertyName]);
        setPropertyAddress(details.propertyAddress);
        setMobile(details.propertyMobileNo);
      } catch (error) {
        console.error(" Error fetching property details:", error);
        toast.error(
          error?.response?.data?.message || "Something went wrong.",
          { toastId: "propertyErrorToastId" }
        );
      }
    };

    if (PropertyNumberoptions[0]) {
      apiGetPropertyDetails(PropertyNumberoptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PropertyNumberoptions]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    // mobile: digits only, max 10
    if (name === "propertyOwnerMobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      updateDetail("propertyMobileNo", digits);
      formik.setFieldValue(name, digits);
      return;
    }
    if (name === "propertyCode") updateDetail("propertyCode", value);
    if (name === "propertyHolderName") updateDetail("propertyName", value);
    if (name === "propertyAddress") updateDetail("propertyAddress", value);

    formik.setFieldValue(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value.trim() !== "" && !emailRegex.test(value.trim())) {
      showAlert("Please enter a valid email address (must contain @).", "warning");
    }
    formik.handleBlur(e);
  };

  useEffect(() => {
    if (formik.values.transferType === "propertyTransfer") {
      setRows([
        {
          newOwnerName: "",
          mobileNo: "",
          documentType: "",
          documentURL: "",
          documentURLbase64: "",
          transferArea: "",
        },
      ]);
    }
  }, [formik.values.transferType]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, { ...initialRow }]);
  };

  const handleDeleteRow = (index) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );

  return (
    <DashBoardContainer>
      <Box mt={1} ml={140}>
        <LanguageSelector />
      </Box>
      <FormikProvider value={formik}>
        <Form>
          {success && <Alert severity="success">{success}</Alert>}
          {loading && <Loader />}
          <GlossyAlert
            open={alertState.open}
            severity={alertState.severity}
            message={alertState.message}
            onClose={closeAlert}
          />
          <Paper
            elevation={4}
            sx={{
              marginBottom: "15px",
              width: "100%",
              margin: "auto",
              pb: "10px",
            }}
          >
            <Grid>
              <GridRow
                sx={{
                  gap: 10,
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              ></GridRow>

              <FormTitle title={labels.PropertyDetails[lang]} />
              <GridRow
                sx={{
                  p: 2,
                  display: "flex",
                  marginLeft: "13%",
                  alignItems: "center",
                }}
              >
                <GridRow sx={{ display: "flex", gap: 4, p: 2 }}>
                  {/* LEFT FIELD */}
                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyNumber[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          value={properyDetails.propertyCode || ""}
                          onChange={(e) => {
                            handleFieldChange({
                              target: { name: "propertyCode", value: e.target.value },
                            });
                          }}
                          placeholder="Enter Property Code"
                          InputProps={{ sx: { p: 0 } }}
                        />
                      </Box>
                    }
                  />

                  {/* RIGHT FIELD */}
                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyHolderName[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          value={properyDetails.propertyName || ""}
                          onChange={(e) => {
                            handleFieldChange({
                              target: { name: "propertyHolderName", value: e.target.value },
                            });
                          }}
                          InputProps={{ sx: { p: 0 } }}
                          placeholder="Enter Property Holder Name"
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow sx={{ display: "flex", gap: 4, p: 2 }}>
                  {/* LEFT FIELD */}
                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyAddress[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          value={properyDetails.propertyAddress || ""}
                          onChange={(e) => {
                            handleFieldChange({
                              target: { name: "propertyAddress", value: e.target.value },
                            });
                          }}
                          InputProps={{ sx: { p: 0 } }}
                          placeholder="Enter Property Address"
                        />
                      </Box>
                    }
                  />

                  {/* RIGHT FIELD */}
                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.MobileNo[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          value={properyDetails.propertyMobileNo || ""}
                          onChange={(e) => {
                            handleFieldChange({
                              target: {
                                name: "propertyOwnerMobileNumber",
                                value: e.target.value,
                              },
                            });
                          }}
                          inputProps={{ inputMode: "numeric", maxLength: 10 }}
                          InputProps={{ sx: { p: 0 } }}
                          placeholder="Enter Property Owner Mobile Number"
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.Type[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Select
                          fullWidth
                          variant="standard"
                          value={formik.values.transactionType || ""}
                          onChange={(e) => {
                            handleFieldChange({
                              target: { name: "transactionType", value: e.target.value },
                            });
                          }}
                          displayEmpty
                          sx={{ p: 0 }}
                        >
                          <MenuItem value="" disabled>
                            Select Type
                          </MenuItem>
                          {transactionsOptions.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "50%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.Email[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          name="email"
                          value={formik.values.email || ""}
                          onChange={handleFieldChange}
                          onBlur={handleBlur}
                          InputProps={{ sx: { p: 0 } }}
                          placeholder="Enter Email"
                        />
                      </Box>
                    }
                  />
                </GridRow>
              </GridRow>

              <FormTitle
                title={
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    width="100%"
                    gap={4}
                  >
                    <span>{labels.DocumentDetails[lang]}</span>
                  </Box>
                }
              />

              <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
                {rows.map((row, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: index !== rows.length - 1 ? 2 : 0,
                    }}
                  >
                    {[
                      {
                        name: "documentType",
                        label: labels.DocumentType[lang],
                        value: row.documentType,
                      },
                      {
                        name: "documentURL",
                        label: labels.UploadDocument[lang],
                        value: row.documentURL,
                      },
                    ].map((field) => (
                      <Box key={field.name} sx={{ flex: 1, minWidth: 150 }}>
                        {index === 0 && (
                          <FormLabel
                            label={field.label}
                            required
                            sx={{
                              mb: 0.5,
                              display: "block",
                              fontSize: "0.875rem",
                            }}
                          />
                        )}

                        {field.name === "documentType" ? (
                          <Autocomplete
                            options={documentTypeOptions}
                            getOptionLabel={(option) => option.marDocumentName || ""}
                            value={
                              documentTypeOptions.find(
                                (opt) => opt.id === row.documentId
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              handleChange(index, "documentId", newValue ? newValue.id : "");
                            }}
                            onBlur={() => {
                              if (!row.documentId) {
                                handleChange(index, "documentId", "");
                                handleChange(index, "documentType", "");
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select Document Type"
                                InputProps={{ ...params.InputProps, sx: { p: 0 } }}
                                sx={{ "& .MuiInputBase-root": { p: 0 } }}
                              />
                            )}
                          />
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (file.type !== "application/pdf") {
                                  showAlert("Only PDF files are allowed.", "error");
                                  e.target.value = "";
                                  return;
                                }

                                handleChange(index, field.name, file.name);

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleChange(index, field.name + "base64", reader.result);
                                  showAlert("File uploaded successfully.", "success");
                                };
                                reader.readAsDataURL(file);
                              }}
                              style={{ fontSize: "0.875rem", width: "100%" }}
                            />
                          </>
                        )}
                      </Box>
                    ))}

                    {/* + / - buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                        ml: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        disabled={formik.values.transferType == "propertyTransfer"}
                        onClick={handleAddRow}
                      >
                        +
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={
                          formik.values.transferType == "propertyTransfer"
                            ? true
                            : rows.length === 1
                        }
                        onClick={() => handleDeleteRow(index)}
                      >
                        -
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Paper>

          <GridRow>
            <Grid container justifyContent="center" alignItems="center">
              <Grid
                item
                md={3}
                container
                justifyContent={{ md: "flex-end" }}
                alignItems="center"
                p={2}
              >
                <FormButtons
                  cancelRedirect={null}
                  isValid={!(formik.isValid && formik.dirty)}
                  handleSubmitButtonClick={handleSubmitButtonClick}
                  resetForm={() => {
                    formik.resetForm();
                    resetStateData();
                  }}
                  submitBtnLabel={"Submit"}
                />
              </Grid>
            </Grid>
          </GridRow>
        </Form>
      </FormikProvider>
    </DashBoardContainer>
  );
};

export default CitizenApplication;
