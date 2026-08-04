import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Grid,
  Paper,
  Alert,
  Checkbox,
  Table,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Typography,
  Button,
  TableContainer,
  TableHead,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  Box,
  InputAdornment,
  Autocomplete,
  Stack,
  Divider,
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

import { getPropertyDetailsForTransfer } from "../../services/assessment-services";

import {
  getPropertyTransferDocumentType,
  getSubmitApplication,
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

const TransferForm = () => {
  // const documentTypeOptions = [
  //   { label: "नोंदणीकृत दस्त खरेदीखत / विक्री /बक्षीसपत्र(त्रयस्थ)", value: "1" },
  //   { label: "मयत /रक्तसंबंधी कौटुंबिक वाटणीपत्र", value: "2" },
  //   { label: "बिल्डरकडील पहिले हस्तांतरण", value: "3" },
  // ];
  const navigate = useNavigate();
  const location = useLocation();

  const initialState = {
    applicantName: "",
    applicantMobile: "",
    mobileno: "",
    email: "",
    propertyAddress: "",
    areaInSqrt: "",
    constructionType: "",
    useType: "",
    propertyHolderName: "",
    propertyno: "",
    SurveyNo: "",
    flatNo: "",
    areaName: "",
    landMark: "",
    pinCode: "",
    totalAddress: "",
    transferArea: "",
    documentURL: "",
    documentType: "",
    mobileNo: "",
    ownerName: "",
    newOwnerName: "",
    propertyDetailsROLst: [],
    ratableValueSum: "",
    transferType: "Split",
    mobile: "",
    propertyCode: "",
  };

  const { loading, setLoading, error, setError, success, setSuccess } =
    useApiState();
  const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);

  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();

    formik.setFieldValue("propertyTransferDetails", rows);

    //    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const values = formik.values;

      const formData = {
        channelName: "PropertyTransfer",
        applicantName: values.applicantName,
        applicantMobile: values.mobileNo,
        applicantMobile: values.applicantMobile,
        applicantEmail: values.email,
        propertyKey: values.propertyKey,
        zoneKey: values.zoneKey,
        gatKey: values.gatKey,
        propertyCode: values.propertyCode,
        propertyMobileNo: values.propertyMobileNo,

        ownerName: values.occupantName,
        occupantName: values.occupantName,
        description: values.description,
        ratableValueSum: Number(values.ratableValueSum || 0),
        finalUseType: values.finalUseType,
        propertyAddress: values.propertyAddress,
        totalArea: Number(values.totalArea || 0),
        applicantAddress: values.applicantAddress,
        transferType: values.transferType || "Split",
        propertyDetailsROLst: (values.propertyDetailsROLst || []).map(
          (row) => ({
            useTypeName: row.useTypeName || "",
            constructionTypeName:
              // "आर.सी.सी./लोड बेअरींग स्वरुपाचे बांधकाम" ||
              row.constructionTypeName || "",
            ratableValue: Number(row.ratableValue || 0),
            area: Number(row.area || 0),
            subuseTypeName: row.subuseTypeName || "",
            propertyKey: row.propertyKey || "",
            propertyDetailsKey: row.propertyDetailsKey || "",
            assessmentDate: row.assessmentDate || "",
            toilet: row.toilet || "",
            permission: row.permission || "",
          })
        ),

        propertyTransferDetails: rows.map((row) => {
          const selected = documentTypeOptions.find(
            (opt) => opt.label === row.documentType
          );

          return {
            newOwnerName: row.newOwnerName,
            mobileNo: row.mobileNo,
            documentType: selected ? selected.value : "",
            // documentURL: row.documentURL,
            // documentURLbase64: row.documentURLbase64,
            // transferArea: row.transferArea,
            transferArea:
              values.transferType === "propertyTransfer"
                ? areaInSqrt
                : row.transferArea,
            lstDocument: row.lstDocument?.map((doc) => ({
              documentURL: doc.documentURL || "",
              documentURLbase64: doc.documentURLbase64 || "",
            })) || [{ documentURL: "", documentURLbase64: "" }],
          };
        }),
      };
      //
      console.log("Final submit payload:", JSON.stringify(formData, null, 2));

      setLoading(true);

      // const response = await getSubmitApplication(formData);
      // showToastSuccess("Application submitted successfully.");

      const response = await getSubmitApplication(formData);

      if (response?.lstPropertyTransferResp?.length > 0) {
        navigate("/property-transfer-result", {
          state: { tableData: response.lstPropertyTransferResp },
        });
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
  const [ApplicantNameoptions, setApplicantNameOptions] = useState([
    // "Nikita",
    // "kakade",
  ]);
  const [properyDetails, setProperyDetails] = useState({});

  // const [MobileNooptions, setMobileNoOptions] = useState([""]);
  const [Emailoptions, setEmailOptions] = useState([""]);
  const [PropertyNumberoptions, setPropertyNumberOptions] = useState([""]);
  const [PropertyHolderNameoptions, setPropertyHolderNameOptions] = useState([
    "",
  ]);
  const [UseTypeoptions, setUseTypeOptions] = useState([""]);
  const [ConstructionTypeoptions, setConstructionTypeOptions] = useState([""]);
  const [AreaInSqrtoptions, setAreaInSqrtOptions] = useState([""]);
  const [PropertyAddressoptions, setPropertyAddressoptions] = useState([""]);
  const [SurveyNooptions, setSurveyNoOptions] = useState([""]);
  const [FlatNooptions, setFlatNoOptions] = useState([""]);
  const [LandMarkoptions, setLandMarkOptions] = useState([""]);
  const [AreaNameoptions, setAreaNameOptions] = useState([""]);
  const [PinCodeoptions, setPinCodeOptions] = useState([""]);
  const [ownerNameOptions, setOwnerNameOptions] = useState([""]);
  const [MobileNooptions, setMobileNoOptions] = useState([""]);
  const [mobilesNoOptions, setmobilesNoOptions] = useState([""]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([""]);
  const [TotalAddressoptions, setTotalAddressoptions] = useState([""]);
  const [totalAddress, setTotalAddress] = useState([""]);
  const [documentURLOptions, setDocumentURLOptions] = useState([""]);
  const [transferAreaOptions, setTransferAreaOptions] = useState([""]);
  const [ApplicantNameinputValue, setApplicantNameInputValue] = useState("");
  const [useType, setUseType] = useState("");
  const [areaName, setAreaName] = useState("");
  const [constructionType, setConstructionType] = useState("");
  const [areaInSqrt, setAreaInSqrt] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  // const [Mobileoptions, setMobileOptions] = useState("");
  const [Mobileoptions, setMobileOptions] = useState([""]);
  const [landMark, setLandMark] = useState("");
  const [surveyNo, setSurveyNo] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [PropertyHolderNameinputValue, setPropertyHolderNameInputValue] =
    useState("");
  const [ApplicantMobile, setApplicantMobile] = useState("");
  const [isSameAsAbove, setIsSameAsAbove] = useState("");
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyCodeFromURL = queryParams.get("propertyCode");
    setPropertyNumberOptions([propertyCodeFromURL]);
  }, []);

  // const apiGetPropertyDetails = async () => {
  //   //get-property-details-for-transfer
  //   const body = {
  //     propertyCode: ApplicantNameinputValue,
  //   };
  //   const [details] = await Promise.all([getPropertyDetailsForTransfer(body)]);
  //   setProperyDetails(details);
  // };

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getPropertyTransferDocumentType();
      setDocumentTypeOptions(res.lstDocVO); // must be [{label: "..."}]
    };
    fetchTypes();
  }, []);

  const apiGetPropertyDetails = async (propertyCode) => {
    if (!propertyCode || propertyCode.trim() === "" || propertyCode.length < 13)
      return;

    try {
      const details = await getPropertyDetailsForTransfer({
        propertyCode: propertyCode.trim(),
      });

      console.log("Full details from API:", details);

      setProperyDetails(details);
      setBalance(Number(details?.balance ?? 0));
      const roList = details.propertyDetailsROLst || [];
      const ratableSum = roList.reduce(
        (sum, row) => sum + Number(row.ratableValue || 0),
        0
      );

      const updatedValues = {
        ...formik.values,
        propertyAddress: details.propertyAddress || "",
        // mobile: details.mobile || "",
        totalArea: details.totalArea || 0,
        ownerName: details.ownerName || "",
        propertyKey: details.propertyKey || "",
        zoneKey: details.zoneKey || "",
        occupantName: details.propertyName || "",
        gatKey: details.gatKey || "",
        propertyCode: details.propertyCode || "",
        propertyMobileNo: details.propertyMobileNo || "",
        finalUseType: details.finalUseType || "",
        description: details.description || "",
        applicantAddress: details.propertyAddress || "",
        propertyDetailsROLst: details.propertyDetailsROLst || "",
        ratableValueSum: details.ratableValueSum || "",
        transferType: details.transferType || "Split",
      };

      formik.setValues(updatedValues);

      console.log("propertyDetailsROLst:", roList);
      console.log("ratableValueSum:", ratableSum);

      const holderName = details.propertyName?.trim() || "";
      const finalUse = details.finalUseType?.trim() || "";
      const desc = details.description?.trim() || "";
      const areaStr = (parseFloat(details.totalArea) || 0).toFixed(2);
      const addr = details.propertyAddress?.trim() || "";
      const mobi = details.propertyMobileNo?.trim() || "";

      setPropertyHolderNameOptions([holderName]);
      setUseTypeOptions([finalUse]);
      setPropertyHolderNameInputValue(holderName);
      setUseType(roList[0].useTypeName);
      setConstructionType(roList[0].constructionTypeName);
      setAreaInSqrt(areaStr);
      setPropertyAddress(addr);
      setMobile(mobi);

      handleFieldChange({
        target: { name: "propertyHolderName", value: holderName },
      });
      handleFieldChange({ target: { name: "useType", value: finalUse } });
      handleFieldChange({ target: { name: "constructionType", value: desc } });
      handleFieldChange({
        target: { name: "areaInSqrt", value: details.totalArea },
      });
      handleFieldChange({
        target: { name: "propertyAddress", value: details.propertyAddress },
      });
      handleFieldChange({
        target: { name: "mobile", value: details.propertyMobileNo },
      });
    } catch (error) {
      console.error(" Error fetching property details:", error);
      ///
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Something went wrong checking property number.",
        {
          toastId: propertyErrorToastId,
          autoClose: 6000,
        }
      );
    }
  };

  // const emailErrorToastId = "emailErrorToast";
  // const mobileErrorToastId = "mobileErrorToast";
  const propertyErrorToastId = "propertyErrorToast";
  const mobileErrorToastId = "mobileErrorToastId";
  const emailErrorToastId = "emailErrorToastId";

  const handleFieldChange = async (event) => {
    const { name, value } = event.target;

    // Email validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        if (!toast.isActive(emailErrorToastId)) {
          toast.error("Please enter a valid email address.", {
            toastId: emailErrorToastId,
            autoClose: false,
          });
        }
        return;
      } else {
        toast.dismiss(emailErrorToastId);
      }
    }

    // Mobile number validation
    if (name === "applicantMobile" || name === "mobileNo") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        if (!toast.isActive(mobileErrorToastId)) {
          toast.error("Mobile number must be exactly 10 digits.", {
            toastId: mobileErrorToastId,
            autoClose: false,
          });
        }
        return;
      } else {
        toast.dismiss(mobileErrorToastId);
      }
    }

    if (name === "propertyNumber") {
      try {
        if (value.length > 13) {
          const res = await getPropertyDetailsForTransfer({
            propertyCode: value,
          });
          console.log("Property check success:", res);
          // if success, you can update form values here
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
    newOwnerName: "",
    mobileNo: "",
    documentType: "",
    lstDocument: [
      {
        documentURL: "",
        documentURLbase64: "",
      },
    ],
    transferArea: "",
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
          lstDocument: [
            { documentURL: "", documentURLbase64: "" }, // initialize for map
          ],
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
    handleFieldChange({ target: { name: field, value } });
    if (field === "transferType" && value === "propertySplit") {
      const updatedRows = rows.map((row) => ({
        ...row,
        transferArea: row.transferArea || "",
      }));
      setRows(updatedRows);
    }
  };

  // const handleChange = (index, field, value) => {
  //   const updated = [...rows];
  //   updated[index][field] = value;
  //   setRows(updated);

  //   if (typeof handleFieldChange === "function") {
  //     handleFieldChange({ target: { name: field, value } });
  //   }
  // };

  // for row logic

  return (
    <>
      <Box sx={{ maxWidth: "100%", margin: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            // mb: 2,
            // backgroundColor: "#daf6a9ff",
            padding: 1,
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
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: "#1E3A8A", height: "5px", mb: 0.5 }} />

        <Box sx={{ ml: "90%", mb: 1 }}>
          <LanguageSelector />
        </Box>
        <FormikProvider value={formik}>
          <Form>
            {success && <Alert severity="success">{success}</Alert>}
            {loading && <Loader />}
            {/* {error && (
            <AlertMsg
              message={error}
              severity="error"
              onClose={() => {
                setError("");
              }}
            />
          )} */}
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
              <FormTitle title={labels.ApplicantDetails[lang]} />
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
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.ApplicantName[lang]}
                          required
                          sx={{
                            mb: 1,
                            display: "block",
                            width: "40%",
                          }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={ApplicantNameoptions}
                          value={ApplicantNameinputValue || ""} // controlled value
                          onInputChange={(event, newInputValue) => {
                            setApplicantNameInputValue(newInputValue);
                            handleFieldChange({
                              target: {
                                name: "applicantName",
                                value: newInputValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard"
                              onBlur={handleBlur}
                              placeholder="Enter or select Applicant Name"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                    st
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.MobileNo[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={MobileNooptions}
                          value={ApplicantMobile || ""} // controlled value
                          onInputChange={(event, mobileValue) => {
                            setApplicantMobile(mobileValue);
                            handleFieldChange({
                              target: {
                                name: "applicantMobile",
                                value: mobileValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter mobile no"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    p: 2,
                    display: "flex",
                    marginLeft: "13%",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.Email[lang]}
                          // required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={Emailoptions}
                          onInputChange={(event, newInputValue) => {
                            // setApplicantNameInputValue(newInputValue);
                            handleFieldChange({
                              target: {
                                name: "email",
                                value: newInputValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select email"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
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
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyNumber[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          value={PropertyNumberoptions[0] || ""}
                          options={PropertyNumberoptions}
                          onInputChange={(event, newInputValue) => {
                            apiGetPropertyDetails(newInputValue); // dynamic API error displayed
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard"
                              placeholder="Enter property number"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  {/* <FormValue
                  sx={{ width: "100%" }}
                  component={
                    <Box sx={{ width: "100%" }}>
                      <FormLabel
                        label={labels.PropertyHolderName[lang]}
                        required
                        sx={{ mb: 1, display: "block" }}
                      />
                      <Autocomplete
                        freeSolo
                        fullWidth
                        options={PropertyHolderNameoptions}
                        value={PropertyHolderNameinputValue || ""} // controlled value
                        onInputChange={(event, newInputValue) => {
                          setPropertyHolderNameInputValue(newInputValue);
                          handleFieldChange({
                            target: {
                              name: "propertyHolderName",
                              value: newInputValue,
                            },
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="standard"
                            onBlur={handleBlur}
                            placeholder="Enter or select Property Holder Name"
                            InputProps={{
                              ...params.InputProps,
                              sx: { p: 0 },
                            }}
                            sx={{
                              "& .MuiInputBase-root": { p: 0 },
                            }}
                          />
                        )}
                      />
                    </Box>
                  }
                /> */}
                </GridRow>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyHolderName[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={PropertyHolderNameoptions}
                          value={PropertyHolderNameinputValue || ""} // controlled value
                          onInputChange={(event, newInputValue) => {
                            setPropertyHolderNameInputValue(newInputValue);
                            handleFieldChange({
                              target: {
                                name: "propertyHolderName",
                                value: newInputValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard"
                              onBlur={handleBlur}
                              placeholder="Enter or select Property Holder Name"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.occupantName[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={PropertyHolderNameoptions}
                          value={PropertyHolderNameinputValue || ""} // controlled value
                          onInputChange={(event, newInputValue) => {
                            setPropertyHolderNameInputValue(newInputValue);
                            handleFieldChange({
                              target: {
                                name: "propertyHolderName",
                                value: newInputValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard"
                              onBlur={handleBlur}
                              placeholder="Enter or select Property Holder Name"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.UseType[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={UseTypeoptions}
                          value={useType || ""}
                          onInputChange={(event, newUsetypeValue) => {
                            setUseType(newUsetypeValue);
                            handleFieldChange({
                              target: {
                                name: "useType",
                                value: newUsetypeValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select use type"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.ConstructionType[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={ConstructionTypeoptions}
                          value={constructionType || ""}
                          onInputChange={(event, newConstructionValue) => {
                            setConstructionType(newConstructionValue);
                            handleFieldChange({
                              target: {
                                name: "constructionType",
                                value: newConstructionValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Construction Type"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.AreaInSqrtSqFoot[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={AreaInSqrtoptions}
                          value={areaInSqrt || ""}
                          onInputChange={(event, areaValue) => {
                            setAreaInSqrt(areaValue);
                            handleFieldChange({
                              target: {
                                name: "areaInSqrt",
                                value: areaValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Area In Sqrt"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PropertyAddress[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={PropertyAddressoptions}
                          value={propertyAddress || ""}
                          onInputChange={(event, addressValue) => {
                            setPropertyAddress(addressValue);
                            handleFieldChange({
                              target: {
                                name: "propertyAddress",
                                value: addressValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Property Address"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    p: 2,
                    display: "flex",
                    marginLeft: "13%",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.MobileNo[lang]}
                          required
                          sx={{ mb: 1, display: "block" }}
                        />

                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={Mobileoptions}
                          // options={
                          //   Array.isArray(Mobileoptions) ? Mobileoptions : []
                          // }
                          value={mobile || ""}
                          onInputChange={(event, mobilevalue) => {
                            setMobile(mobilevalue);
                            handleFieldChange({
                              target: {
                                name: "mobile",
                                value: mobilevalue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select mobile number"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                {/* <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "space-evenly",
                  bgcolor: "#e3f2fd", // or your previous FormTitle background
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mb: 2,
                }}
              > */}
                {/* Left side: Label + Checkbox together with no gap */}
                {/* <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mr: 60 }}>
                    {labels.ApplicantAddress[lang]}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isCopyAddressChecked}
                        onChange={(e) => {
                          setIsCopyAddressChecked(e.target.checked);
                          if (e.target.checked) {
                            setTotalAddress(propertyAddress);
                            handleFieldChange({
                              target: {
                                name: "totalAddress",
                                value: formik?.values?.propertyAddress || "", // Use your own source here if not Formik
                              },
                            });
                          }
                        }}
                        size="small"
                      />
                      // 1040209508.00
                    }
                    label="Same as Property Address"
                  />
                </Box> */}
                {/* </Box> */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "rgb(228, 240, 244)",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    mb: 2,
                    gap: 2,
                    pl: "13%",
                  }}
                >
                  {/* Left-aligned label */}
                  <Typography variant="h6" fontWeight={700}>
                    {labels.ApplicantAddress[lang]}
                  </Typography>

                  {/* Checkbox and its label inline with no margin issues */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={isCopyAddressChecked}
                      onChange={(e) => {
                        setIsCopyAddressChecked(e.target.checked);
                        if (e.target.checked) {
                          setTotalAddress(propertyAddress);
                          handleFieldChange({
                            target: {
                              name: "totalAddress",
                              value: formik?.values?.propertyAddress || "",
                            },
                          });
                        }
                      }}
                      size="small"
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "medium",
                        fontWeight: 500,
                      }}
                    >
                      {/* Same as Property Address */}
                      {/* मालमत्ता पत्त्याप्रमाणेच label= */}
                      {labels.SameAsPropertyAddress[lang]}
                    </Typography>
                  </Box>
                </Box>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.SurveyNo[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={SurveyNooptions}
                          value={surveyNo || ""}
                          onInputChange={(event, surveyValue) => {
                            setSurveyNo(surveyValue);
                            handleFieldChange({
                              target: {
                                name: "surveyNo",
                                value: surveyValue,
                              },
                            });
                          }}
                          disabled={isCopyAddressChecked}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Survey No"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.FlatNo[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={FlatNooptions}
                          value={flatNo || ""}
                          onInputChange={(event, flatValue) => {
                            setFlatNo(flatValue);
                            handleFieldChange({
                              target: {
                                name: "flatNo",
                                value: flatValue,
                              },
                            });
                          }}
                          disabled={isCopyAddressChecked}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select FlatNo"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.AreaName[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={AreaNameoptions}
                          value={areaName || ""}
                          onInputChange={(event, areaValue) => {
                            setAreaName(areaValue);
                            handleFieldChange({
                              target: {
                                name: "areaName",
                                value: areaValue,
                              },
                            });
                          }}
                          disabled={isCopyAddressChecked}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Area Name"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />

                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.LandMark[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={LandMarkoptions}
                          value={landMark || ""}
                          onInputChange={(event, landMarkValue) => {
                            setLandMark(landMarkValue);
                            handleFieldChange({
                              target: {
                                name: "landMark",
                                value: landMarkValue,
                              },
                            });
                          }}
                          disabled={isCopyAddressChecked}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select LandMark"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                </GridRow>

                <GridRow
                  sx={{
                    gap: 10, // space between two boxes
                    p: 2, // padding around the entire row
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.PinCode[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={PinCodeoptions}
                          value={pinCode || ""}
                          onInputChange={(event, pinValue) => {
                            setPinCode(pinValue);
                            handleFieldChange({
                              target: {
                                name: "pinCode",
                                value: pinValue,
                              },
                            });
                          }}
                          disabled={isCopyAddressChecked}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Pin Code"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
                  <FormValue
                    sx={{ width: "100%" }}
                    component={
                      <Box sx={{ width: "100%" }}>
                        <FormLabel
                          label={labels.TotalAddress[lang]}
                          sx={{ mb: 1, display: "block" }}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={TotalAddressoptions}
                          value={totalAddress || ""}
                          onInputChange={(event, newInputValue) => {
                            // setApplicantNameInputValue(newInputValue);
                            handleFieldChange({
                              target: {
                                name: "totalAddress",
                                value: newInputValue,
                              },
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="standard" // full square border
                              onBlur={handleBlur}
                              placeholder="Enter or select Total Address"
                              InputProps={{
                                ...params.InputProps,
                                sx: { p: 0 },
                              }}
                              sx={{
                                "& .MuiInputBase-root": { p: 0 },
                              }}
                            />
                          )}
                        />
                      </Box>
                    }
                  />
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
                      <span>{labels.TransferType[lang]}</span>

                      {/* Right side: two radio buttons */}
                      <RadioGroup
                        row
                        name="transferType"
                        value={formik.values.transferType}
                        onChange={formik.handleChange}
                      >
                        <FormControlLabel
                          value="propertyTransfer"
                          control={<Radio />}
                          label={labels.propertyTransfer[lang]}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontWeight: "600",
                            },
                          }}
                        />
                        <FormControlLabel
                          value="propertySplit"
                          control={<Radio />}
                          label={labels.propertySplit[lang]}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontWeight: "600",
                              fontSize: "medium",
                            },
                          }}
                        />
                      </RadioGroup>
                    </Box>
                  }
                />

                <FormTitle title={labels.BuyerDetail[lang]} />
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
                          name: "newOwnerName",
                          label: labels.BuyerName[lang],
                          value: row.newOwnerName,
                        },
                        {
                          name: "mobileNo",
                          label: labels.MobileNo[lang],
                          value: row.mobileNo,
                        },
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
                        {
                          name: "transferArea",
                          label: labels.TransferAreaSqFoot[lang],
                          value:
                            formik.values.transferType == "propertyTransfer"
                              ? areaInSqrt
                              : row.transferArea,
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
                              getOptionLabel={(option) => option.label}
                              value={
                                field.value ? { label: field.value } : null
                              }
                              onChange={(event, newValue) => {
                                const selectedLabel = newValue?.label || "";
                                handleChange(index, field.name, selectedLabel);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  placeholder={field.label}
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: { p: 0 },
                                  }}
                                  sx={{ "& .MuiInputBase-root": { p: 0 } }}
                                />
                              )}
                            />
                          ) : field.name === "documentURL" ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {row.lstDocument.map((doc, docIndex) => (
                                <Box
                                  key={docIndex}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;

                                      const updatedDocs = [...row.lstDocument];
                                      updatedDocs[docIndex].documentURL =
                                        file.name;

                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        updatedDocs[
                                          docIndex
                                        ].documentURLbase64 = reader.result;
                                        handleChange(
                                          index,
                                          "lstDocument",
                                          updatedDocs
                                        );
                                      };
                                      reader.readAsDataURL(file);

                                      handleChange(
                                        index,
                                        "lstDocument",
                                        updatedDocs
                                      );
                                    }}
                                    style={{
                                      fontSize: "0.875rem",
                                      width: "100%",
                                    }}
                                  />

                                  {doc.documentURL && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      {/* {doc.documentURL} */}
                                    </Typography>
                                  )}

                                  {row.lstDocument.length > 1 && (
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      onClick={() => {
                                        const updatedDocs =
                                          row.lstDocument.filter(
                                            (_, i) => i !== docIndex
                                          );
                                        handleChange(
                                          index,
                                          "lstDocument",
                                          updatedDocs
                                        );
                                      }}
                                    >
                                      -
                                    </Button>
                                  )}
                                </Box>
                              ))}

                              {/* ADD DOCUMENT BUTTON */}
                              <Button
                                variant="contained"
                                onClick={() => {
                                  const updatedDocs = [
                                    ...row.lstDocument,
                                    { documentURL: "", documentURLbase64: "" },
                                  ];
                                  handleChange(
                                    index,
                                    "lstDocument",
                                    updatedDocs
                                  );
                                }}
                                sx={{
                                  minWidth: "50px",
                                  height: "30px",
                                  width: "30px",
                                  marginLeft: "25%",
                                }}
                              >
                                +
                              </Button>
                            </Box>
                          ) : (
                            <TextField
                              name={field.name}
                              value={field.value}
                              onChange={(e) =>
                                handleChange(index, field.name, e.target.value)
                              }
                              variant="standard"
                              fullWidth
                              placeholder={field.label}
                              InputProps={{ sx: { p: 0 } }}
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
                    isValid={!(formik.isValid && formik.dirty) || balance > 0}
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
      </Box>
    </>
  );
};

export default TransferForm;
