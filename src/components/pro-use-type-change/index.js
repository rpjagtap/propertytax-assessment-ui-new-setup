import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { useTypeApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormValue } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import DateInput from "../form-fields/date-picker";
import FormButtons from "../common/buttons";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import AssessmentTable from "../sr-register/assessmentTable";

import {
  getAllProTransactions,
  getGatByZonekey,
  getZoneByProfile,
  getPropertyOwnerDetails,
  submitUpdatePropertyUseTypeChange,
} from "../../services/assessment-services";

// Theme tokens
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const FieldRow = ({ label, children }) => (
  <Grid item xs={12} md={6}>
    <Box display="flex" alignItems="center">
      <Box minWidth={160}>
        <Typography fontWeight={600} fontSize={14} color={NAVY}>
          {label}:
        </Typography>
      </Box>
      {children}
    </Box>
  </Grid>
);

const SectionCard = ({ icon, title, subtitle, children, footer, scrollX }) => (
  <Card elevation={3} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: MINT_BG, color: MINT, width: 36, height: 36 }}>
          {icon}
        </Avatar>
      }
      title={title}
      titleTypographyProps={{ fontWeight: 700, fontSize: 16, color: NAVY }}
      subheader={subtitle}
      sx={{ pb: 1 }}
    />
    <Divider />
    <CardContent sx={{ p: 3, ...(scrollX ? { overflowX: "auto" } : {}) }}>
      {children}
    </CardContent>
    {footer && (
      <>
        <Divider />
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", bgcolor: "#FAFBFD" }}>
          {footer}
        </Box>
      </>
    )}
  </Card>
);

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
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

