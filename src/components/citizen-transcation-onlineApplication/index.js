import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Grid,
  Paper,
  Alert,
  Button,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material";
import { labels } from "../../lang/labels";
import { GridRow, FormValue } from "../common/custom-form-grid";
import { useFormik, FormikProvider, Form } from "formik";
import TextInput from "../form-fields/text-input";
import DashBoardContainer from "../layout/dashboard-container";
import LanguageSelector from "../form-fields/language-selector";
import Loader from "../loader/loader";
import useApiState from "../common/useApiState";
import { useSelector } from "react-redux";
import { Select, MenuItem } from "@mui/material";
import { useSearchParams } from "react-router-dom";
// import SelectInput from "../form-fields/select-input";


import { getAssessmentDocuments, getPropertyDetailsForTransfer } from "../../services/assessment-services";

import {
  submitCitizenPropertyUpdateApplication,
  getAllProTransactions
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
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
      // mt="15px"
      paddingLeft="13%"
      fontSize="larger"
      fontWeight={800}
    >
      {title}
    </Grid>
  );
};

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
  // const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);


  // Safe UUID generator for browsers and Node
  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID(); // Native browser / Node support
    }
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      // Fallback for browsers without randomUUID
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);

      // Per RFC 4122 section 4.4
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;

      return [...buf].map((b, i) =>
        [4, 6, 8, 10].includes(i) ? "-" + b.toString(16).padStart(2, "0") : b.toString(16).padStart(2, "0")
      ).join("");
    }
    // Last resort: Math.random-based (less secure)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();

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

            documentVOs: rows.map((row) => {
              const selected = documentTypeOptions.find(
                (opt) => opt.label === row.documentType
              );

              return {
                documentId: row.documentId,
                documentURLbase64: row.documentURLbase64,
              };
            }),
          }]


      };

      setLoading(true);


      // try {
      setLoading(true);

      const response = await submitCitizenPropertyUpdateApplication(body);


      if (response?.applicationNo) {
        showToastSuccess(`Thank you for your application. Your application number is ${response.applicationNo}. You will be redirected in 10 seconds...`);
        setTimeout(() => {
          navigate("/CitizenApplication");
        }, 10000);

        formik.resetForm();

        // Optional: also clear your rows array if used
        setRows([]);
      } else {
        showToastError("Error occurred. Please try again.");
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

  const lang = useSelector((state) => state.userDetails.lang);
  const formik = useFormik({
    initialValues: initialState,
  });
  const { setValues } = formik;
  const [properyDetails, setProperyDetails] = useState({});

  const [PropertyNumberoptions, setPropertyNumberOptions] = useState([""]);
  const [PropertyHolderNameoptions, setPropertyHolderNameOptions] = useState(["",]);

  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  const [propertyAddress, setPropertyAddress] = useState("");
  const [mobile, setMobile] = useState("");


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyCodeFromURL = queryParams.get("propertyCode");
    setPropertyNumberOptions([propertyCodeFromURL]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes] = await Promise.all([getAllProTransactions()]);
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


  const transactionsOptions = useMemo(() =>
    allTrsactions.map(item => ({
      value: item.id,
      label: item.marTransactionTypeName,
    })), [allTrsactions]
  );


  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getAssessmentDocuments();
      setDocumentTypeOptions(res); // must be [{label: "..."}]
    };
    fetchTypes();
  }, []);

  //////new code for property details api call on property number change
  useEffect(() => {
    const propertyCodeFromURL = PropertyNumberoptions[0];   // 🔥 Get propertyCode from dropdown or URL

    const apiGetPropertyDetails = async (propertyCode) => {
      if (!propertyCode || propertyCode.trim() === "" || propertyCode.length < 13)
        return;

      try {
        const details = await getPropertyDetailsForTransfer({
          propertyCode: propertyCode.trim(),
        });

        setProperyDetails(details);

        const roList = details.propertyDetailsROLst || [];

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

    //  VERY IMPORTANT — CALL THE FUNCTION HERE
    if (PropertyNumberoptions[0]) {
      apiGetPropertyDetails(PropertyNumberoptions[0]);
    }
  }, [PropertyNumberoptions]);

  const propertyErrorToastId = "propertyErrorToast";
  const mobileErrorToastId = "mobileErrorToastId";
  const emailErrorToastId = "emailErrorToastId";


  const handleFieldChange = async (event) => {
    const { name, value } = event.target;

    const handleFieldChange = (e) => {
      const { name, value } = e.target;

      // Email validation
      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // If invalid
        if (value.trim() !== "" && !emailRegex.test(value)) {
          if (!toast.isActive(emailErrorToastId)) {
            toast.error("Please enter a valid email address.", {
              toastId: emailErrorToastId,
              autoClose: false,
            });
          }

          return;
        }

        // If valid → remove toast
        toast.dismiss(emailErrorToastId);
      }

      // ✅ If valid → update formik
      formik.setFieldValue(name, value);

      // ✅ Trigger formik validation
      formik.validateField(name);
    };




    if (name === "propertyNumber") {
      try {
        if (value.length > 13) {
          const res = await getPropertyDetailsForTransfer({
            propertyCode: value,
          });
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || //
          error?.message ||
          "Something went wrong checking property number.",
          {
            toastId: "propertyNumberError",
            autoClose: 5000,
          }
        );
      }
    }

    formik.setFieldValue(name, value);
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
  };

  // for row logic
  const initialRow = {
    documentType: "",
    documentURL: "",

  };

  const [rows, setRows] = useState([initialRow]);
  useEffect(() => {
    if (formik.values.transferType === "propertyTransfer") {
      // Clear all added buyer rows and keep only one blank
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
    setRows([...rows, { ...initialRow }]);
  };

  const handleDeleteRow = (index) => {
    if (rows.length > 1) {
      const updated = [...rows];
      updated.splice(index, 1);
      setRows(updated);
    }
  };


  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };



  // for row logic

  return (
    <DashBoardContainer>
      <Box mt={1} ml={140}>
        <LanguageSelector />
      </Box>
      <FormikProvider value={formik}>
        <Form>
          {success && <Alert severity="success">{success}</Alert>}
          {loading && <Loader />}
          <Paper
            elevation={4}
            sx={{
              marginBottom: "15px",
              width: "100%",
              margin: "auto",
              pb: "10px",
              // pt: "15px",
            }}
          >
            {/* <FormTitle title={labels.ApplicantDetails[lang]} /> */}
            <Grid>
              <GridRow
                sx={{
                  gap: 10, // space between two boxes
                  p: 2, // padding around the entire row
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >

              </GridRow>



              <FormTitle title={labels.PropertyDetails[lang]} />
              <GridRow
                sx={{
                  p: 2,
                  display: "flex",
                  marginLeft: "13%",
                  alignItems: "center",
                }}
              >

                <GridRow
                  sx={{
                    display: "flex",
                    gap: 4,          // space between two fields
                    p: 2,
                  }}
                >

                  {/*  LEFT FIELD */}
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
                          // label="Property Code"
                          value={properyDetails.propertyCode || ""} // value from API
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

                  {/*  RIGHT FIELD */}
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
                          // label="Property Holder Name"
                          value={properyDetails.propertyName || ""} // property name from API
                          onChange={(e) => {
                            // If you want to allow editing, update formik too
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

                <GridRow
                  sx={{
                    display: "flex",
                    gap: 4,          // space between two fields
                    p: 2,
                  }}
                >

                  {/*  LEFT FIELD */}
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
                          // label="Property Address"
                          value={properyDetails.propertyAddress || ""} // property Address from API
                          onChange={(e) => {
                            // If you want to allow editing, update formik too
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

                  {/*  RIGHT FIELD */}
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
                          // label="Property Owner Mobile No"
                          value={properyDetails.propertyMobileNo || ""} // correct key
                          onChange={(e) => {
                            handleFieldChange({
                              target: { name: "propertyOwnerMobileNumber", value: e.target.value },
                            });
                          }}
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
                          onBlur={formik.handleBlur}   // <-- IMPORTANT
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
                    justifyContent="flex-start" //  align everything to the left
                    alignItems="center"
                    width="100%"
                    gap={4} // spacing between label and radios
                  // pl="10px" //  shift whole group 20px from the left
                  >
                    {/* Left side: title */}
                    <span>{labels.DocumentDetails[lang]}</span>
                  </Box>
                }
              />

              {/* <FormTitle title={labels.BuyerDetail[lang]} /> */}
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
                        // label: labels.UploadDocument(index2)[lang],
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

                        {/* Handle documentType dropdown */}
                        {field.name === "documentType" ? (


                          <Autocomplete
                            options={documentTypeOptions}
                            getOptionLabel={(option) => option.marDocumentName || ""}

                            value={
                              documentTypeOptions.find((opt) => opt.id === row.documentId) || null
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
                        ) : //
                          field.name === "documentURL" ? (
                            <>
                              <input
                                type="file"
                                accept=".pdf"
                                // accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const fileName = file.name;
                                    handleChange(index, field.name, fileName);

                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result;
                                      // Save base64 string in state (rows)
                                      handleChange(
                                        index,
                                        field.name + "base64",
                                        base64String
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                style={{ fontSize: "0.875rem", width: "100%" }}
                              />
                            </>
                          ) : (
                            <TextField
                              name={field.marDocumentName}
                              value={field.marDocumentName}
                              onChange={(e) =>
                                handleChange(index, field.marDocumentName, e.target.marDocumentName)
                              }
                              onBlur={handleBlur}
                              variant="standard"
                              fullWidth
                              placeholder={field.marDocumentName}
                              InputProps={{ sx: { p: 0 } }}
                              sx={{ "& .MuiInputBase-root": { p: 0 } }}
                            />
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
                        disabled={
                          formik.values.transferType == "propertyTransfer"
                            ? true
                            : false
                        }
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
                            : rows.length === 1 || false
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
