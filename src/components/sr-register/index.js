import React, { useEffect, useState, useMemo } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Button,
  CircularProgress,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { srRegisterFullFormSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { useSelector } from "react-redux";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import { submitPropertyTransaction } from "../../services/assessment-services";

import PropertyInfoForm from "./propertyInfoForm";
import OwnerInfoForm from "./ownerInfoForm";
import OccupantInfoForm from "./occupaneInfoForm";
import PropertyAddressForm from "./porpertyAddressForm";
import PropertyDocumentsForm from "./propertyDocumentsForm";
import AssessmentTable from "./assessmentTable";
import { styled } from "@mui/material/styles";
import { labels } from "../../lang/labels";

// =============================
// Wizard Component
// =============================
const WizardWrapper = ({ step, setStep, steps, handleSubmitButtonClick }) => {
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const lang = useSelector((state) => state.userDetails.lang);

  return (
    <>
      <Tabs
        value={step}
        onChange={(e, v) => setStep(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          "& .MuiTabs-flexContainer": {
            justifyContent: {
              xs: "flex-start",
              md: "center",
            },
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        {steps.map((s, i) => (
          <Tab
            key={i}
            label={s.label}
            sx={{
              textTransform: "none",
              fontWeight: "bold",

              fontSize: {
                xs: "12px",
                sm: "14px",
                md: "16px",
              },

              minHeight: {
                xs: 42,
                md: 48,
              },

              px: {
                xs: 2,
                sm: 3,
              },

              py: 1,

              mx: 1,

              borderRadius: 2,

              border:
                step === i
                  ? "1px solid #0d47a1"
                  : "1px solid #cfd8dc",

              backgroundColor:
                step === i
                  ? "#bbdefb"
                  : "#e3f2fd",

              color: "#000",

              boxShadow:
                step === i
                  ? 3
                  : 1,

              whiteSpace: "nowrap",

              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            }}
          />
        ))}
      </Tabs>

      <Box mt={3}>{steps[step].component}</Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 4,
          px: 2,
          pb: 2,
        }}
      >
        <Button
          variant="outlined"
          disabled={step === 0}
          onClick={prev}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          onClick={
            step === steps.length - 1
              ? handleSubmitButtonClick
              : next
          }
        >
          {step === steps.length - 1 ? "Submit" : "Next"}
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

  const lang = useSelector((state) => state.userDetails.lang);
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
    if (crypto?.randomUUID) return crypto.randomUUID();
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

          propertyTransactionDetailsVO: values.propertyTransactionDetailsVO.map(
            (row) => ({
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
            })
          ),
        },
      ],
    };

    try {
      setLoading(true);
      // console.log("REQUEST BODY:", body);
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
    { label: "PropertyInfo", component: <PropertyInfoForm zoneKey={zoneKey} setZoneKey={setZoneKey} /> },
    { label: "Owner Info", component: <OwnerInfoForm /> },
    { label: "Occupant Info", component: <OccupantInfoForm /> },
    { label: "Property Address", component: <PropertyAddressForm /> },
    { label: "Documents", component: <PropertyDocumentsForm /> },
    { label: "Assessment", component: <AssessmentTable zoneKey={zoneKey} /> },
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

          <Grid>
            <FormikProvider value={formik}>
              <Form>
                <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                  <FormTitle title="Property Transactions" />

                  <WizardWrapper
                    step={step}
                    setStep={setStep}
                    steps={steps}
                    handleSubmitButtonClick={handleSubmitButtonClick}
                  />
                </Paper>
              </Form>
            </FormikProvider>
          </Grid>
        </>
      )}
    </DashBoardContainer>
  );
};

export default SrRegister;