const PropertyUseTypeChangeApplication = () => {
  const initialState = {
    transactionTypeId: "",
    zoneKey: "",
    gatKey: "",
    propertyCode: "",
    sr1Date: getCurrentDate(),
    finalUseType: "",
    finalConstructionType: "",
    description: "",
    documents: [
      {
        documentId: "",
        documentURLbase64: "",
      },
    ],
  };

  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading, error, setError } = useApiState();
  const navigate = useNavigate();

  const [allTrsactions, setAllTrsactions] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  const applicationNoFromURL = searchParams.get("applicationNo");

  const [propertyOwnerDetails, setPropertyOwnerDetails] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [occupant, setOccupant] = useState("");
  const [oldUseTypeDtls, setOldUseTypeDtls] = useState([]);
  const [oldPropertyKey, setOldPropertyKey] = useState("");

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: useTypeApplicationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const transactionsOptions = useMemo(
    () =>
      allTrsactions.map((item) => ({
        value: item.id,
        label: item.marTransactionTypeName,
      })),
    [allTrsactions]
  );

  // Set transaction type from URL
  useEffect(() => {
    if (transactionTypeIdFromURL && transactionsOptions.length > 0) {
      const match = transactionsOptions.find(
        (item) => String(item.value) === String(transactionTypeIdFromURL)
      );
      if (match) {
        formik.setFieldValue("transactionTypeId", match.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionTypeIdFromURL, transactionsOptions]);

  // Fetch property details once propertyCode, zoneKey AND gatKey are available
//   useEffect(() => {
//     const { zoneKey, gatKey } = formik.values;
//     if (!propertyCodeFromURL || !zoneKey || !gatKey) return;

//     const loadPropertyOwnerDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await getPropertyOwnerDetails({
//           propertyCode: propertyCodeFromURL,
//         });
//         if (response) {
//           setPropertyOwnerDetails(response.propertyName || "");
//           setPropertyAddress(response.propertyAddress || "");
//           setMobileNo(response.propertyMobileNo || "");
//           setOccupant(response.occupantName || "");
//           setOldUseTypeDtls(response.propertyDetailsROLst || []);
//           setOldPropertyKey(response.propertyKey || "");
//         }
//       } catch (error) {
//         showToastError(getErrorMsg(error));
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadPropertyOwnerDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [propertyCodeFromURL, formik.values.zoneKey, formik.values.gatKey]);

      // Fetch property details once propertyCode, zoneKey AND gatKey are available
  useEffect(() => {
    const { zoneKey, gatKey } = formik.values;
    if (!propertyCodeFromURL || !zoneKey || !gatKey) return;

    const loadPropertyOwnerDetails = async () => {
      try {
        setLoading(true);
        const response = await getPropertyOwnerDetails({
          propertyCode: propertyCodeFromURL,
          zoneKey,
          gatKey,
        });
        if (response) {
          setPropertyOwnerDetails(response.propertyName || "");
          setPropertyAddress(response.propertyAddress || "");
          setMobileNo(response.propertyMobileNo || "");
          setOccupant(response.occupantName || "");
          setOldUseTypeDtls(response.propertyDetailsROLst || []);
          setOldPropertyKey(response.propertyKey || "");
        }
      } catch (error) {
        // clear old details if this zone/gat combination is not valid for the property
        setPropertyOwnerDetails("");
        setPropertyAddress("");
        setMobileNo("");
        setOccupant("");
        setOldUseTypeDtls([]);
        setOldPropertyKey("");
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };

    loadPropertyOwnerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCodeFromURL, formik.values.zoneKey, formik.values.gatKey]);


  // Load transaction types + zones (once)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes, zonesRes] = await Promise.all([
          getAllProTransactions(),
          getZoneByProfile(),
        ]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load gats whenever the zone changes
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

  useEffect(() => {
    if (oldPropertyKey) {
      formik.setFieldValue("oldPropertyKey", oldPropertyKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldPropertyKey]);

  const handleSubmitButtonClick = async (e) => {
    e?.preventDefault?.();
    const values = formik.values;
    const body = {
      requestId: generateUUID(),
      channelName: "PropertyTax",
      propertyTransactionVO: [
        {
          // PropertyInfoForm
          transactionTypeId: values.transactionTypeId,
          oldPropertyKey: values.oldPropertyKey,
          propertyCode: propertyCodeFromURL || values.propertyCode,
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
          // PropertyDocumentsForm
          documentVOs: values.documents.map((doc) => ({
            documentId: doc.documentId,
            documentURLbase64: doc.documentURLbase64,
          })),
          // AssessmentTable
          propertyTransactionDetailsVO: (values.propertyTransactionDetailsVO || []).map((row) => ({
            oldPropertyKey: values.oldPropertyKey,
            oldPropertyDetailsKey: row.propertyDetailsKey,
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
          })),
        },
      ],
    };

    try {
      setLoading(true);
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
  };

  return (
    <DashBoardContainer>
      {error && (
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => {
            setError("");
          }}
        />
      )}

      <ScrollBottom />
      <ScrollTop />

      <Box sx={{ p: 2 }}>
        <FormikProvider value={formik}>
          {/* Header band */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,0.12)", color: "#5DCAA5" }}>
                <HomeWorkOutlined />
              </Avatar>
              <Box>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                  {labels?.UseTypechangeApplicationTitle?.[lang] || "Use Type Change Application"}
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  Review the current property details and submit the use type change request.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.5)",
                textTransform: "none",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Back
            </Button>
          </Box>

          <Form>
            {/* ---------- Property details ---------- */}
            <SectionCard
              icon={<HomeWorkOutlined fontSize="small" />}
              title="Property details"
              subtitle="Existing owner, occupant and property information on record"
            >
              <Grid container spacing={3}>
                <FieldRow label={labels.Type[lang]}>
                  <SelectInput name="transactionTypeId" options={transactionsOptions} disabled />
                </FieldRow>

                <FieldRow label={labels.PropertyNumber[lang]}>
                  <TextField fullWidth variant="standard" size="small" name="propertyCode" disabled value={propertyCodeFromURL || ""} />
                </FieldRow>

                <FieldRow label={labels.Zone[lang]}>
                  <SelectInput name="zoneKey" options={zoneKeys} />
                </FieldRow>

                <FieldRow label={labels.Gat[lang]}>
                  <SelectInput name="gatKey" options={gatKeys} />
                </FieldRow>

                <FieldRow label={labels.ownerName[lang]}>
                  <TextField variant="standard" size="small" name="propertyOwnerName" disabled value={propertyOwnerDetails} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.PropertyAddress[lang]}>
                  <TextField variant="standard" size="small" multiline name="propertyAddress" disabled value={propertyAddress} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.occupantName[lang]}>
                  <TextField variant="standard" size="small" name="occupantName" disabled value={occupant} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.MobileNo[lang]}>
                  <TextField variant="standard" size="small" name="mobileNo" disabled value={mobileNo} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.SRDate[lang]}>
                  <DateInput name="sr1Date" required />
                </FieldRow>

                <FieldRow label={labels.description[lang]}>
                  <FormValue component={<TextInput name="description" multiline rows={1} required variant="standard" />} />
                </FieldRow>
              </Grid>
            </SectionCard>

            {/* ---------- Documents ---------- */}
            <SectionCard
            //   icon={<DescriptionOutlined fontSize="small" />}
            //   title={labels?.DocumentDetails?.[lang] || "Document details"}
            //   subtitle="Attach supporting documents for this use type change request"
            >
              <Grid container spacing={3}>
                <Grid container item spacing={3} xs={12}>
                  <PropertyDocumentsForm />
                </Grid>
              </Grid>
            </SectionCard>

            {/* ---------- Use type + submit ---------- */}
            <SectionCard
              scrollX
              icon={<ApartmentOutlined fontSize="small" />}
              title={labels?.useType?.[lang] || "Use type"}
              subtitle="Update the use type details for this property"
              footer={
                <FormButtons
                  isValid={!formik.isValid || !formik.dirty}
                  handleSubmitButtonClick={handleSubmitButtonClick}
                  resetForm={() => {
                    window.location.reload();
                  }}
                  submitBtnLabel="Submit"
                  isSubmitIcon={false}
                  cancelRedirect="/PropertyTransactionsDashBoard"
                />
              }
            >
              <Grid container spacing={3}>
                <Grid container item spacing={3} xs={12}>
                  <AssessmentTable
                    zoneKey={formik.values.zoneKey}
                    initialRows={oldUseTypeDtls}
                    disableAddButton={true}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </Form>
        </FormikProvider>
      </Box>
    </DashBoardContainer>
  );
};

export default PropertyUseTypeChangeApplication;