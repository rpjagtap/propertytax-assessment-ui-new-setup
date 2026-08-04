import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    Grid,
    Paper,
    Box,
    Typography,
    TextField
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { addressChangeApplicationSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import { useSearchParams } from "react-router-dom";
// import { useFormikContext } from "formik";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyForUpadate,
    submitPropertyInfoChange
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";



const PropertyTraAppforadd = () => {



    const lang = useSelector((state) => state.userDetails.lang);
    const { setLoading, error, setError } = useApiState();
    const [allTrsactions, setAllTrsactions] = useState([]);
    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);
    const [searchParams] = useSearchParams();
    const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
    const propertyCodeFromURL = searchParams.get("propertyCode");
    const applicationNoFromURL = searchParams.get("applicationNo");
    // const [applicationNoFromURL, setapplicationNo] = useState("applicationNo");
    const [propertyOwnerDetails, setPropertyOwnerDetails] = useState([]);
    // const [propertyAddress, setPropertyAddress] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    // const [email, setEmail] = useState("");
    const [occupant, setOccupant] = useState("");
    const [oldMarOwnerAddress, setOldMarOwnerAddress] = useState("");
    const [oldEngOwnerAddress, setOldEngOwnerAddress] = useState("");
    // const [newOwnerAddressMar, setNewOwnerAddressMar] = useState(" ");
    // const [newOwnerAddressEng, setNewOwnerAddressEng] = useState(" ");
    // const [newOccupantAddressMar, setNewOccupantAddressMar] = useState(" ");
    // const [newOccupantAddressEng, setNewOccupantAddressEng] = useState(" ");
    // const [newPropertyAddressMar, setNewPropertyAddressMar] = useState(" ");
    // const [newPropertyAddressEng, setNewPropertyAddressEng] = useState(" ");
    const [oldMarPropertyAddress, setOldMarPropertyAddress] = useState("");
    const [oldMarOccupantAddress, setoldMarOccupantAddress] = useState("");
    

    const initialState = useMemo(() => ({
        marOwnerAddress: oldMarOwnerAddress || "",
        marOccupantAddress: oldMarOwnerAddress || "",
        marPropertyAddress: oldMarOwnerAddress || "",

        transactionTypeId: "",
        zoneKey: "",
        gatKey: "",
        propertyCode: propertyCodeFromURL || "",
        applicantFirstName: "",
        applicantMiddleName: "",
        applicantLastName: "",
        applicantMobile: "",
        orderNo: "",
        remark: "",
        applicationId: applicationNoFromURL || "",

        newOwnerAddressMar: "",
        newOwnerAddressEng: "",
        newOccupantAddressMar: "",
        newOccupantAddressEng: "",

        documents: [
            {
                documentId: "",
                documentURLbase64: "",
            },
        ],
    }), [
        oldMarOwnerAddress,
        propertyCodeFromURL,
        applicationNoFromURL
    ]);



    //formik.setFieldValue("propertyCode", propertyCodeFromURL || "");
    const formik = useFormik({
        initialValues: initialState,
        validationSchema: addressChangeApplicationSchema,
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
            const propertyOwnerDetails = async () => {
                try {
                    setLoading(true);
                    const response = await getPropertyForUpadate({
                        propertyCode: propertyCodeFromURL
                    });
                    if (response) {
                        setPropertyOwnerDetails(response.oldMarOwnerName);
                        setMobileNo(response.propertyMobileNo);
                        //setEmail(response.email);
                        setOccupant(response.oldMarOccupantName);
                        setOldMarOwnerAddress(response.oldMarOwnerAddress);
                        setOldEngOwnerAddress(response.oldEngOwnerAddress);
                        setOldMarPropertyAddress(response.oldMarPropertyAddress);
                        setoldMarOccupantAddress(response.oldMarOccupantAddress);
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
                    orderNo: values.orderNo,
                    remark: values.remark,
                    applicationId: applicationNoFromURL,
                    oldEngOwnerName: values.occupantName,
                    oldMarOwnerAddress: oldMarOwnerAddress,
                    oldEngOwnerAddress: oldEngOwnerAddress,
                    mobileNo: mobileNo,
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

                    documentVOs: values.documents.map(doc => ({
                        documentId: doc.documentId,
                        documentURLbase64: doc.documentURLbase64,
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

    useEffect(() => {
        if (!oldMarOwnerAddress && !oldMarOccupantAddress) return;

        formik.setFieldValue("marOwnerAddress", oldMarOwnerAddress);
        formik.setFieldValue("marOccupantAddress", oldMarOccupantAddress);
        formik.setFieldValue("marPropertyAddress", oldMarOwnerAddress);
    }, [oldMarOwnerAddress, oldMarPropertyAddress]);



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
                            {labels?.AddressChangeApplicationType?.[lang] || ""}
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
                                                        {labels.OwnerAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="engOwnerAddress" disabled value={oldMarOwnerAddress}
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
                                                        {labels.OccupantAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="engProeprtyAddress" disabled value={oldMarPropertyAddress}
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
                                                        {labels.PropertyAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="oldMarOwnerAddress" disabled value={oldMarOwnerAddress}
                                                    sx={{ width: "100%" }}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
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
                                                        {labels.OwnerAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="marOwnerAddress" required
                                                    value={formik.values.marOwnerAddress}
                                                    sx={{ width: "100%" }}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Box display="flex" alignItems="center">
                                                <Box minWidth={140}>
                                                    <Typography fontWeight="bold">
                                                        {labels.newEngownerAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="engOwnerAddress" required
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
                                                        {labels.OccupantAddress[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="marOccupantAddress" required
                                                    value={formik.values.marOccupantAddress}
                                                    sx={{ width: "100%" }}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Box display="flex" alignItems="center">
                                                <Box minWidth={140}>
                                                    <Typography fontWeight="bold">
                                                        {labels.OccupantAddressEnglish[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="engOccupantAddress" required
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
                                                        {labels.PropertyAddressMar[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="marPropertyAddress" required
                                                    value={formik.values.marPropertyAddress}
                                                    sx={{ width: "100%" }}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Box display="flex" alignItems="center">
                                                <Box minWidth={140}>
                                                    <Typography fontWeight="bold">
                                                        {labels.PropertyAddressEng[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="engPropertyAddress" required
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
                                <Grid container spacing={3}>
                                    <Grid container item spacing={3} xs={12}>
                                        <PropertyDocumentsForm />
                                    </Grid>
                                </Grid>
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

                        {/* <Form>
                            <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                                <FormTitle title={labels.AddressChangeApplicationType[lang]} />
                                <GridRow>
                                    <FormLabel label={labels.Type[lang]} />
                                    <FormValue component={<SelectInput name="transactionTypeId" options={transactionsOptions} disabled />} />
                                    <FormLabel label={labels.PropertyNumber[lang]} />
                                    <FormValue component={<TextInput name="propertyCode" disabled value={propertyCodeFromURL} />} />
                                </GridRow>
                                <GridRow>
                                    <FormLabel label={labels.Zone[lang]} />
                                    <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} />} />
                                    <FormLabel label={labels.Gat[lang]} />
                                    <FormValue component={<SelectInput name="gatKey" options={gatKeys} />} />
                                </GridRow>
                                <GridRow>
                                    <FormLabel label={labels.ownerName[lang]} />
                                    <FormValue component={<TextInput name="propertyOwnerName" disabled value={propertyOwnerDetails} />} />
                                    <FormLabel label={labels.OwnerAddress[lang]} />
                                    <FormValue component={<TextInput name="engProeprtyAddress" disabled value={oldMarOwnerAddress} />} />

                                </GridRow>
                                <GridRow>
                                    <FormLabel label={labels.occupantName[lang]} />
                                    <FormValue component={<TextInput name="occupantName" value={occupant} disabled />} />
                                    <FormLabel label={labels.OccupantAddress[lang]} />
                                    <FormValue component={<TextInput name="engProeprtyAddress" disabled value={oldMarPropertyAddress} />} />

                                </GridRow>
                                <GridRow>
                                    <FormLabel label={labels.PropertyAddress[lang]} />
                                    <FormValue component={<TextInput name="oldMarOwnerAddress" disabled value={oldMarOwnerAddress} />} />
                                    <FormLabel label={labels.RemarkForProperty[lang]} required />
                                    <FormValue component={<TextInput name="remark" required />} />
                                </GridRow>
                                <hr />
                                <FormTitle title={labels.OwnerAddressDetails[lang]} />
                                <GridRow>
                                    <FormLabel label={labels.OwnerAddress[lang]} required />
                                    <FormValue component={<TextInput name="marOwnerAddress" />} />
                                    <FormLabel label={labels.newEngownerAddress[lang]} required />
                                    <FormValue component={<TextInput name="engOwnerAddress" />} />
                                </GridRow>
                                <hr />
                                <FormTitle title={labels.OccupantAddressDetails[lang]} />
                                <GridRow>
                                    <FormLabel label={labels.OccupantAddress[lang]} required />
                                    <FormValue component={<TextInput name="marOccupantAddress" />} />
                                    <FormLabel label={labels.OccupantAddressEnglish[lang]} required />
                                    <FormValue component={<TextInput name="engOccupantAddress" />} />
                                </GridRow>
                                <hr />
                                <FormTitle title={labels.PropertyAddressDetails[lang]} />
                                <GridRow>
                                    <FormLabel label={labels.PropertyAddressMar[lang]} required />
                                    <FormValue component={<TextInput name="marPropertyAddress" />} />
                                    <FormLabel label={labels.PropertyAddressEng[lang]} required />
                                    <FormValue component={<TextInput name="engPropertyAddress" />} />
                                </GridRow>

                                <hr />
                                {/* Property Documents *}
                                <PropertyDocumentsForm />
                                <hr />
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
                        </Form> */}
                    </FormikProvider>
                </Grid>
            </Box>
        </DashBoardContainer>
    );
};
export default PropertyTraAppforadd;