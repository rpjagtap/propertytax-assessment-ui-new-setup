import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Button,
  CircularProgress,
  Grid,
  Paper,
  TableContainer,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { srRegisterFullFormSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { useSelector } from "react-redux";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import FormButtons from "../common/buttons";
import AssessmentTable from "./assessmentTable";
import PropertyInfoForm from "./propertyInfoForm";
import OwnerInfoForm from "./ownerInfoForm";
import PropertyAddressForm from "./porpertyAddressForm";
import OccupantInfoForm from "./occupaneInfoForm";
import PropertyDocumentsForm from "./propertyDocumentsForm";
import { submitPropertyTransaction } from "../../services/assessment-services";

const SrRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const applicationNoFromURL = searchParams.get("applicationNo");
  const [rows, setRows] = useState([]);


  const initialState = {
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
    //owner info form
    marFirstOwnerName: "",
    marMiddleOwnerName: "",
    marLastOwnerName: "",
    engFirstOwnerName: "",
    engMiddleOwnerName: "",
    engLastOwnerName: "",
    ownerMobile: "",
    ownerEmail: "",
    ownerAdharNo: "",
    // occupant info form
    engFirstOccupantName: "",
    engMiddleOccupantName: "",
    engLastOccupantName: "",
    marFirstOccupantName: "",
    marMiddleOccupantName: "",
    marLastOccupantName: "",
    occupantMobile: "",
    occupantEmail: "",
    occupantAdharNo: "",
    // property address form    
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
  };

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

  const handleSubmitButtonClick = async (e) => {
    e.preventDefault();
    const values = formik.values;
    const body = {

      requestId: generateUUID(),
      channelName: "PropertyTax",
      propertyTransactionVO: [
        {
          // PropertyInfoForm
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
          //OwnerInfoForm
          ownerVO: {
            marFirstOwnerName: values.marFirstOwnerName,
            marMiddleOwnerName: values.marMiddleOwnerName,
            marLastOwnerName: values.marLastOwnerName,
            engFirstOwnerName: values.engFirstOwnerName,
            engMiddleOwnerName: values.engMiddleOwnerName,
            engLastOwnerName: values.engLastOwnerName,
            ownerMobile: values.ownerMobile,
            ownerEmail: values.ownerEmail,
            ownerAdharNo: values.ownerAdharNo,
          },
          //OccupantInfoForm
          occupantVO: {
            engFirstOccupantName: values.engFirstOccupantName,
            engMiddleOccupantName: values.engMiddleOccupantName,
            engLastOccupantName: values.engLastOccupantName,
            marFirstOccupantName: values.marFirstOccupantName,
            marMiddleOccupantName: values.marMiddleOccupantName,
            marLastOccupantName: values.marLastOccupantName,
            occupantMobile: values.occupantMobile,
            occupantEmail: values.occupantEmail,
            occupantAdharNo: values.occupantAdharNo,
          },
          //PropertyAddressForm
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
            engPropertyAddress: values.engPropertyAddress
          },
          //PropertyDocumentsForm
          documentVOs: values.documents.map(doc => ({
            documentId: doc.documentId,
            documentURLbase64: doc.documentURLbase64,
          })),
          // AssessmentTable
          propertyTransactionDetailsVO: values.propertyTransactionDetailsVO.map(row => ({
            useTypeId: row.useType,
            subUseTypeId: row.subUseType,
            constructionTypeId: row.constructionType,
            occuapncyId: row.occupancy,
            specialOccupantId: row.specialResidents,
            assessmentDate: row.assessmentDate || getCurrentDate(),
            area: row.areaInSqmt,
            rateableValue: row.rVValue,
            toiletFlag: row.isToilet ? "Y" : "N",
            permission: row.isIllegal ? "Y" : "N",
          }))
        }
      ]
    }

    try {
      setLoading(true);
      const response = await submitPropertyTransaction(body);
      if (response?.applicationId) {
        localStorage.setItem("applicationId", response.applicationId);
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

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();

  // Data lists
  const [zoneKey, setZoneKey] = useState("");

  // Formik
  const initialValues = useMemo(() => initialState, []);
  const formik = useFormik({
    initialValues,
    validationSchema: srRegisterFullFormSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });


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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ marginTop: "65px" }} />
        </div>
      ) : (
        <>
          <ScrollBottom />
          <ScrollTop />

          <Grid>
            <FormikProvider value={formik}>
              <Form>
                <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                  <FormTitle title="Property Transactions" />
                  {/* Property Info */}
                  <PropertyInfoForm zoneKey={zoneKey} setZoneKey={setZoneKey} />
                  <hr />

                  {/* Owner Info */}
                  <OwnerInfoForm />
                  <hr />

                  {/* Occupant Info */}
                  <OccupantInfoForm />
                  <hr />

                  {/* Property Address */}
                  <PropertyAddressForm />
                  <hr />

                  {/* Property Documents */}
                  <PropertyDocumentsForm />
                  <hr />

                  {/* Assessment table */}
                  <AssessmentTable zoneKey={zoneKey} />
                  <hr />

                  <Grid container justifyContent="center" alignItems="center">
                    <Grid item md={3} container justifyContent={{ md: "flex-end" }} alignItems="center" p={2}>
                      <FormButtons
                        isValid={!(formik.isValid && formik.dirty)}
                        handleSubmitButtonClick={handleSubmitButtonClick}
                        resetForm={() => {
                          window.location.reload();
                        }}
                        submitBtnLabel="Generate SR1"
                        isSubmitIcon={false}
                      />
                    </Grid>
                  </Grid>
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