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
import EditLocationAltOutlined from "@mui/icons-material/EditLocationAltOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { addressChangeApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import FormButtons from "../common/buttons";

import {
  getAllProTransactions,
  getGatByZonekey,
  getZoneByProfile,
  getPropertyForUpadate,
  submitPropertyInfoChange,
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

const SectionCard = ({ icon, title, subtitle, children, footer }) => (
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
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
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

const PropertyTraAppforadd = () => {
  const lang = useSelector((state) => state.userDetails?.lang);
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
  const [mobileNo, setMobileNo] = useState("");
  const [occupant, setOccupant] = useState("");
  const [oldMarOwnerAddress, setOldMarOwnerAddress] = useState("");
  const [oldEngOwnerAddress, setOldEngOwnerAddress] = useState("");
  const [oldMarPropertyAddress, setOldMarPropertyAddress] = useState("");
  const [oldMarOccupantAddress, setoldMarOccupantAddress] = useState("");

  // Static initial values; prefill is done with resetForm below so that
  // zoneKey / gatKey are not wiped when API data arrives.
  const initialState = {
    marOwnerAddress: "",
    marOccupantAddress: "",
    marPropertyAddress: "",
    engOwnerAddress: "",
    engOccupantAddress: "",
    engPropertyAddress: "",
    transactionTypeId: "",
    zoneKey: "",
    gatKey: "",
    orderNo: "",
    remark: "",
    documents: [
      {
        documentId: "",
        documentURLbase64: "",
      },
    ],
  };

  const formik = useFormik({
    initialValues: initialState,
    enableReinitialize: false,
    validationSchema: addressChangeApplicationSchema,
    validateOnMount: true,
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

  // Fetch property only when propertyCode, zoneKey AND gatKey are all available
  useEffect(() => {
    const { zoneKey, gatKey } = formik.values;
    if (!propertyCodeFromURL || !zoneKey || !gatKey) return;

    const loadPropertyOwnerDetails = async () => {
      try {
        setLoading(true);
        const response = await getPropertyForUpadate({
          propertyCode: propertyCodeFromURL,
          transactionTypeKey: transactionTypeIdFromURL,
          zoneKey,
          gatKey,
        });
        if (response) {
          setPropertyOwnerDetails(response.oldMarOwnerName || "");
          setMobileNo(response.propertyMobileNo || "");
          setOccupant(response.oldMarOccupantName || "");
          setOldMarOwnerAddress(response.oldMarOwnerAddress || "");
          setOldEngOwnerAddress(response.oldEngOwnerAddress || "");
          setOldMarPropertyAddress(response.oldMarPropertyAddress || "");
          setoldMarOccupantAddress(response.oldMarOccupantAddress || "");
        }
      } catch (error) {
        // clear old details if this zone/gat combination is not valid for the property
        setPropertyOwnerDetails("");
        setMobileNo("");
        setOccupant("");
        setOldMarOwnerAddress("");
        setOldEngOwnerAddress("");
        setOldMarPropertyAddress("");
        setoldMarOccupantAddress("");
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadPropertyOwnerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    propertyCodeFromURL,
    transactionTypeIdFromURL,
    formik.values.zoneKey,
    formik.values.gatKey,
  ]);

  // Prefill the new-address fields with the current addresses.
  // resetForm keeps `dirty` false until the user actually edits something.
  useEffect(() => {
    if (oldMarOwnerAddress || oldMarOccupantAddress || oldMarPropertyAddress) {
      formik.resetForm({
        values: {
          ...formik.values,
          marOwnerAddress: oldMarOwnerAddress || formik.values.marOwnerAddress,
          marOccupantAddress: oldMarOccupantAddress || formik.values.marOccupantAddress,
          marPropertyAddress: oldMarPropertyAddress || formik.values.marPropertyAddress,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldMarOwnerAddress, oldMarOccupantAddress, oldMarPropertyAddress]);

  const handleSubmit = async () => {
    const values = formik.values;
    const body = {
      requestId: generateUUID(),
      channelName: "PropertyTax",
      propertyUpdateVOs: [
        {
          transactionTypeKey: values.transactionTypeId,
          propertyCode: propertyCodeFromURL,
          zoneKey: values.zoneKey,
          gatKey: values.gatKey,
          orderNo: values.orderNo,
          remark: values.remark,
          applicationId: applicationNoFromURL,
          oldEngOwnerName: values.occupantName, // NOTE: not a formik field, so this is undefined
          oldMarOwnerAddress: oldMarOwnerAddress,
          oldEngOwnerAddress: oldEngOwnerAddress,
          // mobileNo: mobileNo,
          oldMarOwnerName: propertyOwnerDetails,
          oldMarOccupantName: occupant,
          newMarOwnerAddress: values.marOwnerAddress,
          newEngOwnerAddress: values.engOwnerAddress,
          newMarOccupantAddress: values.marOccupantAddress,
          newEngOccupantAddress: values.engOccupantAddress,
          newMarPropertyAddress: values.marPropertyAddress,
          newEngPropertyAddress: values.engPropertyAddress,
          oldMarPropertyAddress: oldMarPropertyAddress,
          oldMarOccupantAddress: oldMarOccupantAddress,
          documentVOs: values.documents.map((doc) => ({
            documentId: doc.documentId,
            documentURLbase64: doc.documentURLbase64,
          })),
        },
      ],
    };
    try {
      setLoading(true);
      const response = await submitPropertyInfoChange(body);
      if (response?.responseStatus === "Success") {
        showToastSuccess("Thank you for your application. You will be redirected in 5 seconds...");
        setTimeout(() => {
          navigate("/PropertyTransactionsDashBoard");
        }, 5000);
      } else {
        showToastError("Error occurred. Please try again.");
      }
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const editableField = (name) => (
    <TextField
      variant="standard"
      size="small"
      name={name}
      required
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      sx={{ width: "100%" }}
    />
  );

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
                  {labels?.AddressChangeApplicationType?.[lang] || "Address Change Application"}
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  Review the current property details and submit the new address information.
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
            {/* ---------- Current details (read-only) ---------- */}
            <SectionCard
              icon={<HomeWorkOutlined fontSize="small" />}
              title="Current property details"
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

                <FieldRow label={labels.OwnerAddress[lang]}>
                  <TextField variant="standard" size="small" name="currentOwnerAddress" disabled value={oldMarOwnerAddress} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.occupantName[lang]}>
                  <TextField variant="standard" size="small" name="occupantName" disabled value={occupant} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.OccupantAddress[lang]}>
                  <TextField variant="standard" size="small" name="currentOccupantAddress" disabled value={oldMarOccupantAddress} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.PropertyAddress[lang]}>
                  <TextField variant="standard" size="small" name="currentPropertyAddress" disabled value={oldMarPropertyAddress} sx={{ width: "100%" }} />
                </FieldRow>

                <FieldRow label={labels.RemarkForProperty[lang]}>
                  {editableField("remark")}
                </FieldRow>
              </Grid>
            </SectionCard>

            {/* ---------- New address details ---------- */}
            <SectionCard
              icon={<EditLocationAltOutlined fontSize="small" />}
              title={labels?.NewDetails?.[lang] || "New details"}
              subtitle="Enter the updated owner, occupant and property addresses in both languages"
            >
              <Grid container spacing={3}>
                <FieldRow label={labels.OwnerAddress[lang]}>
                  {editableField("marOwnerAddress")}
                </FieldRow>

                <FieldRow label={labels.newEngownerAddress[lang]}>
                  {editableField("engOwnerAddress")}
                </FieldRow>

                <FieldRow label={labels.OccupantAddress[lang]}>
                  {editableField("marOccupantAddress")}
                </FieldRow>

                <FieldRow label={labels.OccupantAddressEnglish[lang]}>
                  {editableField("engOccupantAddress")}
                </FieldRow>

                <FieldRow label={labels.PropertyAddressMar[lang]}>
                  {editableField("marPropertyAddress")}
                </FieldRow>

                <FieldRow label={labels.PropertyAddressEng[lang]}>
                  {editableField("engPropertyAddress")}
                </FieldRow>
              </Grid>
            </SectionCard>

            {/* ---------- Documents + submit ---------- */}
            <SectionCard             
              footer={
                <FormButtons
                  disabled={!formik.isValid || !formik.dirty}
                  handleSubmitButtonClick={handleSubmit}
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
                  <PropertyDocumentsForm />
                </Grid>
              </Grid>
            </SectionCard>
          </Form>
        </FormikProvider>
      </Box>
    </DashBoardContainer>
  );
};

export default PropertyTraAppforadd;