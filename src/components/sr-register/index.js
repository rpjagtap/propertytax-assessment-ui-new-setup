import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
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
import {
  submitPropertyTransaction,
  viewPendingApplications,
} from "../../services/assessment-services";

import PropertyInfoForm from "./propertyInfoForm";
import OwnerInfoForm from "./ownerInfoForm";
import OccupantInfoForm from "./occupaneInfoForm";
import PropertyAddressForm from "./porpertyAddressForm";
import PropertyDocumentsForm from "./propertyDocumentsForm";
import AssessmentTable from "./assessmentTable";
import { labels } from "../../lang/labels";

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
  const lang = useSelector((state) => state.userDetails?.lang);

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
          {labels.Previous[lang]}
        </Button>

        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          {labels.Step[lang]} {step + 1} of {steps.length}
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
          {isLast ? labels.Submit[lang] : labels.next[lang]}
        </Button>
      </Box>
    </>
  );
};

// =============================
// MAIN COMPONENT
// =============================
const SrRegister = () => {
  const lang = useSelector((state) => state.userDetails?.lang);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationNoFromURL = searchParams.get("applicationNo");
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  const modeFromURL = searchParams.get("mode");

  // True only when we've arrived here via the "Edit Application" link on the view page.
  // The plain "New Application" flow never sets mode=edit, so it is completely unaffected.
  const isEditMode =
    modeFromURL === "edit" && !!applicationNoFromURL && !!transactionTypeIdFromURL;

  const { loading, setLoading, error, setError } = useApiState();

  const [zoneKey, setZoneKey] = useState("");
  const [gatKey, setGatKey] = useState("");
  const [step, setStep] = useState(0);
  // AssessmentTable keeps its own local row state seeded from this prop - formik.values
  // is not read by it directly, so prefilled assessment rows must flow through here.
  const [assessmentInitialRows, setAssessmentInitialRows] = useState([]);
  const [propertyTransactionId, setPropertyTransactionId] = useState("");
  const [propertyTransactionDetailsId, setPropertyTransactionDetailsId] = useState("");
  const [ownerTransactionId, setOwnerTransactionId] = useState("");
  const [occupantTransactionId, setOccupantTransactionId] = useState("");
  const [addressTransactionId, setAddressTransactionId] = useState("");

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
  // Edit mode: fetch the existing application and prefill the form
  // (same logic as the working backup)
  // -----------------------------
  useEffect(() => {
    if (!isEditMode) return;

    const loadApplicationForEdit = async () => {
      try {
        setLoading(true);
        const payload = {
          transactionTypeKey: transactionTypeIdFromURL,
          applicationId: applicationNoFromURL,
        };

        const response = await viewPendingApplications(payload);
        const vo = response?.propertyTransactionVO?.[0];
        if (!vo) {
          showToastError("Could not find application details to edit.");
          return;
        }

        const ownerInfo = vo.ownerVO || {};
        const occupantInfo = vo.occupantVO || {};
        const addressInfo = vo.addressVO || {};
        const fetchedDetails = vo.propertyTransactionDetailsVO || [];
        const fetchedDocs = vo.documentVOs || [];

        const details = vo.propertyTransactionDetailsVO?.[0] || {};
        setPropertyTransactionId(vo.propertyTransactionId ?? "");
        setPropertyTransactionDetailsId(details.propertyTransactionDetailsId ?? "");
        setOwnerTransactionId(vo.ownerVO?.ownerTransactionId ?? "");
        setOccupantTransactionId(vo.occupantVO?.occupantTransactionId ?? "");
        setAddressTransactionId(vo.addressVO?.addressTransactionId ?? "");
        setZoneKey(vo.zoneKey || "");
        setGatKey(vo.gatKey || "");

        formik.setValues({
          ...formik.values,

          transactionType: vo.transactionTypeKey || transactionTypeIdFromURL || "",
          PropertyNumber: vo.propertyCode || propertyCodeFromURL || "",
          zoneKey: vo.zoneKey || "",
          gatKey: vo.gatKey || "",
          srDate: vo.sr1Date || initialState.srDate,
          propertyDescription: vo.description || "",
          fYear: vo.financialYearKey || "",
          specialOwnership: vo.specialOwnershipId || "",
          waterConnNo: vo.waterConnNo || "",
          drainageNo: vo.drainageNo || "",
          finalConstructionType: vo.finalConstructionType || "",
          finalUseType: vo.finalUseType || "",

          // Owner - the view API returns a single combined name, so it lands in the
          // "first name" field. Split it into first/middle/last here if
          // OwnerInfoForm needs them separated.
          marFirstOwnerName: ownerInfo.marOwnerName || "",
          marMiddleOwnerName: "",
          marLastOwnerName: "",
          engFirstOwnerName: ownerInfo.engOwnerName || "",
          engMiddleOwnerName: "",
          engLastOwnerName: "",
          ownerMobile: ownerInfo.ownerMobile || "",
          ownerEmail: ownerInfo.ownerEmail || "",
          ownerAdharNo: ownerInfo.ownerAdharNo || "",

          // Occupant - same single-name caveat as owner above
          engFirstOccupantName: occupantInfo.engOccupantName || "",
          engMiddleOccupantName: "",
          engLastOccupantName: "",
          marFirstOccupantName: occupantInfo.marOccupantName || "",
          marMiddleOccupantName: "",
          marLastOccupantName: "",
          occupantMobile: occupantInfo.occupantMobile || "",
          occupantEmail: occupantInfo.occupantEmail || "",
          occupantAdharNo: occupantInfo.occupantAdharNo || "",

          // Address - field names match 1:1 between the view API and this form
          flatNo: addressInfo.flatNo || "",
          blockNo: addressInfo.blockNo || "",
          floorMarathi: addressInfo.floorMarathi || "",
          floor: addressInfo.floor || "",
          buildingNo: addressInfo.buildingNo || "",
          wingNameMarathi: addressInfo.wingNameMarathi || "",
          wingName: addressInfo.wingName || "",
          societyNameMarathi: addressInfo.societyNameMarathi || "",
          societyName: addressInfo.societyName || "",
          landmarkMarathi: addressInfo.landmarkMarathi || "",
          landmark: addressInfo.landmark || "",
          towerNameMarathi: addressInfo.towerNameMarathi || "",
          towerName: addressInfo.towerName || "",
          villageMarathi: addressInfo.villageMarathi || "",
          village: addressInfo.village || "",
          pinCode: addressInfo.pinCode || "",
          marPropertyAddress: addressInfo.marPropertyAddress || "",
          engPropertyAddress: addressInfo.engPropertyAddress || "",

          // Documents - re-shaped to what PropertyDocumentsForm / submit expect.
          // isReuploaded stays false until the user picks a new file for the row
          // (PropertyDocumentsForm sets it to true in that case).
          documents: fetchedDocs.length
            ? fetchedDocs.map((doc) => ({
              documentId: doc.documentId || "",
              documentName: doc.documentName || "",
              documentURLbase64: doc.documentURLbase64 || "",
              transactionDocumentId: doc.transactionDocumentId || "",
              reuploaded: false,
            }))
            : initialState.documents,

          // Assessment rows - also set on formik for consistency; AssessmentTable
          // overwrites it from its own state once it mounts.
          propertyTransactionDetailsVO: fetchedDetails.map((row) => ({
            propertyTransactionDetailsId: row.propertyTransactionDetailsId,
            useType: row.useType,
            subUseType: row.subUseType,
            constructionType: row.constructionType,
            occupancy: row.occuapncy,
            specialResidents: row.specialOccupant,
            assessmentDate: row.assessmentDate,
            areaType: row.areaType || "",
            areaInSqmt: row.area,
            rVValue: row.rateableValue,
            isToilet: !!row.toilet,
            isIllegal: !!row.permision,
            floor: row.florage || "",
          })),
        });

        // AssessmentTable seeds its own state from this "initialRows" prop. Its
        // mapApiToRow() expects *Name-suffixed label fields, "Y"/"N" for toilet,
        // and propertyDetailsKey instead of propertyTransactionDetailsId.
        setAssessmentInitialRows(
          fetchedDetails.map((row) => ({
            useTypeName: row.useType,
            subuseTypeName: row.subUseType,
            constructionTypeName: row.constructionType,
            occupancyName: row.occuapncy,
            specialOccupantName: row.specialOccupant,
            assessmentDate: row.assessmentDate,
            area: row.area,
            areaType: row.areaType,
            propertyDetailsKey: row.propertyTransactionDetailsId,
            ratableValue: row.rateableValue,
            toilet: row.toilet ? "Y" : "N",
            permission: row.permision ? "N" : "Y", // legalStatusOptions: "Y"=Legal, "N"=Illegal
            floor: row.floor,
            billRate: row.rate,
          })),
        );
      } catch (err) {
        showToastError(getErrorMsg(err));
      } finally {
        setLoading(false);
      }
    };

    loadApplicationForEdit();
    // Only re-run if the identifying query params change; formik/initialState are
    // stable references we intentionally don't want to re-trigger this fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, applicationNoFromURL, transactionTypeIdFromURL]);

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
          propertyTransactionId: propertyTransactionId,
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
            ownerTransactionId: ownerTransactionId,
          },

          occupantVO: {
            engOccupantName: values.engFirstOccupantName,
            marOccupantName: values.marFirstOccupantName,
            occupantMobile: values.occupantMobile,
            occupantEmail: values.occupantEmail,
            occupantAdharNo: values.occupantAdharNo,
            occupantTransactionId: occupantTransactionId,
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
            addressTransactionId: addressTransactionId,
          },

          documentVOs: values.documents,

          propertyTransactionDetailsVO: values.propertyTransactionDetailsVO.map((row) => ({
            useTypeKey: row.useType,
            subUseTypeKey: row.subUseType,
            constructionTypeKey: row.constructionType,
            occuapncyKey: row.occupancy,
            specialOccupantKey: row.specialResidents,
            assessmentDate: row.assessmentDate || getCurrentDate(),
            areaType: row.areaType,
            area: row.areaInSqmt,
            rate: row.billRate,
            rateableValue: row.rVValue,
            toiletFlag: row.isToilet ? "Y" : "N",
            permission: row.isIllegal,
            floor: row.floor,
            propertyTransactionDetailsId: propertyTransactionDetailsId,
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

        if (response?.responseMsg === "SR3") {
          navigate("/sr3-document");     // SR3 flow
        } else {
          navigate("/assessment-document"); // existing flow, unchanged
        }
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
  // (props match the working backup: gatKey/setGatKey for PropertyInfoForm,
  //  gatKey + initialRows for AssessmentTable)
  // =============================
  const steps = [
    {
      label: labels.PropertyDetails[lang],
      component: (
        <PropertyInfoForm
          zoneKey={zoneKey}
          setZoneKey={setZoneKey}
          gatKey={gatKey}
          setGatKey={setGatKey}
        />
      ),
    },
    { label: labels.ownerInfo[lang], component: <OwnerInfoForm /> },
    { label: labels.OccupantInfo[lang], component: <OccupantInfoForm /> },
    { label: labels.PropertyAddress[lang], component: <PropertyAddressForm /> },
    { label: labels.docs[lang], component: <PropertyDocumentsForm /> },
    {
      label: labels.PropertyAssessment[lang],
      component: (
        <AssessmentTable
          zoneKey={zoneKey}
          gatKey={gatKey}
          initialRows={assessmentInitialRows}
        />
      ),
    },
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
                          {labels.PropertyTransactions[lang]}
                        </Typography>
                      </Box>

                      {/* Shown only when opened from "Edit Application" */}
                      {isEditMode && (
                        <Chip
                          label="Edit Application"
                          sx={{ bgcolor: "#fff", color: NAVY, fontWeight: 600 }}
                        />
                      )}

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