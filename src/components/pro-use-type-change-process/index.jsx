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
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import { TableContainer } from "@mui/material";

const PropertyUseTypeChange = () => {
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

  // Submit handler
  const handleSubmit = async (actionType) => {
    const values = formik.values;
    const body = {
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

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          margin: 5,
          borderRadius: 4,
        }}
      >
        {/* Section Title */}
        <Typography
          variant="h5"
          fontWeight="bolder"
          align="center"
          paddingBottom={2}
          paddingTop={5}
        >
          {labels.UseTypechangeApplicationTitle[lang]}
        </Typography>

        {/* Old Details Section */}
        <Paper
          elevation={3}
          sx={{
            width: "90%",
            maxWidth: 1200,
            padding: 5,
            borderRadius: 4,
          }}
        >
          <Grid container spacing={0.85}>
            {/* Type */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.TransactionType[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.transactionType}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Property Number */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.PropertyNumber[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.propertyCode}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Zone */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.Zone[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.zoneName}</>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">{labels.Gat[lang]}:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.gatName}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Owner Name */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.ownerName[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.propertyName}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Occupant Name */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.PropertyAddress[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.propertyAddress}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Application Date */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.occupantName[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.propertyOccupantName}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Application No */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.MobileNo[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.propertyMobileNo}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Order Number */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.SRDate[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.sr1Date}</>
                </Grid>
              </Grid>
            </Grid>

            {/* Remark */}
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={4}>
                  <Typography fontWeight="bold">
                    {labels.description[lang]}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <>{vo.description}</>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Document Details Title */}
        <Typography
          variant="h5"
          fontWeight="bolder"
          align="center"
          paddingBottom={2}
          paddingTop={5}
        >
          {labels.DocumentDetails[lang]}
        </Typography>

        {/* Document Section */}
        <Paper
          elevation={3}
          sx={{
            width: "90%",
            maxWidth: 1200,
            padding: 5,
            borderRadius: 4,
          }}
        >
          <Table
            sx={{
              width: "100%",
              border: "1px solid #bdbdbd",
              marginTop: 2,
              borderRadius: 1,
            }}
            size="small"
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#abd9e3" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    width: "10%",
                    borderRight: "1px solid #bdbdbd",
                  }}
                >
                  Sr.
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    width: "60%",
                    borderRight: "1px solid #bdbdbd",
                  }}
                >
                  {labels.docs[lang]}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, width: "30%" }}
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
                      style={{
                        color: "#1976d2",
                        cursor: "pointer",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Typography variant="h5" fontWeight="bolder" align="center" py={2}>
          {labels?.useType?.[lang] || ""}
        </Typography>

        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 1200,
            padding: 5,
            borderRadius: 4,
          }}
        >
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& th, & td": {
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "#abd9e3" }}>
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
        </Paper>

        {/* Remark Section */}
        <Typography
          variant="h5"
          fontWeight="bolder"
          align="center"
          paddingBottom={2}
          paddingTop={5}
        >
          {labels.Remark[lang]}
        </Typography>

        <Paper
          elevation={3}
          sx={{
            width: "90%",
            maxWidth: 1200,
            padding: 5,
            borderRadius: 4,
          }}
        >
          <Grid container spacing={0.85}>
            <Grid item xs={12}>
              <Typography fontWeight="bold" gutterBottom>
                {labels.Remark[lang]}:
              </Typography>

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
                sx={{
                  "& textarea": {
                    resize: "vertical",
                  },
                }}
              />
            </Grid>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleSubmit("accept")}
                  disabled={!formik.values.remarks?.trim()}
                >
                  Accept
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleSubmit("reject")} // Reject action
                  disabled={!formik.values.remarks?.trim()}
                >
                  Reject
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate("/PropertyTransactionsDashBoardZO")} // Cancel action
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </DashBoardContainer>
  );
};
export default PropertyUseTypeChange;
