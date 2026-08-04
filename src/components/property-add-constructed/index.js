import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, TextField, Grid, Paper } from "@mui/material";
import { useNavigate } from 'react-router-dom';

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { useTypeApplicationSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import { useSearchParams } from "react-router-dom";
import { useFormikContext } from "formik";
import DateInput from "../form-fields/date-picker";
import { TableContainer } from "@mui/material";



import {
  getAllProTransactions,
  getGatByZonekey,
  getZoneByProfile,
  getPropertyOwnerDetails,
  submitUpdatePropertyUseTypeChange,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import AssessmentTable from "../sr-register/assessmentTable";


const PropertyAddConstructedApplication = () => {
  const initialState = {
    transactionTypeId: "",
    zoneKey: "",
    gatKey: "",
    propertyCode: "",
    sr1Date: getCurrentDate(),
    finalUseType: "",
    finalConstructionType: "",
    description: "",
    propertyTransactionDetailsVO: [],
    documents: [
      {
        documentId: "",
        documentURLbase64: "",
      },
    ],
  };

  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading, error, setError } = useApiState();
  const [allTrsactions, setAllTrsactions] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  const applicationNoFromURL = searchParams.get("applicationNo");
  const [propertyOwnerDetails, setPropertyOwnerDetails] = useState([]);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [occupant, setOccupant] = useState("");
  const [oldUseTypeDtls, setOldUseTypeDtls] = useState([]);
  const [oldPropertyKey, setOldPropertyKey] = useState("");

  const formik = useFormik({
    initialValues: initialState,
    propertyOwnerName: propertyOwnerDetails || "",
    propertyAddress: propertyAddress || "",
    occupant: occupant || "",
    validationSchema: useTypeApplicationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const transactionsOptions = useMemo(() =>
    allTrsactions.map(item => ({
      value: item.id,
      label: item.marTransactionTypeName,
    })), [allTrsactions]
  );

  useEffect(() => {
    if (transactionTypeIdFromURL && transactionsOptions.length > 0) {
      const match = transactionsOptions.find(
        (item) => String(item.value) === String(transactionTypeIdFromURL)
      );
      if (match) {
        formik.setFieldValue("transactionTypeId", match.value); // only id if formik expects id
      }
    }
  }, [transactionTypeIdFromURL, transactionsOptions]);

  useEffect(() => {
    if (propertyCodeFromURL) {
      formik.setFieldValue("propertyCode", propertyCodeFromURL);
      const propertyOwnerDetails = async () => {
        try {
          setLoading(true);
          const response = await getPropertyOwnerDetails({
            propertyCode: propertyCodeFromURL
          });
          if (response) {
            setPropertyOwnerDetails(response.propertyName);
            setPropertyAddress(response.propertyAddress);
            setMobileNo(response.propertyMobileNo);
            setOccupant(response.occupantName);
            setOldUseTypeDtls(response.propertyDetailsROLst || []);
            setOldPropertyKey(response.propertyKey);
          }
        } catch (error) {
          showToastError(getErrorMsg(error));
        } finally {
          setLoading(false);
        }
      };
      propertyOwnerDetails();
    }
  }, [propertyCodeFromURL]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes, zonesRes] = await Promise.all([getAllProTransactions(), getZoneByProfile()]);
        setAllTrsactions(allProTransactionsRes);
        setZoneKeys(zonesRes.zoneLst);
        if (zonesRes.zoneLst.length === 1) {
          formik.setFieldValue("zoneKey", zonesRes.zoneLst[0].value);
        }
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);



  useEffect(() => {
    formik.setFieldValue("gatKey", "");
    setGatKeys([]);
    const loadGatData = async () => {
      try {
        setLoading(true);
        const gatRes = await getGatByZonekey({
          zoneKey: formik.values.zoneKey,
        });
        setGatKeys(gatRes.gatLst);
        if (gatRes.gatLst.length === 1) {
          formik.setFieldValue("gatKey", gatRes.gatLst[0].value);
        }
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    if (formik.values.zoneKey) {
      loadGatData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zoneKey]);

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
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  useEffect(() => {
    if (oldPropertyKey) {
      formik.setFieldValue("oldPropertyKey", oldPropertyKey);
    }
  }, [oldPropertyKey]);

  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();
    const values = formik.values;
    const body = {
      requestId: generateUUID(),
      channelName: "PropertyTax",
      propertyTransactionVO: [
        {
          // PropertyInfoForm
          transactionTypeId: values.transactionTypeId,
          oldPropertyKey: values.oldPropertyKey,          
          propertyCode: values.propertyCode,
          propertyName: propertyOwnerDetails || "",
          propertyOccupantName: occupant || "",
          propertyAddress: propertyAddress || "",
          propertyMobileNo: mobileNo,
          zoneKey: values.zoneKey,
          gatKey: values.gatKey,
          sr1Date: values.sr1Date,
          description: values.description,
          assessmentFinYear: "",
          specialOwnershipId: "",
          waterConnNo: "",
          drainageNo: "",
          finalConstructionType: values.finalConstructionType,
          applicationId: applicationNoFromURL,
          finalUseType: values.finalUseType,
          //PropertyDocumentsForm
          

          propertyTransactionDetailsVO: [
            ...oldUseTypeDtls.map((row) => ({
              oldPropertyKey: values.oldPropertyKey || null,
              oldPropertyDetailsKey: row.propertyDetailsKey || null,
              useTypeKey: row.useTypeKey,
              subUseTypeKey: row.subuseTypeKey,
              constructionTypeKey: row.constructionTypeKey,
              occuapncyKey: row.occupancyKey,
              specialOccupantKey: row.specialOccupantKey,
              assessmentDate: row.assessmentDate,
              area: row.area,
              rateableValue: row.rate,
              toiletFlag: row.toilet === "Y" ? "Y" : "N",
              permission: row.permission === "Y" ? "Y" : "N"
            })),

            ...values.propertyTransactionDetailsVO.map((row) => ({             
              useTypeKey: row.useType,
              subUseTypeKey: row.subUseType,
              constructionTypeKey: row.constructionType,
              occuapncyKey: row.occupancy,
              specialOccupantKey: row.specialResidents,
              assessmentDate: row.assessmentDate || getCurrentDate(),
              area: row.areaInSqmt,
              rateableValue: row.rVValue,
              toiletFlag: row.isToilet ? "Y" : "N",
              permission: row.isIllegal ? "Y" : "N",
            }))
          ],
          documentVOs: values.documents.map(doc => ({
            documentId: doc.documentId,
            documentURLbase64: doc.documentURLbase64,
          })),
        }
      ]
    }

    try {
     //console.log("submit body", body);

      setLoading(true);
     // const response = '';
       const response = await submitUpdatePropertyUseTypeChange(body);

      if (response?.applicationId) {
        localStorage.setItem("applicationId", response.applicationId);
        localStorage.setItem("transactionTypeId", values.transactionTypeId);
        navigate("/assessment-document");
      } else {
        showToastError("Error occurred. Please try again.");
      }
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  }

  const navigate = useNavigate();

  return (  

    <DashBoardContainer>
      {error && (
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => setError("")}
        />
      )}

      <ScrollBottom />
      <ScrollTop />

      {/* OUTER BACKGROUND CONTAINER */}
      <Box
        sx={{
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          justifyContent: "center",
          p: 4,
          borderRadius: 4,
          margin: 5
        }}
      >
        {/* FIXED CONTENT WIDTH */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "1400px",
            marginX: "auto",
            float: "left",
          }}
        >
          <FormikProvider value={formik}>
            <Form>

              {/* ================= TITLE ================= */}
              <Typography
                variant="h5"
                fontWeight="bolder"
                align="center"
                py={2}
              >
                {labels?.AdditionalConstructedPropertyTitle?.[lang] || ""}
              </Typography>

              {/* ================= BASIC DETAILS ================= */}             

              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  padding: 5,
                  marginLeft: "1.5%",
                  borderRadius: 5,
                  display: "flex", justifyContent: "center",
                }}
              >
                {/* <Paper elevation={4} sx={{ marginBottom: "15px" }}> */}
                <Grid container spacing={3}>

                  <Grid container item spacing={3} xs={12}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.Type[lang]}:
                          </Typography>
                        </Box>
                        <SelectInput name="transactionTypeId" options={transactionsOptions} disabled />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.PropertyNumber[lang]}:
                          </Typography>
                        </Box>
                        <TextField fullWidth variant="standard" size="small" name="propertyCode" disabled value={propertyCodeFromURL} />
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container item spacing={3} xs={12}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.Zone[lang]}:
                          </Typography>
                        </Box>
                        <SelectInput name="zoneKey" options={zoneKeys} />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.Gat[lang]}:
                          </Typography>
                        </Box>
                        <SelectInput name="gatKey" options={gatKeys} />
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container item spacing={3} xs={12}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.ownerName[lang]}:
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth={false}
                          variant="standard"
                          size="small"
                          name="propertyOwnerName" disabled value={propertyOwnerDetails}
                          sx={{ width: "100%" }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.PropertyAddress[lang]}:
                          </Typography>
                        </Box>
                        <TextField
                          multiline={true} name="propertyAddress" value={propertyAddress} disabled variant="standard" sx={{ width: "100%" }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container item spacing={3} xs={12}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.occupantName[lang]}:
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth={false}
                          variant="standard"
                          size="small"
                          name="occupantName" disabled value={occupant}
                          sx={{ width: "100%" }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.MobileNo[lang]}:
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth={false}
                          variant="standard"
                          size="small"
                          name="mobileNo" disabled value={mobileNo}
                          sx={{ width: "100%" }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container item spacing={3} xs={12}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.SRDate[lang]}:
                          </Typography>
                        </Box>
                        <DateInput name="sr1Date" required />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center">
                        <Box minWidth={140}>
                          <Typography fontWeight="bold">
                            {labels.description[lang]}:
                          </Typography>
                        </Box>
                        <FormValue component={<TextInput name="description" multiline rows={1} required variant="standard" />} />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>


              <Typography
                variant="h5"
                fontWeight="bolder"
                align="center"
                py={2}
              >
                {labels?.DocumentDetails?.[lang] || ""}
              </Typography>

              {/* <Paper elevation={3} sx={{ p: 4, borderRadius: 5 }}>
                <PropertyDocumentsForm />
              </Paper> */}

              <Paper
                elevation={3}
                sx={{
                  width: "90%",
                  padding: 5,
                  marginLeft: "1.5%",
                  borderRadius: 5,
                }}
              >
                <Grid container spacing={3}>
                  <Grid container item spacing={3} xs={12}>
                    <PropertyDocumentsForm />
                  </Grid>
                </Grid>
              </Paper>


              <Typography
                variant="h5"
                fontWeight="bolder"
                align="center"
                py={2}
              >
                {labels?.DocumentDetails?.[lang] || ""}
              </Typography>

              <Paper elevation={3} sx={{ p: 4, borderRadius: 5 }}>
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#abd9e3" }}>
                        <TableCell>{labels.useType[lang]}</TableCell>
                        <TableCell>{labels.secUseType[lang]}</TableCell>
                        <TableCell>{labels.constructionType[lang]}</TableCell>
                        <TableCell>{labels.Occupancy[lang]}</TableCell>
                        <TableCell>{labels.SpecialResidents[lang]}</TableCell>
                        <TableCell>{labels.aakarniDate[lang]}</TableCell>
                        <TableCell>{labels.areaInMeter[lang]}</TableCell>
                        <TableCell>{labels.taxAmount[lang]}</TableCell>
                        <TableCell>{labels.Toilet[lang]}</TableCell>
                        <TableCell>{labels.Illegal[lang]}</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {oldUseTypeDtls.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.useTypeName}</TableCell>
                          <TableCell>{row.subuseTypeName}</TableCell>
                          <TableCell>{row.constructionTypeName}</TableCell>
                          <TableCell>{row.occupancyName}</TableCell>
                          <TableCell>{row.specialOccupantName}</TableCell>
                          <TableCell>{row.assessmentDate}</TableCell>
                          <TableCell>{row.area}</TableCell>
                          <TableCell>{row.rate}</TableCell>
                          <TableCell>{row.toilet === "Y" ? "Yes" : "No"}</TableCell>
                          <TableCell>{row.permission === "Y" ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* ================= ASSESSMENT TABLE ================= */}            

              <Typography
                variant="h5"
                fontWeight="bolder"
                align="center"
                paddingBottom={2}
                paddingTop={2}
              >
                {labels?.DocumentDetails?.[lang] || ""}
              </Typography>
               
              {/* <Box sx ={{ width: "100%", overflowX: "auto" }}> */}               

                <Paper elevation={3} sx={{ p: 4, borderRadius: 5,overflowX: "auto", }}>
                  <Grid container spacing={3}>
                    <Grid container item spacing={3} xs={12}>
                      <AssessmentTable
                        zoneKey={formik.values.zoneKey}
                        // initialRows={oldUseTypeDtls}
                        disableAddButton={false}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              {/* </Box> */}

              {/* ================= BUTTONS ================= */}
              <Grid container justifyContent="center" mt={3}>
                <FormButtons
                  isValid={!formik.isValid || !formik.dirty}
                  handleSubmitButtonClick={handleSubmitButtonClick}
                  resetForm={() => window.location.reload()}
                  submitBtnLabel="Submit"
                  isSubmitIcon={false}
                  cancelRedirect="/PropertyTransactionsDashBoard"
                />
              </Grid>

            </Form>
          </FormikProvider>
        </Box>
      </Box>
    </DashBoardContainer>

  );
};
export default PropertyAddConstructedApplication;