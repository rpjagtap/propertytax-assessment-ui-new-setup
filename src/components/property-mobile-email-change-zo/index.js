import React, { useEffect, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ContactPhoneOutlined from "@mui/icons-material/ContactPhoneOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { useSelector } from "react-redux";
import { labels } from "../../lang/labels";
import useApiState from "../common/useApiState";
import {
  getPropertyUpadateDetails,
  savePropertyUpdateDetails,
  ViewProTransactionDoc,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { namChangeApplicationZoSchema } from "../../utils/validation-schema";
import AlertMsg from "../common/alert";

// Theme tokens — same values used across the other redesigned pages.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const headCellSx = {
  bgcolor: NAVY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

// Section wrapper — icon-badged header + divider + padded body (+ optional footer).
const SectionCard = ({ icon, title, subtitle, children, footer }) => (
  <Card elevation={3} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: MINT_BG, color: MINT, width: 36, height: 36 }}>{icon}</Avatar>
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
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap", bgcolor: "#FAFBFD" }}>
          {footer}
        </Box>
      </>
    )}
  </Card>
);

// One read-only "label → value" pair. `highlight` marks the new/requested value.
const KeyValue = ({ label, value, highlight = false }) => (
  <Grid item xs={12} md={6}>
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
      {label}
    </Typography>
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        minHeight: 38,
        display: "flex",
        alignItems: "center",
        bgcolor: highlight ? MINT_BG : "#F6F8FB",
        border: "1px solid",
        borderColor: highlight ? "#BFE5D7" : "#EEF1F6",
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: highlight ? MINT : NAVY, wordBreak: "break-word" }}>
        {value || "-"}
      </Typography>
    </Box>
  </Grid>
);

