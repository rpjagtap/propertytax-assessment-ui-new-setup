import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import { Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import useApiState from "../common/useApiState";
import { getPropertyUpadateDetails, savePropertyUpdateDetails, ViewProTransactionDoc } from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { namChangeApplicationZoSchema } from "../../utils/validation-schema";
import AlertMsg from "../common/alert";


const PropertyNameChangeZo = () => {
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
    }, [propertyCodeFromURL]);

    // Safe access to response data
    const vo = responseData?.propertyUpdateVO?.[0] || {};
    const documents = vo.documentVOs || [];
    const currentUserProfileId = useSelector((state) => state.userDetails.userInfo.userId);

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
            action: actionType
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


    // Loading guard
    if (!responseData?.propertyUpdateVO?.length) return <div>Loading...</div>;

    return (
        <DashBoardContainer>
            {error && <AlertMsg message={error} severity="error" onClose={() => setError("")} />}
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
                    margin:5,
                    borderRadius:4
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
                    {labels.PropertyOwnerAndOccupantNameCorrection[lang]}
                </Typography>

                {/* Old Details Section */}
                <Paper
                    elevation={3}
                    sx={{
                        width: "90%",
                        maxWidth: 1200,
                        padding: 5,
                        borderRadius:4
                    }}
                >
                    <Grid container spacing={0.85}>

                        {/* Type */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.Type[lang]}:</Typography>
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
                                    <Typography fontWeight="bold">{labels.PropertyNumber[lang]}:</Typography>
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
                                    <Typography fontWeight="bold">{labels.Zone[lang]}:</Typography>
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
                                    <Typography fontWeight="bold">{labels.ownerName[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.oldMarOwnerName}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Occupant Name */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.occupantName[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.oldMarOccupantName}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Application Date */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.ApplicationDate[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.applicationDate}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Application No */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.ApplicationNo[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.applicationId}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Order Number */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.OrderNumber[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.applicationId}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Remark */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.RemarkForProperty[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.remark}</>
                                </Grid>
                            </Grid>
                        </Grid>

                    </Grid>
                </Paper>

                {/* New Details Title */}
                <Typography
                    variant="h5"
                    fontWeight="bolder"
                    align="center"
                    paddingBottom={2}
                    paddingTop={5}
                >
                    {labels.NewDetails[lang]}
                </Typography>

                {/* New Details Section */}
                <Paper
                    elevation={3}
                    sx={{
                        width: "90%",
                        maxWidth: 1200,
                        padding: 5,
                        borderRadius:4
                    }}
                >
                    <Grid container spacing={0.85}>

                        {/* New Owner Name Marathi */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.OwnerName[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.newMarOwnerName}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* New Owner Name English */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.ownerNameEnglish[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.newEngOwnerName}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* New Occupant Name Marathi */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.OccupantNameMarathi[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.newMarOccupantName}</>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* New Occupant Name English */}
                        <Grid item xs={12} md={6}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">{labels.OccupantNameEnglish[lang]}:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <>{vo.newEngOccupantName}</>
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
                        borderRadius:4
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
                                <TableCell sx={{ fontWeight: 600, width: "10%", borderRight: "1px solid #bdbdbd" }}>Sr.</TableCell>
                                <TableCell sx={{ fontWeight: 600, width: "60%", borderRight: "1px solid #bdbdbd" }}>
                                    {labels.docs[lang]}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: "30%" }} align="center">View</TableCell>
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
                        borderRadius:4
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
                        <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
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








            {/* <Grid>
                <FormikProvider value={formik}>
                    <Form>
                        <Paper elevation={4} sx={{ marginBottom: "15px", padding: 2 }}>
                            <FormTitle title={labels.PropertyOwnerAndOccupantNameCorrection[lang]} />
                            <GridRow>
                                <FormLabel label={labels.Type[lang]} />
                                <FormValue component={<>{vo.transactionType}</>} />
                                <FormLabel label={labels.PropertyNumber[lang]} />
                                <FormValue component={<>{vo.propertyCode}</>} />
                            </GridRow>
                            <GridRow>
                                <FormLabel label={labels.Zone[lang]} />
                                <FormValue component={<>{vo.zoneName}</>} />
                                <FormLabel label={labels.Gat[lang]} />
                                <FormValue component={<>{vo.gatName}</>} />
                            </GridRow>
                            <GridRow>
                                <FormLabel label={labels.ownerName[lang]} />
                                <FormValue component={<>{vo.oldMarOwnerName}</>} />
                                <FormLabel label={labels.occupantName[lang]} />
                                <FormValue component={<>{vo.oldMarOccupantName}</>} />
                            </GridRow>
                            <GridRow>
                                <FormLabel label={labels.ApplicationDate[lang]} />
                                <FormValue component={<>{vo.applicationDate}</>} />
                                <FormLabel label={labels.ApplicationNo[lang]} />
                                <FormValue component={<>{vo.applicationId}</>} />
                            </GridRow>
                            <GridRow>
                                <FormLabel label={labels.OrderNumber[lang]} />
                                <FormValue component={<>{vo.applicationId}</>} />
                                <FormLabel label={labels.RemarkForProperty[lang]} />
                                <FormValue component={<>{vo.remark}</>} />
                            </GridRow>
                            <hr />
                            <FormTitle title={labels.NewDetails[lang]} />
                            <GridRow>
                                <FormLabel label={labels.OwnerName[lang]} />
                                <FormValue component={<>{vo.newMarOwnerName}</>} />
                                <FormLabel label={labels.ownerNameEnglish[lang]} />
                                <FormValue component={<>{vo.newEngOwnerName}</>} />
                            </GridRow>
                            <GridRow>
                                <FormLabel label={labels.OccupantNameMarathi[lang]} />
                                <FormValue component={<>{vo.newMarOccupantName}</>} />
                                <FormLabel label={labels.OccupantNameEnglish[lang]} />
                                <FormValue component={<>{vo.newEngOccupantName}</>} />
                            </GridRow>
                            <hr />
                            <FormTitle title={labels.DocumentDetails[lang]} />
                            <Table
                                sx={{
                                    maxWidth: 650,
                                    border: "1px solid #bdbdbd",
                                    margin: "20px auto",
                                    borderRadius: 1,
                                }}
                                size="small"
                            >
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "#abd9e3" }}>
                                        <TableCell sx={{ fontWeight: 600, width: "10%", borderRight: "1px solid #bdbdbd" }}>Sr.</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "60%", borderRight: "1px solid #bdbdbd" }}>
                                            {labels.docs[lang]}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "30%" }} align="center">View</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {documents.map((doc, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{doc.documentName}</TableCell>
                                            <TableCell align="center">
                                                <VisibilityIcon fontSize="small" onClick={() =>
                                                    handleDownload(doc.documentName, doc.documentURLbase64)
                                                }
                                                    style={{
                                                        color: "#1976d2",
                                                        cursor: "pointer",
                                                        textDecoration: "none",
                                                    }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <hr />
                            <GridRow>
                                <FormLabel label={labels.Remark[lang]} required />
                                <FormValue
                                    component={
                                        <TextField name="remarks" multiline minRows={2} maxRows={4} variant="outlined" sx={{ width: { xs: "100%", md: "90%" }, }} value={formik.values.remarks} onChange={formik.handleChange} />
                                    }
                                />
                            </GridRow>
                            <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
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
                        </Paper>
                    </Form>
                </FormikProvider>
            </Grid> */}
        </DashBoardContainer>
    );
};
export default PropertyNameChangeZo;