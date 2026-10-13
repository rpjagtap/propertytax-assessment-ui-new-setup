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
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { useSelector } from "react-redux";
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

// The API fields below may arrive as booleans or as "Y"/"N" strings.
// A plain truthiness check would show "Yes" for the string "N".
const isYes = (value) =>
  value === true || ["Y", "y", "true", "TRUE", "Yes", "YES"].includes(value);

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

// One read-only "label → value" pair.
const KeyValue = ({ label, value }) => (
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
        bgcolor: "#F6F8FB",
        border: "1px solid #EEF1F6",
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: NAVY, wordBreak: "break-word" }}>
        {value || "-"}
      </Typography>
    </Box>
  </Grid>
);

const PropertyUseTypeChange = () => {
  const lang = useSelector((state) => state.userDetails?.lang);
  const { setLoading, error, setError } = useApiState();
  const [responseData, setResponseData] = useState({});
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const applicationNoFromURL = searchParams.get("applicationNo");
  const navigate = useNavigate();

  // Page-level fetch state, so the page can show a spinner while loading
  // and a proper empty state if nothing comes back (instead of a bare
  // "Loading..." that never goes away).
  const [isFetching, setIsFetching] = useState(
    Boolean(applicationNoFromURL && transactionTypeIdFromURL)
  );

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
        setIsFetching(false);
      }
    };
    fetchPropertyDetails();
  }, [applicationNoFromURL, transactionTypeIdFromURL, setLoading]);

  // Safe access to response data
  const vo = responseData?.propertyTransactionVO?.[0] || {};
  const oldUseTypeDtls = vo.propertyTransactionDetailsVO || [];
  const documents = vo.documentVOs || [];
  const currentUserProfileId = useSelector((state) => state.userDetails?.userInfo?.userId);
  const hasData = Boolean(responseData?.propertyTransactionVO?.length);

  // Submit handler
  const handleSubmit = async (actionType) => {
    const values = formik.values;
    const body = {
      propertyTransactionVO: [
        {
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

          // `documents` / `oldUseTypeDtls` are already guarded with `|| []`,
          // unlike the original `vo.documentVOs.map(...)` which threw if the
          // API omitted either list.
          documentVOs: documents.map((doc) => ({
            documentURLbase64: doc.documentURLbase64,
            documentName: doc.documentName,
          })),
          propertyTransactionDetailsVO: oldUseTypeDtls.map((row) => ({
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
          })),
          revertFormVO: {
            remark: values.remarks,
            revertAction: actionType,
          },
        },
      ],
    };

    try {
      setLoading(true);
      const response = await revertApplication(body);
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
                <ApartmentOutlined />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                  {labels?.UseTypechangeApplicationTitle?.[lang] || "Use Type Change Application"}
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  Review the property and use type details, then accept or reject the application.
                </Typography>
              </Box>
              {vo.applicationId && (
                <Chip label={vo.applicationId} sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }} />
              )}
            </Box>

            {/* ---------- Property details ---------- */}
            <SectionCard
              icon={<InfoOutlined fontSize="small" />}
              title="Property details"
              subtitle="Property and application information"
            >
              <Grid container spacing={2.5}>
                <KeyValue label={labels.TransactionType[lang]} value={vo.transactionType} />
                <KeyValue label={labels.PropertyNumber[lang]} value={vo.propertyCode} />
                <KeyValue label={labels.Zone[lang]} value={vo.zoneName} />
                <KeyValue label={labels.Gat[lang]} value={vo.gatName} />
                <KeyValue label={labels.ownerName[lang]} value={vo.propertyName} />
                <KeyValue label={labels.occupantName[lang]} value={vo.propertyOccupantName} />
                <KeyValue label={labels.PropertyAddress[lang]} value={vo.propertyAddress} />
                <KeyValue label={labels.MobileNo[lang]} value={vo.propertyMobileNo} />
                <KeyValue label={labels.SRDate[lang]} value={vo.sr1Date} />
                <KeyValue label={labels.description[lang]} value={vo.description} />
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

            {/* ---------- Use type details ---------- */}
            <SectionCard
              icon={<ApartmentOutlined fontSize="small" />}
              title={labels?.useType?.[lang] || "Use type"}
              subtitle="Use type, construction and assessment details on this application"
            >
              <TableContainer
                sx={{
                  border: "1px solid #DDE3EC",
                  borderRadius: 2,
                  overflowX: "auto",
                  "&::-webkit-scrollbar": { height: 10 },
                  "&::-webkit-scrollbar-track": { backgroundColor: "#F0F2F5" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(18,35,63,0.35)",
                    borderRadius: 10,
                  },
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(18,35,63,0.35) #F0F2F5",
                }}
              >
                <Table size="small" sx={{ minWidth: 1000 }} aria-label="use type details">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={headCellSx}>{labels.useType[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.secUseType[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.constructionType[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.Occupancy[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.SpecialResidents[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.aakarniDate[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.areaInMeter[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.taxAmount[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.Toilet[lang]}</TableCell>
                      <TableCell align="center" sx={headCellSx}>{labels.Illegal[lang]}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oldUseTypeDtls.length ? (
                      oldUseTypeDtls.map((row, index) => (
                        <TableRow
                          key={row.propertyTransactionDetailsId ?? index}
                          hover
                          sx={{ "& td": { padding: "8px 12px", fontSize: 13, textAlign: "center" } }}
                        >
                          <TableCell>{row.useType}</TableCell>
                          <TableCell>{row.subUseType}</TableCell>
                          <TableCell>{row.constructionType}</TableCell>
                          <TableCell>{row.occuapncy}</TableCell>
                          <TableCell>{row.specialOccupant}</TableCell>
                          <TableCell>{row.assessmentDate}</TableCell>
                          <TableCell>{row.area}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.rateableValue}</TableCell>
                          <TableCell>{isYes(row.toilet) ? "Yes" : "No"}</TableCell>
                          <TableCell>{isYes(row.permision) ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          {labels?.NoRecordFound?.[lang] || "No records found"}
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

export default PropertyUseTypeChange;