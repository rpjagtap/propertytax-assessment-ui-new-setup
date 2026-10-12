import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
  TableContainer,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBack from "@mui/icons-material/ArrowBack";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import EventOutlined from "@mui/icons-material/EventOutlined";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import useApiState from "../common/useApiState";
import {
  viewPendingApplications,
  revertApplication,
  ViewProTransactionDoc,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { namChangeApplicationZoSchema } from "../../utils/validation-schema";
import AlertMsg from "../common/alert";

// Theme tokens
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";
const BORDER = "#D5DCE6";

// Remark dropdown options - adjust "value" to match whatever your backend expects
const REMARK_TYPE_OPTIONS = [
  { value: "21_days_completed", label: "21 Day's Completed" },
  { value: "citizen_acceptance", label: "Citizen Acceptance" },
  { value: "citizen_objection", label: "Citizen Objection" },
];

// Route that hosts the SrRegister wizard, used both for "New Application" and now for "Edit".
// Update this if SrRegister is actually mounted at a different path.
const SR_REGISTER_ROUTE = "/PropertyTransactions";

// Read-only "label: value" row
const InfoRow = ({ label, value }) => (
  <Grid item xs={12} md={6}>
    <Box display="flex" alignItems="flex-start">
      <Box minWidth={160} pr={1}>
        <Typography fontWeight={600} fontSize={14} color={NAVY}>
          {label}:
        </Typography>
      </Box>
      <Typography fontSize={14} sx={{ wordBreak: "break-word", flex: 1 }}>
        {value || "-"}
      </Typography>
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
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            gap: 2,
            bgcolor: "#FAFBFD",
          }}
        >
          {footer}
        </Box>
      </>
    )}
  </Card>
);

const headCellSx = {
  fontWeight: 600,
  color: NAVY,
  borderRight: `1px solid ${BORDER}`,
};

