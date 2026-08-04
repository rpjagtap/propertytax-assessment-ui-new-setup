import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import { Table, TableBody, TableCell, TableHead, TableRow, Grid, Paper, Box, Typography, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { useTypeApplicationSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import { useSearchParams } from "react-router-dom";
import { useFormikContext } from "formik";
import DateInput from "../form-fields/date-picker";

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyOwnerDetails,
    submitUpdatePropertyUseTypeChange,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import AssessmentTable from "../sr-register/assessmentTable";


const PropertyUseTypeChangeApplication = () => {
    const initialState = {
        transactionTypeId: "",
        zoneKey: "",
        gatKey: "",
        propertyCode: "",
        sr1Date: getCurrentDate(),
        finalUseType: "",
        finalConstructionType: "",
        description: "",
        documents: [
            {
                documentId: "",
                documentURLbase64: "",
            },
        ],
    };

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
    const [propertyAddress, setPropertyAddress] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [occupant, setOccupant] = useState("");
    const [oldUseTypeDtls, setOldUseTypeDtls] = useState([]);
    const [oldPropertyKey, setOldPropertyKey] = useState("");

    const formik = useFormik({
        initialValues: initialState,
        propertyOwnerName: propertyOwnerDetails || "",
        propertyAddress: propertyAddress || "",
        occupant: occupant || "",
        validationSchema: useTypeApplicationSchema,
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
        if (propertyCodeFromURL) {
            formik.setFieldValue("propertyCode", propertyCodeFromURL);
            const propertyOwnerDetails = async () => {
                try {
                    setLoading(true);
                    const response = await getPropertyOwnerDetails({
                        propertyCode: propertyCodeFromURL
                    });
                    if (response) {
                        setPropertyOwnerDetails(response.propertyName);
                        setPropertyAddress(response.propertyAddress);
                        setMobileNo(response.propertyMobileNo);
                        setOccupant(response.occupantName);
                        setOldUseTypeDtls(response.propertyDetailsROLst);
                        setOldPropertyKey(response.propertyKey);
                    }
                } catch (error) {
                    showToastError(getErrorMsg(error));
                } finally {
                    setLoading(false);
                }
            };
            propertyOwnerDetails();
        }
    }, [propertyCodeFromURL]);

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
    useEffect(() => {
        if (oldPropertyKey) {
            formik.setFieldValue("oldPropertyKey", oldPropertyKey);
        }
    }, [oldPropertyKey]);

    const handleSubmitButtonClick = async (e) => {
        e.preventDefault();
        const values = formik.values;
        const body = {
            requestId: generateUUID(),
            channelName: "PropertyTax",
            propertyTransactionVO: [
                {
                    // PropertyInfoForm
                    transactionTypeId: values.transactionTypeId,
                    oldPropertyKey: values.oldPropertyKey,
                    propertyCode: values.propertyCode,
                    propertyName: propertyOwnerDetails || "",
                    propertyOccupantName: occupant || "",
                    propertyAddress: propertyAddress || "",
                    propertyMobileNo: mobileNo,
                    zoneKey: values.zoneKey,
                    gatKey: values.gatKey,
                    sr1Date: values.sr1Date,
                    description: values.description,
                    assessmentFinYear: "",
                    specialOwnershipId: "",
                    waterConnNo: "",
                    drainageNo: "",
                    finalConstructionType: values.finalConstructionType,
                    applicationId: applicationNoFromURL,
                    finalUseType: values.finalUseType,
                    //PropertyDocumentsForm
                    documentVOs: values.documents.map(doc => ({
                        documentId: doc.documentId,
                        documentURLbase64: doc.documentURLbase64,
                    })),
                    // AssessmentTable
                    propertyTransactionDetailsVO: values.propertyTransactionDetailsVO.map(row => ({
                        oldPropertyKey: values.oldPropertyKey,
                        oldPropertyDetailsKey: row.propertyDetailsKey,
                        useTypeKey: row.useType,
                        subUseTypeKey: row.subUseType,
                        constructionTypeKey: row.constructionType,
                        occuapncyKey: row.occupancy,
                        specialOccupantKey: row.specialResidents,
                        assessmentDate: row.assessmentDate || getCurrentDate(),
                        area: row.areaInSqmt,
                        rateableValue: row.rVValue,
                        toiletFlag: row.isToilet ? "Y" : "N",
                        permission: row.isIllegal ? "Y" : "N",
                    })),
                }
            ]
        }

        try {
            setLoading(true);
            const response = await submitUpdatePropertyUseTypeChange(body);

            if (response?.applicationId) {
                localStorage.setItem("applicationId", response.applicationId);
                localStorage.setItem("transactionTypeId", values.transactionTypeId);
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

    const navigate = useNavigate();

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
                    backgroundColor: "rgb(204, 234, 244)",
                    display: "flex",
                    flexDirection: "column",
                    padding: 4,
                    borderRadius: 4,
                    margin: 5
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
                            {labels?.UseTypechangeApplicationTitle?.[lang] || ""}
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
                                    {/* <Paper elevation={4} sx={{ marginBottom: "15px" }}> */}
                                    <Grid container spacing={3}>

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
                                                            {labels.PropertyAddress[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        multiline={true} name="propertyAddress" value={propertyAddress} disabled variant="standard" sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Grid container item spacing={3} xs={12}>
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

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.MobileNo[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth={false}
                                                        variant="standard"
                                                        size="small"
                                                        name="mobileNo" disabled value={mobileNo}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.SRDate[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <DateInput name="sr1Date" required />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.description[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <FormValue component={<TextInput name="description" multiline rows={1} required variant="standard" />} />
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
                                    <Grid container spacing={3}>
                                        <Grid container item spacing={3} xs={12}>
                                            <PropertyDocumentsForm />
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
                                {labels?.useType?.[lang] || ""}
                            </Typography>

                            <Box>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: "90%",
                                        padding: 5,
                                        marginLeft: "1.5%",
                                        borderRadius: 5,
                                        overflowX: "auto"
                                    }}
                                >
                                    <Grid container spacing={3}>
                                        <Grid container item spacing={3} xs={12}>
                                            <AssessmentTable
                                                zoneKey={formik.values.zoneKey}
                                                initialRows={oldUseTypeDtls}
                                                disableAddButton={true}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

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
                                        isValid={!formik.isValid || !formik.dirty}
                                        handleSubmitButtonClick={handleSubmitButtonClick}
                                        resetForm={() => { window.location.reload(); }}
                                        submitBtnLabel="Submit"
                                        isSubmitIcon={false}
                                        cancelRedirect="/PropertyTransactionsDashBoard"
                                    />
                                </Grid>
                            </Grid>
                        </Form>
                    </FormikProvider>
                </Grid>
            </Box>

        </DashBoardContainer >
    );
};
export default PropertyUseTypeChangeApplication;