const PropertyMobileEmailChangeZo = () => {
  const lang = useSelector((state) => state.userDetails?.lang);
  const { setLoading, error, setError } = useApiState();
  const [responseData, setResponseData] = useState({});
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  const applicationNoFromURL = searchParams.get("applicationNo");
  const navigate = useNavigate();

  // Page-level fetch state, so the page can show a spinner while loading
  // and a proper empty state if nothing comes back (instead of a bare
  // "Loading..." that never goes away).
  const [isFetching, setIsFetching] = useState(Boolean(propertyCodeFromURL));

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
    remarks: "", // the remark textarea below is bound to `remarks`
    action: "",
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
    if (!propertyCodeFromURL) return;

    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await getPropertyUpadateDetails({
          transactionTypeKey: transactionTypeIdFromURL,
          applicationId: applicationNoFromURL,
        });
        if (response) {
          setResponseData(response);
        }
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };
    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCodeFromURL]);

  // Safe access to response data
  const vo = responseData?.propertyUpdateVO?.[0] || {};
  const documents = vo.documentVOs || [];
  const currentUserProfileId = useSelector((state) => state.userDetails?.userInfo?.userId);
  const hasData = Boolean(responseData?.propertyUpdateVO?.length);

  // Submit handler
  const handleSubmit = async (actionType) => {
    const values = formik.values;
    const body = {
      propertyCode: propertyCodeFromURL,
      transactionTypeKey: transactionTypeIdFromURL,
      orderNo: vo.orderNo,
      userid: currentUserProfileId,
      applicationId: applicationNoFromURL,
      remark: values.remarks,
      action: actionType,
      newOwnerMobileNo: vo.newOwnerMobileNo,
      newOwnerEmail: vo.newOwnerEmail,
      newOccupantMobileNo: vo.newOccupantMobileNo,
      newOccupantEmail: vo.newOccupantEmail,
    };

    try {
      setLoading(true);
      const response = await savePropertyUpdateDetails(body);
      if (response?.applicationId !== "") {
        showToastSuccess("Record saved successfully. Redirecting in 5 Sec");
        setTimeout(() => navigate("/PropertyTransactionsDashBoardZO"), 5000);
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
      const response = await ViewProTransactionDoc(documentName, documentURLbase64);

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

  const remarkFilled = Boolean(formik.values.remarks?.trim());

  return (
    <DashBoardContainer>
      {error && <AlertMsg message={error} severity="error" onClose={() => setError("")} />}
      <ScrollBottom />
      <ScrollTop />

      <Box sx={{ p: 2 }}>
        {isFetching ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress sx={{ marginTop: "65px" }} />
          </Box>
        ) : !hasData ? (
          <Card elevation={3} sx={{ borderRadius: 3, py: 6 }}>
            <Stack alignItems="center" spacing={1.5} sx={{ px: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "#EEF1F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InboxOutlined sx={{ fontSize: 28, color: "#94A3B8" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: NAVY }}>
                {labels?.NoRecordFound?.[lang] || "No Records Found"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
                The application details could not be loaded.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/PropertyTransactionsDashBoardZO")}
                sx={{ textTransform: "none", borderRadius: 2, borderColor: NAVY, color: NAVY }}
              >
                Back to dashboard
              </Button>
            </Stack>
          </Card>
        ) : (
          <>
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
                gap: 2,
              }}
            >
              <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,0.12)", color: "#5DCAA5" }}>
                <ContactPhoneOutlined />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                  {labels?.PropertyEmailMobileCorrection?.[lang] || "Mobile / Email Correction"}
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  Review the requested contact detail changes, then accept or reject the application.
                </Typography>
              </Box>
              {vo.applicationId && (
                <Chip label={vo.applicationId} sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }} />
              )}
            </Box>

            {/* ---------- Application details ---------- */}
            <SectionCard
              icon={<InfoOutlined fontSize="small" />}
              title="Application details"
              subtitle="Property and application information"
            >
              <Grid container spacing={2.5}>
                <KeyValue label={labels.Type[lang]} value={vo.transactionType} />
                <KeyValue label={labels.PropertyNumber[lang]} value={vo.propertyCode} />
                <KeyValue label={labels.Zone[lang]} value={vo.zoneName} />
                <KeyValue label={labels.Gat[lang]} value={vo.gatName} />
                <KeyValue label={labels.ApplicationDate[lang]} value={vo.applicationDate} />
                <KeyValue label={labels.ApplicationNo[lang]} value={vo.applicationId} />
                {/* The original showed vo.applicationId here as well (a duplicate of
                    Application No). The submit handler sends vo.orderNo, so that's
                    what this field is meant to display. */}
                <KeyValue label={labels.OrderNumber[lang]} value={vo.orderNo} />
                <KeyValue label={labels.RemarkForProperty[lang]} value={vo.remark} />
              </Grid>
            </SectionCard>

            {/* ---------- Owner contact change ---------- */}
            <SectionCard
              icon={<PersonOutline fontSize="small" />}
              title={labels.ownerDetails[lang]}
              subtitle="Current contact details and the requested changes (highlighted)"
            >
              <Grid container spacing={2.5}>
                <KeyValue label={labels.newOwnerOldMobilNo[lang]} value={vo.oldOwnerMobileNo} />
                <KeyValue label={labels.newOwnerOldEmallId[lang]} value={vo.oldOwnerEmail} />
                <KeyValue label={labels.newOwnerMobilNo[lang]} value={vo.newOwnerMobileNo} highlight />
                <KeyValue label={labels.newOwnerEmallId[lang]} value={vo.newOwnerEmail} highlight />
              </Grid>
            </SectionCard>

            {/* ---------- Occupant contact change ---------- */}
            <SectionCard
              icon={<PeopleOutline fontSize="small" />}
              title={labels.OccupantDetails[lang]}
              subtitle="Current contact details and the requested changes (highlighted)"
            >
              <Grid container spacing={2.5}>
                <KeyValue label={labels.newOccupantOldMobileNo[lang]} value={vo.oldOccupantMobileNo} />
                <KeyValue label={labels.newOccupantOldEmailId[lang]} value={vo.oldOccupantEmail} />
                <KeyValue label={labels.newOccupantMobileNo[lang]} value={vo.newOccupantMobileNo} highlight />
                <KeyValue label={labels.newOccupantEmailId[lang]} value={vo.newOccupantEmail} highlight />
              </Grid>
            </SectionCard>

            {/* ---------- Documents ---------- */}
            <SectionCard
              icon={<DescriptionOutlined fontSize="small" />}
              title={labels.DocumentDetails[lang]}
              subtitle="Supporting documents attached to this application"
            >
              <TableContainer sx={{ border: "1px solid #DDE3EC", borderRadius: 2, overflow: "hidden" }}>
                <Table size="small" aria-label="documents">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCellSx, width: "10%" }}>Sr.</TableCell>
                      <TableCell sx={{ ...headCellSx, width: "60%" }}>{labels.docs[lang]}</TableCell>
                      <TableCell align="center" sx={{ ...headCellSx, width: "30%" }}>
                        View
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.length ? (
                      documents.map((doc, index) => (
                        <TableRow key={index} hover sx={{ "& td": { padding: "8px 12px", fontSize: 13 } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{doc.documentName}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              startIcon={<VisibilityOutlined />}
                              onClick={() => handleDownload(doc.documentName, doc.documentURLbase64)}
                              sx={{ textTransform: "none", color: MINT, fontWeight: 600 }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          {labels?.NoRecordFound?.[lang] || "No documents attached"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>

            {/* ---------- Remark + actions ---------- */}
            <SectionCard
              icon={<EditNoteOutlined fontSize="small" />}
              title={labels.Remark[lang]}
              subtitle="A remark is required before you can accept or reject"
              footer={
                <>
                  <Button
                    variant="contained"
                    onClick={() => handleSubmit("accept")}
                    disabled={!remarkFilled}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      bgcolor: MINT,
                      "&:hover": { bgcolor: "#0B5A46" },
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleSubmit("reject")}
                    disabled={!remarkFilled}
                    sx={{ textTransform: "none", borderRadius: 2, px: 3 }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/PropertyTransactionsDashBoardZO")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      borderColor: NAVY,
                      color: NAVY,
                      "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
                    }}
                  >
                    Cancel
                  </Button>
                </>
              }
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: NAVY, mb: 1 }}>
                {labels.Remark[lang]} *
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Enter your remark"
                variant="outlined"
                sx={{ "& textarea": { resize: "vertical" } }}
              />
            </SectionCard>
          </>
        )}
      </Box>
    </DashBoardContainer>
  );
};

export default PropertyMobileEmailChangeZo;