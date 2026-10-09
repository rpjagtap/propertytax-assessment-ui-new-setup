import React, { useEffect, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBack from "@mui/icons-material/ArrowBack";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
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

// Theme tokens
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

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
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", gap: 2, bgcolor: "#FAFBFD" }}>
          {footer}
        </Box>
      </>
    )}
  </Card>
);

const PropertyNameChangeZo = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const currentUserProfileId = useSelector((state) => state.userDetails.userInfo.userId);
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
    remarks: "",
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
      }
    };
    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCodeFromURL]);

  // Safe access to response data
  const vo = responseData?.propertyUpdateVO?.[0] || {};
  const documents = vo.documentVOs || [];

  // Submit handler
  const handleSubmit = async (actionType) => {
    const values = formik.values;
    const body = {
      propertyCode: propertyCodeFromURL,
      transactionTypeKey: transactionTypeIdFromURL,
      newMarOwnerName: vo.newMarOwnerName,
      newEngOwnerName: vo.newEngOwnerName,
      newMarOccupantName: vo.newMarOccupantName,
      newEngOccupantName: vo.newEngOccupantName,
      orderNo: vo.orderNo,
      userid: currentUserProfileId,
      applicationId: applicationNoFromURL,
      remark: values.remarks,
      action: actionType,
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
      const contentType = response.type || "application/pdf";
      const blob = new Blob([response], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        alert("Please allow popups to view the file.");
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Loading guard
  if (!responseData?.propertyUpdateVO?.length) return <div>Loading...</div>;

  const remarkEmpty = !formik.values.remarks?.trim();

  return (
    <DashBoardContainer>
      {error && <AlertMsg message={error} severity="error" onClose={() => setError("")} />}
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
            <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,0.12)", color: "#5DCAA5" }}>
              <HomeWorkOutlined />
            </Avatar>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                {labels?.PropertyOwnerAndOccupantNameCorrection?.[lang] ||
                  "Property Owner and Occupant Name Correction"}
              </Typography>
              <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                Review the current and corrected names, then accept or reject this application.
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

        {/* ---------- Current details ---------- */}
        <SectionCard
          icon={<PersonOutline fontSize="small" />}
          title="Current property details"
          subtitle="Existing owner, occupant and application information on record"
        >
          <Grid container spacing={3}>
            <InfoRow label={labels.Type[lang]} value={vo.transactionType} />
            <InfoRow label={labels.PropertyNumber[lang]} value={vo.propertyCode} />
            <InfoRow label={labels.Zone[lang]} value={vo.zoneName} />
            <InfoRow label={labels.Gat[lang]} value={vo.gatName} />
            <InfoRow label={labels.ownerName[lang]} value={vo.oldMarOwnerName} />
            <InfoRow label={labels.occupantName[lang]} value={vo.oldMarOccupantName} />
            <InfoRow label={labels.ApplicationDate[lang]} value={vo.applicationDate} />
            <InfoRow label={labels.ApplicationNo[lang]} value={vo.applicationId} />
            <InfoRow label={labels.OrderNumber[lang]} value={vo.applicationId} />
            <InfoRow label={labels.RemarkForProperty[lang]} value={vo.remark} />
          </Grid>
        </SectionCard>

        {/* ---------- New details ---------- */}
        <SectionCard
          icon={<EditOutlined fontSize="small" />}
          title={labels?.NewDetails?.[lang] || "New details"}
          subtitle="Corrected owner and occupant names in both languages"
        >
          <Grid container spacing={3}>
            <InfoRow label={labels.OwnerName[lang]} value={vo.newMarOwnerName} />
            <InfoRow label={labels.ownerNameEnglish[lang]} value={vo.newEngOwnerName} />
            <InfoRow label={labels.OccupantNameMarathi[lang]} value={vo.newMarOccupantName} />
            <InfoRow label={labels.OccupantNameEnglish[lang]} value={vo.newEngOccupantName} />
          </Grid>
        </SectionCard>

        {/* ---------- Documents ---------- */}
        <SectionCard
          icon={<DescriptionOutlined fontSize="small" />}
          title={labels.DocumentDetails[lang]}
          subtitle="Documents submitted with this application"
        >
          <Table
            sx={{ width: "100%", border: "1px solid #D5DCE6", borderRadius: 1 }}
            size="small"
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#EEF2F7" }}>
                <TableCell sx={{ fontWeight: 600, width: "10%", color: NAVY, borderRight: "1px solid #D5DCE6" }}>
                  Sr.
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: "60%", color: NAVY, borderRight: "1px solid #D5DCE6" }}>
                  {labels.docs[lang]}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: "30%", color: NAVY }} align="center">
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
                      onClick={() => handleDownload(doc.documentName, doc.documentURLbase64)}
                      style={{ color: MINT, cursor: "pointer" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        {/* ---------- Remark + actions ---------- */}
        <SectionCard
          icon={<ChatBubbleOutline fontSize="small" />}
          title={labels.Remark[lang]}
          subtitle="A remark is required to accept or reject"
          footer={
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSubmit("accept")}
                disabled={remarkEmpty}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleSubmit("reject")}
                disabled={remarkEmpty}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/PropertyTransactionsDashBoardZO")}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Cancel
              </Button>
            </>
          }
        >
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
        </SectionCard>
      </Box>
    </DashBoardContainer>
  );
};

export default PropertyNameChangeZo;