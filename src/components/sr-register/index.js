import React, { useState, useMemo } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import TaskAltOutlined from "@mui/icons-material/TaskAltOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import { useSearchParams, useNavigate } from "react-router-dom";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { srRegisterFullFormSchema } from "../../utils/validation-schema";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import { submitPropertyTransaction } from "../../services/assessment-services";

import PropertyInfoForm from "./propertyInfoForm";
import OwnerInfoForm from "./ownerInfoForm";
import OccupantInfoForm from "./occupaneInfoForm";
import PropertyAddressForm from "./porpertyAddressForm";
import PropertyDocumentsForm from "./propertyDocumentsForm";
import AssessmentTable from "./assessmentTable";

// Theme tokens — same values used across the other redesigned pages.
// Kept local so this file has no dependency on shared common/ components.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

// =============================
// Wizard Component
// =============================
const WizardWrapper = ({ step, setStep, steps, handleSubmitButtonClick }) => {
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Step tabs */}
      <Box sx={{ px: { xs: 1, md: 3 }, pt: 2.5, pb: 2 }}>
        <Tabs
          value={step}
          onChange={(e, v) => setStep(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTabs-flexContainer": {
              justifyContent: { xs: "flex-start", md: "center" },
              gap: 1,
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {steps.map((s, i) => {
            const active = step === i;
            const done = i < step;
            return (
              <Tab
                key={i}
                label={s.label}
                icon={done ? <CheckCircleOutline sx={{ fontSize: 18 }} /> : undefined}
                iconPosition="start"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "12px", sm: "13px", md: "14px" },
                  minHeight: { xs: 40, md: 44 },
                  px: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  border: "1px solid",
                  borderColor: active ? NAVY : done ? "#BFE5D7" : "#DDE3EC",
                  bgcolor: active ? NAVY : done ? MINT_BG : "#F6F8FB",
                  color: active ? "#fff" : done ? MINT : NAVY,
                  transition: "background-color 0.15s ease",
                  "&.Mui-selected": { color: "#fff" },
                  "&:hover": {
                    bgcolor: active ? NAVY_LIGHT : done ? "#D2F0E4" : "#EDF1F7",
                  },
                }}
              />
            );
          })}
        </Tabs>
      </Box>

      <Divider />

      {/* Active step content */}
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>{steps[step].component}</Box>

      <Divider />

      {/* Navigation footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 2,
          bgcolor: "#FAFBFD",
        }}
      >
        <Button
          variant="outlined"
          disabled={step === 0}
          onClick={prev}
          startIcon={<ArrowBackOutlined />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            borderColor: NAVY,
            color: NAVY,
            "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
          }}
        >
          Previous
        </Button>

        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Step {step + 1} of {steps.length}
        </Typography>

        <Button
          variant="contained"
          onClick={isLast ? handleSubmitButtonClick : next}
          endIcon={isLast ? <TaskAltOutlined /> : <ArrowForwardOutlined />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            bgcolor: isLast ? MINT : NAVY,
            "&:hover": { bgcolor: isLast ? "#0B5A46" : NAVY_LIGHT },
          }}
        >
          {isLast ? "Submit" : "Next"}
        </Button>
      </Box>
    </>
  );
};

// =============================
// MAIN COMPONENT
// =============================
const SrRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationNoFromURL = searchParams.get("applicationNo");

  const { loading, setLoading, error, setError } = useApiState();

  const [zoneKey, setZoneKey] = useState("");
  const [step, setStep] = useState(0);

  // -----------------------------
  // Initial form values
  // -----------------------------
  const initialState = useMemo(
    () => ({
      transactionType: "",
      PropertyNumber: "",
      zoneKey: "",
      gatKey: "",
      srDate: getCurrentDate(),
      propertyDescription: "",
      fYear: "",
      specialOwnership: "",
      waterConnNo: "",
      drainageNo: "",
      propertyOwnerName: "",
      propertyAddress: "",
      occupantName: "",
      emailId: "",
      mobileNo: "",

      marFirstOwnerName: "",
      marMiddleOwnerName: "",
      marLastOwnerName: "",
      engFirstOwnerName: "",
      engMiddleOwnerName: "",
      engLastOwnerName: "",
      ownerMobile: "",
      ownerEmail: "",
      ownerAdharNo: "",

      engFirstOccupantName: "",
      engMiddleOccupantName: "",
      engLastOccupantName: "",
      marFirstOccupantName: "",
      marMiddleOccupantName: "",
      marLastOccupantName: "",
      occupantMobile: "",
      occupantEmail: "",
      occupantAdharNo: "",

      flatNo: "",
      blockNo: "",
      floorMarathi: "",
      floor: "",
      buildingNo: "",
      wingNameMarathi: "",
      wingName: "",
      societyNameMarathi: "",
      societyName: "",
      landmarkMarathi: "",
      landmark: "",
      towerNameMarathi: "",
      towerName: "",
      villageMarathi: "",
      village: "",
      pinCode: "",
      marPropertyAddress: "",
      engPropertyAddress: "",

      documents: [
        {
          documentId: "",
          documentURLbase64: "",
        },
      ],

      propertyTransactionDetailsVO: [],

      totalArea: "",
      totalTaxAmount: "",
      finalUseType: "",
      finalConstructionType: "",
      useType: "",
      subUseType: "",
      constructionType: "",
      occupancy: "",
      specialOccupant: "",
      assessmentDate: getCurrentDate(),
      areaInSqmt: "",
      rateableValue: "",
      taxAmount: "",
      isToilet: false,
      isIllegal: false,
    }),
    []
  );

  // -----------------------------
  // Formik
  // -----------------------------
  const formik = useFormik({
    initialValues: initialState,
    validationSchema: srRegisterFullFormSchema,
    onSubmit: () => { }, // submit handled manually
  });

  // -----------------------------
  // Generate UUID
  // -----------------------------
  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // -----------------------------
  // Submit Handler
  // -----------------------------
  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();
    const values = formik.values;

    const body = {
      requestId: generateUUID(),
      channelName: "PropertyTax",
      propertyTransactionVO: [
        {
          transactionTypeId: values.transactionType,
          oldPropertyKey: values.PropertyNumber,
          propertyCode: values.PropertyNumber,
          zoneKey: values.zoneKey,
          gatKey: values.gatKey,
          sr1Date: values.srDate,
          description: values.propertyDescription,
          assessmentFinYear: values.fYear,
          specialOwnershipId: values.specialOwnership,
          waterConnNo: values.waterConnNo,
          drainageNo: values.drainageNo,
          finalConstructionType: values.finalConstructionType,
          applicationId: applicationNoFromURL || "",
          finalUseType: values.finalUseType,

          ownerVO: {
            marOwnerName: values.marFirstOwnerName,
            engOwnerName: values.engFirstOwnerName,
            ownerMobile: values.ownerMobile,
            ownerEmail: values.ownerEmail,
            ownerAdharNo: values.ownerAdharNo,
          },

          occupantVO: {
            engOccupantName: values.engFirstOccupantName,
            marOccupantName: values.marFirstOccupantName,
            occupantMobile: values.occupantMobile,
            occupantEmail: values.occupantEmail,
            occupantAdharNo: values.occupantAdharNo,
          },

          addressVO: {
            flatNo: values.flatNo,
            blockNo: values.blockNo,
            floorMarathi: values.floorMarathi,
            floor: values.floor,
            buildingNo: values.buildingNo,
            wingNameMarathi: values.wingNameMarathi,
            wingName: values.wingName,
            societyNameMarathi: values.societyNameMarathi,
            societyName: values.societyName,
            landmarkMarathi: values.landmarkMarathi,
            landmark: values.landmark,
            towerNameMarathi: values.towerNameMarathi,
            towerName: values.towerName,
            villageMarathi: values.villageMarathi,
            village: values.village,
            pinCode: values.pinCode,
            marPropertyAddress: values.marPropertyAddress,
            engPropertyAddress: values.engPropertyAddress,
          },

          documentVOs: values.documents,

          propertyTransactionDetailsVO: values.propertyTransactionDetailsVO.map((row) => ({
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
      const response = await submitPropertyTransaction(body);
      if (response?.applicationId) {
        localStorage.setItem("applicationId", response.applicationId);
        localStorage.setItem("transactionTypeId", values.transactionType);
        navigate("/assessment-document");
      } else {
        showToastError("Error occurred. Please try again.");
      }
    } catch (err) {
      showToastError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Wizard Steps Definition
  // =============================
  const steps = [
    { label: "Property Info", component: (<PropertyInfoForm zoneKey={zoneKey} setZoneKey={setZoneKey} />), },
    { label: "Owner Info", component: <OwnerInfoForm />, },
    { label: "Occupant Info", component: <OccupantInfoForm />, },
    { label: "Property Address", component: <PropertyAddressForm />, },
    { label: "Documents", component: <PropertyDocumentsForm />, },
    { label: "Assessment", component: (<AssessmentTable zoneKey={zoneKey} gatKey={formik.values.gatKey} />), },
  ];

  // =============================
  // Render UI
  // =============================
  return (
    <DashBoardContainer>
      {error && <AlertMsg message={error} severity="error" onClose={() => setError("")} />}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress sx={{ marginTop: "65px" }} />
        </Box>
      ) : (
        <>
          <ScrollBottom />
          <ScrollTop />

          <Box sx={{ p: 2 }}>
            <Grid>
              <FormikProvider value={formik}>
                <Form>
                  <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
                    {/* Header band */}
                    <Box
                      sx={{
                        px: 3,
                        py: 2.5,
                        background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "rgba(255,255,255,0.12)",
                          color: "#5DCAA5",
                        }}
                      >
                        <ReceiptLongOutlined />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                          Property Transactions
                        </Typography>
                        <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                          Complete each step to register the property transaction.
                        </Typography>
                      </Box>
                      <Chip
                        label={`${steps[step].label}`}
                        sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                      />
                    </Box>

                    <WizardWrapper
                      step={step}
                      setStep={setStep}
                      steps={steps}
                      handleSubmitButtonClick={handleSubmitButtonClick}
                    />
                  </Card>
                </Form>
              </FormikProvider>
            </Grid>
          </Box>
        </>
      )}
    </DashBoardContainer>
  );
};

export default SrRegister;