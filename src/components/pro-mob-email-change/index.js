import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    Grid,
    Paper,
    Box,
    Typography,
    TextField,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { mobileEmailChangeApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyForUpadate,
    submitPropertyInfoChange,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import GlossyAlert from "../common/glossyAlert/glossyAlert";
import useFormAlert from "../common/useFormAlert/useFormAlert";
import {
    checkText,
    checkSelect,
    checkMobile,
    checkEmail,
    checkDocuments,
    cleanInput,
} from "../common/formValidation/formValidation";

/* ------------------------------------------------------------------ */
/*  Page rules (the checks themselves live in utils/form-validation)   */
/* ------------------------------------------------------------------ */
/** Returns { fieldName: "message" } - empty object when everything is valid. */
const validateForm = (values) => {
    const errors = {};
    const set = (field, err) => {
        if (err) errors[field] = err;
    };

    set("zoneKey", checkSelect(values.zoneKey, "a zone"));
    set("gatKey", checkSelect(values.gatKey, "a gat"));
    set("remark", checkText(values.remark, "Remark", 3));
    set("newOwnerMobile", checkMobile(values.newOwnerMobile, "New owner mobile number"));
    set("newOwnerEmail", checkEmail(values.newOwnerEmail, "New owner email"));
    set("newOccupantMobile", checkMobile(values.newOccupantMobile, "New occupant mobile number"));
    set("newOccupantEmail", checkEmail(values.newOccupantEmail, "New occupant email"));
    set("documents", checkDocuments(values.documents));

    return errors;
};

/* ------------------------------------------------------------------ */
/*  Safe UUID generator for browsers and Node                          */
/* ------------------------------------------------------------------ */
function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        // Per RFC 4122 section 4.4
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

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
const PropertyTraAppforContact = () => {
    const lang = useSelector((state) => state.userDetails.lang);
    const { setLoading, error, setError } = useApiState();
    const navigate = useNavigate();

    const [allTrsactions, setAllTrsactions] = useState([]);
    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);
    const [searchParams] = useSearchParams();
    const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
    const propertyCodeFromURL = searchParams.get("propertyCode");
    const applicationNoFromURL = searchParams.get("applicationNo");

    const [propertyOwnerDetails, setPropertyOwnerDetails] = useState([]);
    const [oldOwnerMobileNo, setMobileNo] = useState("");
    const [email, setEmail] = useState("");
    const [occupant, setOccupant] = useState("");
    const [oldMarOwnerAddress, setOldMarOwnerAddress] = useState("");
    const [oldEngOwnerAddress, setOldEngOwnerAddress] = useState("");
    const [oldOccMobile, setOldOccMobile] = useState("");
    const [oldOccEmail, setOldOccEmail] = useState("");

    // red field errors + glossy alert state
    const { fieldErrors, alertState, showErrors, closeAlert, clearFieldError, registerRef } = useFormAlert();

    const initialState = useMemo(
        () => ({
            transactionTypeId: "",
            zoneKey: zoneKeys.length === 1 ? zoneKeys[0].value : "",
            gatKey: "",
            propertyCode: propertyCodeFromURL || "",
            applicantFirstName: "",
            applicantMiddleName: "",
            applicantLastName: "",
            applicantMobile: "",
            remark: "",
            applicationId: applicationNoFromURL || "",
            newOwnerMobile: oldOwnerMobileNo,
            newOwnerEmail: "",
            newOccupantMobile: "",
            newOccupantEmail: "",
            documents: [
                {
                    documentId: "",
                    documentURLbase64: "",
                },
            ],
        }),
        [zoneKeys, propertyCodeFromURL, applicationNoFromURL, oldOwnerMobileNo]
    );

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: mobileEmailChangeApplicationSchema,
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

    useEffect(() => {
        const { zoneKey, gatKey } = formik.values;
        if (!propertyCodeFromURL || !zoneKey || !gatKey) return;

        const loadPropertyDetails = async () => {
            try {
                setLoading(true);
                const response = await getPropertyForUpadate({
                    propertyCode: propertyCodeFromURL,
                    zoneKey,
                    gatKey,
                });
                if (response) {
                    setPropertyOwnerDetails(response.oldMarOwnerName);
                    setMobileNo(response.oldOwnerMobileNo);
                    setEmail(response.oldOwnerEmail);
                    setOccupant(response.oldMarOccupantName);
                    setOldMarOwnerAddress(response.oldMarOwnerAddress);
                    setOldEngOwnerAddress(response.oldEngOwnerAddress);
                    setOldOccMobile(response.oldOccupantMobileNo);
                    setOldOccEmail(response.oldOccupantEmail);
                }
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        loadPropertyDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyCodeFromURL, formik.values.zoneKey, formik.values.gatKey]);

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

    useEffect(() => {
        if (oldOwnerMobileNo || email || oldOccMobile || oldOccEmail) {
            formik.setValues((prev) => ({
                ...prev,
                newOwnerMobile: oldOwnerMobileNo || prev.newOwnerMobile,
                newOwnerEmail: email || prev.newOwnerEmail,
                newOccupantMobile: oldOccMobile || prev.newOccupantMobile,
                newOccupantEmail: oldOccEmail || prev.newOccupantEmail,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oldOwnerMobileNo, email, oldOccMobile, oldOccEmail]);

    /* ---------- field change helpers ---------- */
    // Mobile: digits only, max 10
    const handleMobileChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, cleanInput(name, value, "mobile"));
        clearFieldError(name);
    };

    // Text / email: email has no spaces, other text has no leading space
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        const kind = name.toLowerCase().includes("email") ? "email" : "text";
        formik.setFieldValue(name, cleanInput(name, value, kind));
        clearFieldError(name);
    };

    /* ---------- submit ---------- */
    const handleSubmit = async () => {
        const values = formik.values;

        const errors = validateForm(values);
        if (showErrors(errors)) return; // opens the alert and stops

        const body = {
            requestId: generateUUID(),
            channelName: "PropertyTax",
            propertyUpdateVOs: [
                {
                    transactionTypeKey: values.transactionTypeId,
                    propertyCode: propertyCodeFromURL,
                    zoneKey: values.zoneKey,
                    gatKey: values.gatKey,
                    remark: values.remark.trim(),
                    applicationId: applicationNoFromURL,
                    oldMarOwnerAddress: oldMarOwnerAddress,
                    oldEngOwnerAddress: oldEngOwnerAddress,
                    oldOwnerMobileNo: oldOwnerMobileNo,
                    oldOwnerEmail: email,
                    oldMarOwnerName: propertyOwnerDetails,
                    oldMarOccupantName: occupant,
                    oldEngOwnerName: values.occupantName,
                    newOwnerMobileNo: values.newOwnerMobile.trim(),
                    newOwnerEmail: values.newOwnerEmail.trim(),
                    newOccupantMobileNo: values.newOccupantMobile.trim(),
                    newOccupantEmail: values.newOccupantEmail.trim(),
                    documentVOs: values.documents
                        .filter((doc) => doc.documentId && doc.documentURLbase64)
                        .map((doc) => ({
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
                showToastSuccess(
                    `Thank you for your application. You will be redirected in 5 seconds...`
                );
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

    const paperSx = {
        width: "90%",
        padding: 5,
        marginLeft: "1.5%",
        borderRadius: 5,
    };

    const sectionTitleProps = {
        variant: "h5",
        fontWeight: "bolder",
        align: "center",
        paddingBottom: 2,
        paddingTop: 2,
    };

    // disabled "old value" row
    const renderReadOnlyField = (label, name, value, multiline = false) => (
        <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
                <Box minWidth={140}>
                    <Typography fontWeight="bold">{label}:</Typography>
                </Box>
                <TextField
                    fullWidth={false}
                    variant="standard"
                    size="small"
                    multiline={multiline}
                    name={name}
                    disabled
                    value={value}
                    sx={{ width: "100%" }}
                />
            </Box>
        </Grid>
    );

    // editable "new value" row; type = "mobile" | "email"
    const renderNewField = (label, name, type) => (
        <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="flex-start">
                <Box minWidth={140} pt={0.5}>
                    <Typography fontWeight="bold">{label}:</Typography>
                </Box>
                <TextField
                    fullWidth={false}
                    variant="standard"
                    size="small"
                    name={name}
                    required
                    value={formik.values[name] || ""}
                    inputRef={registerRef(name)}
                    onChange={type === "mobile" ? handleMobileChange : handleTextChange}
                    onBlur={formik.handleBlur}
                    inputProps={
                        type === "mobile"
                            ? { inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }
                            : { inputMode: "email" }
                    }
                    error={Boolean(fieldErrors[name])}
                    helperText={fieldErrors[name] || ""}
                    sx={{ width: "100%" }}
                />
            </Box>
        </Grid>
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

            {/* Glossy validation alert */}
            <GlossyAlert
                open={alertState.open}
                title="Please complete the form"
                messages={alertState.messages}
                buttonText="Got it"
                onClose={closeAlert}
            />

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
                <Grid>
                    <FormikProvider value={formik}>
                        <Typography {...sectionTitleProps}>
                            {labels?.MobileEmailChangeApplicationType?.[lang] || ""}
                        </Typography>
                        <Form>
                            {/* ------------ Old details ------------ */}
                            <Box>
                                <Paper elevation={3} sx={paperSx}>
                                    <Grid container spacing={3}>
                                        <Grid container item spacing={3} xs={12}>
                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.Type[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <SelectInput
                                                        name="transactionTypeId"
                                                        options={transactionsOptions}
                                                        disabled
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box display="flex" alignItems="center">
                                                    <Box minWidth={140}>
                                                        <Typography fontWeight="bold">
                                                            {labels.PropertyNumber[lang]}:
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        variant="standard"
                                                        size="small"
                                                        name="propertyCode"
                                                        disabled
                                                        value={propertyCodeFromURL || ""}
                                                    />
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
                                            {renderReadOnlyField(
                                                labels.ownerName[lang],
                                                "propertyOwnerName",
                                                propertyOwnerDetails
                                            )}
                                            {renderReadOnlyField(
                                                labels.PropertyAddress[lang],
                                                "propertyAddress",
                                                oldMarOwnerAddress,
                                                true
                                            )}
                                        </Grid>

                                        <Grid container item spacing={3} xs={12}>
                                            {renderReadOnlyField(
                                                labels.occupantName[lang],
                                                "occupantName",
                                                occupant
                                            )}
                                        </Grid>

                                        <Grid container item spacing={3} xs={12}>
                                            {renderReadOnlyField(
                                                labels.OwnerMobilNo[lang],
                                                "mobileNo",
                                                oldOwnerMobileNo
                                            )}
                                            {renderReadOnlyField(
                                                labels.OwnerEmail[lang],
                                                "email",
                                                email,
                                                true
                                            )}
                                        </Grid>

                                        <Grid container item spacing={3} xs={12}>
                                            {renderReadOnlyField(
                                                labels.OccMobileNo[lang],
                                                "occMobileNo",
                                                oldOccMobile
                                            )}
                                            {renderReadOnlyField(
                                                labels.OccupantEmail[lang],
                                                "occEmail",
                                                oldOccEmail,
                                                true
                                            )}
                                        </Grid>

                                        {/* Remark */}
                                        <Grid item xs={12}>
                                            <Box display="flex" alignItems="flex-start">
                                                <Box minWidth={140} pt={0.5}>
                                                    <Typography fontWeight="bold">
                                                        {labels.RemarkForProperty[lang]}:
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth={false}
                                                    variant="standard"
                                                    size="small"
                                                    name="remark"
                                                    required
                                                    inputRef={registerRef("remark")}
                                                    value={formik.values.remark}
                                                    onChange={handleTextChange}
                                                    onBlur={formik.handleBlur}
                                                    error={Boolean(fieldErrors.remark)}
                                                    helperText={fieldErrors.remark || ""}
                                                    sx={{ width: "35.5%" }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            {/* ------------ New details ------------ */}
                            <Typography {...sectionTitleProps}>
                                {labels?.NewDetails?.[lang] || ""}
                            </Typography>

                            <Box>
                                <Paper elevation={3} sx={paperSx}>
                                    <Grid container spacing={3}>
                                        <Grid container item spacing={3} xs={12}>
                                            {renderNewField(
                                                labels.newOwnerMobilNo[lang],
                                                "newOwnerMobile",
                                                "mobile"
                                            )}
                                            {renderNewField(
                                                labels.newOwnerEmallId[lang],
                                                "newOwnerEmail",
                                                "email"
                                            )}
                                            {renderNewField(
                                                labels.newOccupantMobileNo[lang],
                                                "newOccupantMobile",
                                                "mobile"
                                            )}
                                            {renderNewField(
                                                labels.newOccupantEmailId[lang],
                                                "newOccupantEmail",
                                                "email"
                                            )}
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            {/* ------------ Documents ------------ */}
                            <Typography {...sectionTitleProps}>
                                {labels?.DocumentDetails?.[lang] || ""}
                            </Typography>
                            <Box>
                                <Paper elevation={3} sx={paperSx}>
                                    <Grid container spacing={3}>
                                        <PropertyDocumentsForm />
                                    </Grid>

                                    {fieldErrors.documents && (
                                        <Typography
                                            color="error"
                                            variant="body2"
                                            align="center"
                                            sx={{ mt: 1 }}
                                        >
                                            {fieldErrors.documents}
                                        </Typography>
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
                                                // !formik.isValid removed so the click always reaches
                                                // handleSubmit and the alert can be shown.
                                                disabled={!formik.dirty}
                                                handleSubmitButtonClick={handleSubmit}
                                                resetForm={() => {
                                                    window.location.reload();
                                                }}
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

export default PropertyTraAppforContact;