const PropertyTransactionApplicationViewGP = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading, error, setError } = useApiState();
  const [responseData, setResponseData] = useState({});
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  const applicationNoFromURL = searchParams.get("applicationNo");
  const navigate = useNavigate();

  const initialState = {
    propertyCode: "",
    transactionTypeId: "",
    newMarOwnerName: "",
    newEngOwnerName: "",
    newMarOccupantName: "",
    newEngOccupantName: "",
    orderNo: "",
    userid: "",
    applicationId: "",
    remark: "",
    remarkType: "",
    remarks: "",
    action: "",
    hearingDate: "",
    hearingTime: "",
    hearingRemarks: "",
  };

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: namChangeApplicationZoSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  // Fetch property details
  useEffect(() => {
    if (!applicationNoFromURL || !transactionTypeIdFromURL) return;

    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const payload = {
          transactionTypeKey: transactionTypeIdFromURL,
          applicationId: applicationNoFromURL,
        };

        const response = await viewPendingApplications(payload);

        if (response) {
          setResponseData(response);
        }
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [applicationNoFromURL, transactionTypeIdFromURL, setLoading]);

  // Safe access to response data
  const vo = responseData?.propertyTransactionVO?.[0] || {};
  const oldUseTypeDtls =
    responseData?.propertyTransactionVO?.[0]?.propertyTransactionDetailsVO ||
    [];
  const documents = vo.documentVOs || [];
  const currentUserProfileId = useSelector(
    (state) => state.userDetails.userInfo.userId,
  );
  const ownerInfo = responseData?.propertyTransactionVO?.[0]?.ownerVO || {};
  const occupantInfo =
    responseData?.propertyTransactionVO?.[0]?.occupantVO || {};
  const propertyAddressInfo =
    responseData?.propertyTransactionVO?.[0]?.addressVO || {};

  // Navigate to the SrRegister wizard in edit mode, carrying the identifiers it needs
  // to re-fetch and prefill this same application.
  const handleEditClick = () => {
    const queryParams = new URLSearchParams({
      applicationNo: applicationNoFromURL || vo.applicationId || "",
      transactionTypeId:
        transactionTypeIdFromURL || vo.transactionTypeKey || "",
      propertyCode: propertyCodeFromURL || vo.propertyCode || "",
      mode: "edit",
    }).toString();
    navigate(`${SR_REGISTER_ROUTE}?${queryParams}`);
  };

  // Submit handler
  const handleSubmit = async (actionType) => {
    const values = formik.values;
    const selectedRemarkTypeLabel =
      REMARK_TYPE_OPTIONS.find((opt) => opt.value === values.remarkType)
        ?.label || values.remarkType;
    const combinedRemark = `${selectedRemarkTypeLabel} - ${values.remarks}`;
    const body = {
      //requestId: generateUUID(),
      propertyTransactionVO: [
        {
          // PropertyInfoForm
          propertyTransactionId: vo.propertyTransactionId || "",
          transactionType: values.oldPropertyKey,
          propertyCode: vo.propertyCode,
          propertyName: vo.propertyName || "",
          propertyOccupantName: vo.propertyOccupantName || "",
          propertyAddress: vo.propertyAddress || "",
          propertyMobileNo: vo.propertyMobileNo,
          zoneKey: vo.zoneKey,
          gatKey: vo.gatKey,
          zoneName: vo.zoneName || "",
          gatName: vo.gatName || "",
          totalArea: vo.totalArea || 0,
          totalRateableValue: vo.totalRateableValue || 0,
          sr1Date: vo.sr1Date,
          applicationId: vo.applicationId,
          applicationDate: vo.applicationDate,
          transactionTypeKey: vo.transactionTypeKey,
          //hearingDate: values.hearingDate,

          documentVOs: vo.documentVOs.map((doc) => ({
            documentURLbase64: doc.documentURLbase64,
            documentName: doc.documentName,
          })),
          // AssessmentTable
          propertyTransactionDetailsVO: vo.propertyTransactionDetailsVO.map(
            (row) => ({
              useType: row.useType,
              subUseType: row.subUseType,
              constructionType: row.constructionType,
              occuapncy: row.occuapncy,
              specialOccupant: row.specialOccupant,
              assessmentDate: row.assessmentDate,
              area: row.area,
              rateableValue: row.rateableValue,
              toilet: row.toilet,
              permision: row.permision,
              florage: row.florage,
              transactionType: row.transactionType,
              propertyTransactionDetailsId: row.propertyTransactionDetailsId,
            }),
          ),
          revertFormVO: {
            remark: combinedRemark,
            revertAction: actionType,
          },
        },
      ],
    };

    const sessionData = sessionStorage.getItem("sessionData");
    const userDetails = JSON.parse(sessionData);
    const profileId = userDetails?.profileId;
    try {
      //console.log("Submitting with body:", body);
      setLoading(true);
      const response = await revertApplication(body);
      if (response?.applicationId !== "") {
        showToastSuccess("Record saved successfully. Redirecting in 5 Sec");
        if (profileId === "8") {          // 8 is ZO
          setTimeout(() => navigate("/PropertyTransactionsDashBoardZO"), 5000);
        } else if (profileId === 11 && actionType === "accept") { // 11 is GP
          setTimeout(() => navigate("/PropertyAssessmentDashboardGP"), 5000); // Send to sr2
        } else if (profileId === 11 && actionType === "reject") {
          setTimeout(() => navigate("/PropertyAssessmentDashboardGP"), 5000);
        } else if (profileId === 14 && actionType === "reject") { // 14 is PA
          setTimeout(() => navigate("/2"), 5000); // Send to Hearing -> S3
        } else if (profileId === 14 && actionType === "accept") {
          setTimeout(() => navigate("/1"), 5000); // Send to sr2
        }
      } else {
        showToastError("Error occurred. Please try again.");
      }
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentName, documentURLbase64) => {
    try {
      const response = await ViewProTransactionDoc(
        documentName,
        documentURLbase64,
      );

      // Create blob using the response type from headers
      const contentType = response.type || "application/pdf"; // default PDF
      const blob = new Blob([response], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        alert("Please allow popups to view the file.");
      }

      // Optional: revoke the object URL after a while
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Determine whether Accept/Reject should be enabled
  const isActionDisabled =
    !formik.values.remarkType?.trim() ||
    !formik.values.remarks?.trim() ||
    (formik.values.remarkType === "citizen_objection" &&
      !formik.values.hearingDate);

  // Loading guard
  if (!responseData?.propertyTransactionVO?.length)
    return <div>Loading...</div>;

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

      <Box sx={{ p: 2 }}>
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
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#5DCAA5",
              }}
            >
              <HomeWorkOutlined />
            </Avatar>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                {labels.NewPropertyRegistration[lang]}
              </Typography>
              <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                Review the property, owner, occupant, address, documents and
                assessment, then submit or reject this application.
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
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Back
          </Button>
        </Box>

        {/* Edit action (kept disabled, as in the original)
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Application
          </Button>
        </Box> */}

        {/* ---------- Property details ---------- */}
        <SectionCard
          icon={<HomeWorkOutlined fontSize="small" />}
          title={labels.NewPropertyRegistration[lang]}
          subtitle="Property and application information on record"
        >
          <Grid container spacing={3}>
            <InfoRow
              label={labels.TransactionType[lang]}
              value={vo.transactionType}
            />
            <InfoRow label={labels.PropertyNumber[lang]} value="-" />
            <InfoRow label={labels.Zone[lang]} value={vo.zoneName} />
            <InfoRow label={labels.Gat[lang]} value={vo.gatName} />
            <InfoRow label={labels.SRDate[lang]} value={vo.sr1Date} />
            <InfoRow
              label={labels.PropertyDescription[lang]}
              value={vo.description}
            />
            <InfoRow label={labels.FYear[lang]} value={vo.assessmentFinYear} />
            <InfoRow
              label={labels.SpecialOwnership[lang]}
              value={vo.specialOwnership}
            />
            <InfoRow
              label={labels.WaterConnectionNumber[lang]}
              value={vo.waterConnNo}
            />
            <InfoRow
              label={labels.DrainageNumber[lang]}
              value={vo.drainageNo}
            />
          </Grid>
        </SectionCard>

        {/* ---------- Owner details ---------- */}
        <SectionCard
          icon={<PersonOutline fontSize="small" />}
          title={labels.ownerDetails[lang]}
          subtitle="Owner name, contact and identity details"
        >
          <Grid container spacing={3}>
            <InfoRow
              label={labels.NameMarathi[lang]}
              value={ownerInfo.marOwnerName}
            />
            <InfoRow
              label={labels.NameEnglish[lang]}
              value={ownerInfo.engOwnerName}
            />
            <InfoRow
              label={labels.MobileNo[lang]}
              value={ownerInfo.ownerMobile}
            />
            <InfoRow
              label={labels.emailId[lang]}
              value={ownerInfo.ownerEmail}
            />
            <InfoRow
              label={labels.AadhaarNo[lang]}
              value={ownerInfo.ownerAdharNo}
            />
          </Grid>
        </SectionCard>

        {/* ---------- Occupant details ---------- */}
        <SectionCard
          icon={<BadgeOutlined fontSize="small" />}
          title={labels.OccupantDetails[lang]}
          subtitle="Occupant name, contact and identity details"
        >
          <Grid container spacing={3}>
            <InfoRow
              label={labels.NameMarathi[lang]}
              value={occupantInfo.marOccupantName}
            />
            <InfoRow
              label={labels.NameEnglish[lang]}
              value={occupantInfo.engOccupantName}
            />
            <InfoRow
              label={labels.OccupantMobileNo[lang]}
              value={occupantInfo.occupantMobile}
            />
            <InfoRow
              label={labels.OccupantEmailId[lang]}
              value={occupantInfo.occupantEmail}
            />
            <InfoRow
              label={labels.OccupantAadhaarNo[lang]}
              value={occupantInfo.occupantAdharNo}
            />
          </Grid>
        </SectionCard>

        {/* ---------- Property address ---------- */}
        <SectionCard
          icon={<LocationOnOutlined fontSize="small" />}
          title={labels.PropertyAddressDetails[lang]}
          subtitle="Address of the property in Marathi and English"
        >
          <Grid container spacing={3}>
            <InfoRow
              label={labels.FlatNo[lang]}
              value={propertyAddressInfo.flatNo}
            />
            <InfoRow
              label={labels.blockNoGatNoSecNo[lang]}
              value={propertyAddressInfo.blockNo}
            />
            <InfoRow
              label={labels.Floor[lang]}
              value={propertyAddressInfo.floorMarathi}
            />
            <InfoRow
              label={labels.FloorEnglish[lang]}
              value={propertyAddressInfo.floor}
            />
            <InfoRow
              label={labels.buildingNo[lang]}
              value={propertyAddressInfo.buildingNo}
            />
            <Grid item xs={12} md={6} />
            <InfoRow
              label={labels.WingTower[lang]}
              value={propertyAddressInfo.wingNameMarathi}
            />
            <InfoRow
              label={labels.WingTowerEnglish[lang]}
              value={propertyAddressInfo.wingName}
            />
            <InfoRow
              label={labels.SocityName[lang]}
              value={propertyAddressInfo.societyNameMarathi}
            />
            <InfoRow
              label={labels.SocityNameEnglish[lang]}
              value={propertyAddressInfo.societyName}
            />
            <InfoRow
              label={labels.Landmark[lang]}
              value={propertyAddressInfo.landmarkMarathi}
            />
            <InfoRow
              label={labels.LandmarkEnglish[lang]}
              value={propertyAddressInfo.landmark}
            />
            {/* Tower name rows (disabled, as in the original)
            <InfoRow label={labels.TowerName[lang]} value={propertyAddressInfo.towerNameMarathi} />
            <InfoRow label={labels.TowerNameEnglish[lang]} value={propertyAddressInfo.towerName} />
            */}
            <InfoRow
              label={labels.Village[lang]}
              value={propertyAddressInfo.villageMarathi}
            />
            <InfoRow
              label={labels.VillageEnglish[lang]}
              value={propertyAddressInfo.village}
            />
            <InfoRow
              label={labels.PinCode[lang]}
              value={propertyAddressInfo.pinCode}
            />
            <Grid item xs={12} md={6} />
            <InfoRow
              label={labels.propertyAddress[lang]}
              value={propertyAddressInfo.marPropertyAddress}
            />
            <InfoRow
              label={labels.propertyAddressEnglish[lang]}
              value={propertyAddressInfo.engPropertyAddress}
            />
          </Grid>
        </SectionCard>

        {/* ---------- Documents ---------- */}
        <SectionCard
          icon={<DescriptionOutlined fontSize="small" />}
          title={labels.DocumentDetails[lang]}
          subtitle="Documents submitted with this application"
        >
          <Table
            sx={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 1 }}
            size="small"
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#EEF2F7" }}>
                <TableCell sx={{ ...headCellSx, width: "10%" }}>Sr.</TableCell>
                <TableCell sx={{ ...headCellSx, width: "60%" }}>
                  {labels.docs[lang]}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, width: "30%", color: NAVY }}
                  align="center"
                >
                  View
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{doc.documentName}</TableCell>
                  <TableCell align="center">
                    <VisibilityIcon
                      fontSize="small"
                      onClick={() =>
                        handleDownload(doc.documentName, doc.documentURLbase64)
                      }
                      style={{ color: MINT, cursor: "pointer" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        {/* ---------- Property assessment ---------- */}
        <SectionCard
          icon={<ApartmentOutlined fontSize="small" />}
          title={labels?.PropertyAssessment?.[lang] || "Property Assessment"}
          subtitle="Use type, construction and rateable value details"
        >
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                minWidth: 900,
                border: `1px solid ${BORDER}`,
                "& th, & td": {
                  textAlign: "center",
                  verticalAlign: "middle",
                },
                "& th": {
                  fontWeight: 600,
                  color: NAVY,
                  borderRight: `1px solid ${BORDER}`,
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "#EEF2F7" }}>
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
                  <TableRow key={row.propertyTransactionDetailsId}>
                    <TableCell>{row.useType}</TableCell>
                    <TableCell>{row.subUseType}</TableCell>
                    <TableCell>{row.constructionType}</TableCell>
                    <TableCell>{row.occuapncy}</TableCell>
                    <TableCell>{row.specialOccupant}</TableCell>
                    <TableCell>{row.assessmentDate}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>{row.rateableValue}</TableCell>
                    <TableCell>{row.toilet ? "Yes" : "No"}</TableCell>
                    <TableCell>{row.permision ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>

        {/* ---------- Remark + actions ---------- */}
        <SectionCard
          icon={<ChatBubbleOutline fontSize="small" />}
          title={labels.Remark[lang]}
          subtitle="A remark type and remark are required to submit or reject"
          footer={
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSubmit("accept")}
                disabled={isActionDisabled}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleSubmit("reject")}
                disabled={isActionDisabled}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/PropertyAssessmentDashboardGP")} // Cancel action
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Cancel
              </Button>
            </>
          }
        >
          <Grid container spacing={2}>
            {/* Remark type dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="remarkType-label">
                  {labels.Remark[lang]}
                </InputLabel>
                <Select
                  labelId="remarkType-label"
                  name="remarkType"
                  label={labels.Remark[lang]}
                  value={formik.values.remarkType}
                  onChange={(e) => {
                    formik.setFieldValue("remarkType", e.target.value);
                  }}
                >
                  {REMARK_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Remark text */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Remarks"
                variant="outlined"
                sx={{ "& textarea": { resize: "vertical" } }}
              />
            </Grid>

            {/* Citizen Objection - Hearing Details */}
            {formik.values.remarkType === "citizen_objection" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: MINT_BG,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EventOutlined sx={{ color: MINT }} fontSize="small" />
                    <Typography fontWeight={700} fontSize={15} color={NAVY}>
                      Hearing Details
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Hearing Date */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        type="date"
                        label="Hearing Date"
                        name="hearingDate"
                        value={formik.values.hearingDate}
                        onChange={formik.handleChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{ bgcolor: "#fff", borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </SectionCard>
      </Box>
    </DashBoardContainer>
  );
};
export default PropertyTransactionApplicationViewGP;