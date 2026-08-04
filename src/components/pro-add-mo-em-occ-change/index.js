import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from "@mui/icons-material/Visibility";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { namChangeApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { useSearchParams } from "react-router-dom";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import FormButtons from "../common/buttons";
import FormTitle from "../form-fields/form-title";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";


import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyForUpadate,
    submitPropertyInfoChange,
    ViewProTransactionDoc
} from "../../services/assessment-services";


const PropertyTranApplication = () => {
    const lang = useSelector((state) => state.userDetails.lang);
    const { setLoading, error, setError } = useApiState();
    const [allTrsactions, setAllTrsactions] = useState([]);
    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);
    const [searchParams] = useSearchParams();
    const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
    const propertyCodeFromURL = searchParams.get("propertyCode");
    const applicationNoFromURL = searchParams.get("applicationNo");
    const [propertyOwnerDetails, setPropertyOwnerDetails] = useState([]);
    const [mobileNo, setMobileNo] = useState("");
    const [occupant, setOccupant] = useState("");
    const [ResponseData, setResponseData] = useState([]);
    const applicationFromIdFromURL = searchParams.get("applicationFromId");

    const initialState = {
        marPropertyName: propertyOwnerDetails,
        engPropertyName: "",
        marPropertyOccupantName: "",
        engPropertyOccupantName: "",
        transactionTypeId: "",
        zoneKey: "",
        gatKey: "",
        remark: "",
        newMarOwnerName: "",
        newEngOwnerName: "",
        newMarOccupantName: "",
        newEngOccupantName: "",

        documents: [
            {
                documentId: "",
                documentURLbase64: "",
            },
        ],
    };

    //formik.setFieldValue("propertyCode", propertyCodeFromURL || "");
    const formik = useFormik({
        initialValues: initialState,
        enableReinitialize: true,
        validationSchema: namChangeApplicationSchema,
        validateOnMount: true,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    const transactionsOptions = useMemo(() =>
        allTrsactions.map(item => ({
            value: item.id,
            label: item.marTransactionTypeName,
        })), [allTrsactions]
    );

    //Back Button 
    const handleBackClick = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (transactionTypeIdFromURL && transactionsOptions.length > 0) {
            const match = transactionsOptions.find(
                (item) => String(item.value) === String(transactionTypeIdFromURL)
            );
            if (match) {
                formik.setFieldValue("transactionTypeId", match.value); // only id if formik expects id
            }
        }
    }, [transactionTypeIdFromURL, transactionsOptions]);

    useEffect(() => {

        if (!propertyCodeFromURL) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [ownerResponse] = await Promise.all([
                    getPropertyForUpadate({
                        propertyCode: propertyCodeFromURL,
                        transactionTypeKey: transactionTypeIdFromURL,
                    }),
                ]);
                // Owner Details
                if (ownerResponse) {
                    setPropertyOwnerDetails(ownerResponse.oldMarOwnerName);
                    setMobileNo(ownerResponse.propertyMobileNo);
                    setOccupant(ownerResponse.oldMarOccupantName);
                    setResponseData(ownerResponse?.documentVOs || []);
                }
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [propertyCodeFromURL, transactionTypeIdFromURL, applicationNoFromURL]);

    const documents = ResponseData;


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

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [allProTransactionsRes, zonesRes] = await Promise.all([getAllProTransactions(), getZoneByProfile()]);
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
    const navigate = useNavigate();

    useEffect(() => {
        if (propertyOwnerDetails || occupant) {
            formik.setValues(prev => ({
                ...prev,
                marPropertyName: propertyOwnerDetails || prev.marPropertyName,
                marPropertyOccupantName: occupant || prev.marPropertyOccupantName,
            }));
        }
    }, [propertyOwnerDetails, occupant]);


    // Safe UUID generator for browsers and Node
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
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }


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
                    newMarOwnerName: values.marPropertyName,
                    newEngOwnerName: values.engPropertyName,
                    newMarOccupantName: values.marPropertyOccupantName,
                    newEngOccupantName: values.engPropertyOccupantName,
                    remark: values.remark,
                    applicationId: applicationNoFromURL,
                    oldEngOwnerName: values.occupantName,
                    mobileNo: mobileNo,
                    oldMarOwnerName: propertyOwnerDetails,
                    oldMarOccupantName: occupant,
                    // documentVOs: values.documents.map(doc => ({
                    //     documentId: doc.documentId,
                    //     documentURLbase64: doc.documentURLbase64,
                    // })),
                    documentVOs:
                        applicationFromIdFromURL === "2"
                            ? values.documents.map(doc => ({
                                documentId: doc.documentId,
                                documentURLbase64: doc.documentURLbase64,
                            }))
                            : documents.map(doc => ({
                                documentId: doc.documentId,
                                documentURL: doc.documentURLbase64,
                            })),
                }
            ]
        };
        try {
            setLoading(true);

            const response = await submitPropertyInfoChange(body);

            if (response?.responseStatus === 'Success') {
                showToastSuccess(`Thank you for your application. You will be redirected in 5 seconds...`);
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

    const [isPropertyCodeDisabled, setIsPropertyCodeDisabled] = useState(true);

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

            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundColor: "rgb(204, 234, 244)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 4,
                    margin: 5,
                    borderRadius: 4
                }}
            >
                <Grid>
                    <FormikProvider value={formik}>
                        <Typography
                            variant="h5"
                            fontWeight="bolder"
                            align="center"
                            paddingBottom={2}
                            paddingTop={2}
                        >
                            {labels?.NameCorrectionApplicationType?.[lang] || ""}
                        </Typography>
                        <Form>
                            <Box>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: "90%",
                                        padding: 5,
                                        marginLeft: "1.5%",
                                        borderRadius: 5,
                                    }}
                                >
                                    <Grid container spacing={3}>
                                        {/* Row 1: Owner Name and Occupant Name side by side */}
                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.Type[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <SelectInput name="transactionTypeId" options={transactionsOptions} disabled />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyNumber[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField fullWidth variant="standard" size="small" name="propertyCode" disabled value={propertyCodeFromURL} />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* row 2: occupantName in english and marathi  */}
                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.Zone[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <SelectInput name="zoneKey" options={zoneKeys} />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.Gat[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <SelectInput name="gatKey" options={gatKeys} />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        {/* Row 2: Mobile Number full width */}
                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.ownerName[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="propertyOwnerName" disabled value={propertyOwnerDetails}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.occupantName[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="occupantName" disabled value={occupant}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box display="flex" alignItems="center">
                                                <Box minWidth={140}>
                                                    <Typography fontWeight="bold">
                                                        {labels.RemarkForProperty[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="remark" required
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    sx={{ width: "35.5%" }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            <Typography
                                variant="h5"
                                fontWeight="bolder"
                                align="center"
                                paddingBottom={2}
                                paddingTop={2}
                            >
                                {labels?.NewDetails?.[lang] || ""}
                            </Typography>

                            <Box>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: "90%",
                                        padding: 5,
                                        marginLeft: "1.5%",
                                        borderRadius: 5,
                                    }}
                                >
                                    <Grid container spacing={3}>
                                        {/* Row 1: Owner Name and Occupant Name side by side */}
                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyNameMar[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="marPropertyName" required
                                                        sx={{ width: "100%" }}
                                                        value={formik.values.marPropertyName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyNameEng[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="engPropertyName" required
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyOccupantNameMar[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="marPropertyOccupantName" required
                                                        sx={{ width: "100%" }}
                                                        value={formik.values.marPropertyOccupantName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyOccupantNameEng[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="engPropertyOccupantName" required
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            <Typography
                                variant="h5"
                                fontWeight="bolder"
                                align="center"
                                paddingBottom={2}
                                paddingTop={2}
                            >
                                {labels?.DocumentDetails?.[lang] || ""}
                            </Typography>

                            <Box>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: "90%",
                                        padding: 5,
                                        marginLeft: "1.5%",
                                        borderRadius: 5,
                                    }}
                                >
                                    {applicationFromIdFromURL === '2' ? (
                                        <Grid container spacing={3}>
                                            <Grid container item spacing={3} xs={12}>
                                                <PropertyDocumentsForm />
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                width: "90%",
                                                maxWidth: 1200,
                                                padding: 5,
                                                borderRadius: 4
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
                                    )}
                                    <Grid container justifyContent="center" alignItems="center">
                                        <Grid
                                            item
                                            md={3}
                                            container
                                            justifyContent={{ md: "flex-end" }}
                                            alignItems="center"
                                            p={2}
                                        >
                                            <FormButtons
                                                disabled={!formik.isValid || !formik.dirty}
                                                handleSubmitButtonClick={handleSubmit}
                                                resetForm={() => { window.location.reload(); }}
                                                submitBtnLabel="Submit"
                                                isSubmitIcon={false}
                                                cancelRedirect="/PropertyTransactionsDashBoard"
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>
                        </Form>
                    </FormikProvider>

                </Grid>
            </Box>

        </DashBoardContainer>
    );
};
export default PropertyTranApplication;