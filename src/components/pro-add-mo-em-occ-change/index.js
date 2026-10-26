import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    Grid,
    Typography,
    Box,
    TextField,
    Button,
    Card,
    CardHeader,
    CardContent,
    Avatar,
    Divider,
    Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBack from "@mui/icons-material/ArrowBack";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import EditLocationAltOutlined from "@mui/icons-material/EditLocationAltOutlined";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { namChangeApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import PropertyDocumentsForm from "../sr-register/propertyDocumentsForm";
import FormButtons from "../common/buttons";
import GlossyAlert from "../common/glossyAlert/glossyAlert";
import useFormAlert from "../common/useFormAlert/useFormAlert";
import {
    checkText,
    checkName,
    checkSelect,
    checkDocuments,
    cleanInput,
} from "../common/formValidation/formValidation";

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyForUpadate,
    submitPropertyInfoChange,
    ViewProTransactionDoc
} from "../../services/assessment-services";

// Theme tokens
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

/* ------------------------------------------------------------------ */
/*  Page rules (the checks themselves live in utils/form-validation)   */
/* ------------------------------------------------------------------ */
const NAME_FIELDS = [
    "marPropertyName",
    "engPropertyName",
    "marPropertyOccupantName",
    "engPropertyOccupantName",
];

/**
 * Returns { fieldName: "message" } - empty object when everything is valid.
 * uploadMode = true  -> user uploads new documents (applicationFromId === "2")
 * uploadMode = false -> documents come from the API (existingDocsCount)
 */
const validateForm = (values, uploadMode, existingDocsCount) => {
    const errors = {};
    const set = (field, err) => {
        if (err) errors[field] = err;
    };

    set("zoneKey", checkSelect(values.zoneKey, "a zone"));
    set("gatKey", checkSelect(values.gatKey, "a gat"));
    set("remark", checkText(values.remark, "Remark", 3));
    set("marPropertyName", checkName(values.marPropertyName, "New owner name (Marathi)"));
    set("engPropertyName", checkName(values.engPropertyName, "New owner name (English)"));
    set("marPropertyOccupantName", checkName(values.marPropertyOccupantName, "New occupant name (Marathi)"));
    set("engPropertyOccupantName", checkName(values.engPropertyOccupantName, "New occupant name (English)"));
    set(
        "documents",
        uploadMode
            ? checkDocuments(values.documents)
            : existingDocsCount === 0
                ? "No document is attached to this application. At least one document is required."
                : null
    );

    return errors;
};

/* ------------------------------------------------------------------ */
/*  Small layout components                                            */
/* ------------------------------------------------------------------ */
const FieldRow = ({ label, children }) => (
    <Grid item xs={12} md={6}>
        <Box display="flex" alignItems="flex-start">
            <Box minWidth={160} pt={0.5}>
                <Typography fontWeight={600} fontSize={14} color={NAVY}>
                    {label}:
                </Typography>
            </Box>
            {children}
        </Box>
    </Grid>
);

const SectionCard = ({ icon, title, subtitle, children, footer }) => (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
        {title && (
            <>
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
            </>
        )}
        <CardContent sx={{ p: 3 }}>{children}</CardContent>
        {footer && (
            <>
                <Divider />
                <Box sx={{ p: 2, display: "flex", justifyContent: "center", bgcolor: "#FAFBFD" }}>
                    {footer}
                </Box>
            </>
        )}
    </Card>
);

function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40;
        buf[8] = (buf[8] & 0x3f) | 0x80;
        return [...buf].map((b, i) =>
            [4, 6, 8, 10].includes(i) ? "-" + b.toString(16).padStart(2, "0") : b.toString(16).padStart(2, "0")
        ).join("");
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
const PropertyTranApplication = () => {
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
    const applicationFromIdFromURL = searchParams.get("applicationFromId");

    const [propertyOwnerDetails, setPropertyOwnerDetails] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [occupant, setOccupant] = useState("");
    const [ResponseData, setResponseData] = useState([]);

    // red field errors + glossy alert state
    const { fieldErrors, alertState, showErrors, closeAlert, clearFieldError, registerRef } = useFormAlert();

    const initialState = {
        marPropertyName: "",
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

    const formik = useFormik({
        initialValues: initialState,
        enableReinitialize: false,
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

    // Set transaction type from URL
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

    // Load transaction types + zones (once)
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

    // Load gats whenever the zone changes
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

    // Fetch property only when propertyCode, zoneKey AND gatKey are all available
    useEffect(() => {
        if (!propertyCodeFromURL || !formik.values.zoneKey || !formik.values.gatKey) {
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const ownerResponse = await getPropertyForUpadate({
                    propertyCode: propertyCodeFromURL,
                    transactionTypeKey: transactionTypeIdFromURL,
                    zoneKey: formik.values.zoneKey,
                    gatKey: formik.values.gatKey,
                });

                if (ownerResponse) {
                    setPropertyOwnerDetails(ownerResponse.oldMarOwnerName || "");
                    setOccupant(ownerResponse.oldMarOccupantName || "");
                    setResponseData(ownerResponse?.documentVOs || []);
                }
            } catch (error) {
                setPropertyOwnerDetails("");
                setOccupant("");
                setResponseData([]);
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        propertyCodeFromURL,
        transactionTypeIdFromURL,
        applicationNoFromURL,
        formik.values.zoneKey,
        formik.values.gatKey,
    ]);

    // Prefill the new-name fields with the current names.
    useEffect(() => {
        if (propertyOwnerDetails || occupant) {
            formik.resetForm({
                values: {
                    ...formik.values,
                    marPropertyName: propertyOwnerDetails || formik.values.marPropertyName,
                    marPropertyOccupantName: occupant || formik.values.marPropertyOccupantName,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyOwnerDetails, occupant]);

    const documents = ResponseData;
    const uploadMode = applicationFromIdFromURL === "2";

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

    /* ---------- field change helper ---------- */
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        const kind = NAME_FIELDS.includes(name) ? "name" : "text";
        formik.setFieldValue(name, cleanInput(name, value, kind));
        clearFieldError(name);
    };

    /* ---------- submit ---------- */
    const handleSubmit = async () => {
        const values = formik.values;

        const errors = validateForm(values, uploadMode, documents.length);
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
                    newMarOwnerName: values.marPropertyName.trim(),
                    newEngOwnerName: values.engPropertyName.trim(),
                    newMarOccupantName: values.marPropertyOccupantName.trim(),
                    newEngOccupantName: values.engPropertyOccupantName.trim(),
                    remark: values.remark.trim(),
                    applicationId: applicationNoFromURL,
                    oldEngOwnerName: values.occupantName, // NOTE: not a formik field, so this is undefined
                    oldMarOwnerName: propertyOwnerDetails,
                    oldMarOccupantName: occupant,
                    documentVOs: uploadMode
                        ? values.documents
                            .filter(doc => doc.documentId && doc.documentURLbase64)
                            .map(doc => ({
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

            if (response?.responseStatus === "Success") {
                showToastSuccess("Thank you for your application. You will be redirected in 5 seconds...");
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

    // editable text field with inline error
    const renderEditable = (name) => (
        <TextField
            variant="standard"
            size="small"
            name={name}
            required
            value={formik.values[name]}
            inputRef={registerRef(name)}
            onChange={handleTextChange}
            onBlur={formik.handleBlur}
            error={Boolean(fieldErrors[name])}
            helperText={fieldErrors[name] || ""}
            sx={{ width: "100%" }}
        />
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

            <Box sx={{ p: 2 }}>
                <FormikProvider value={formik}>
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
                                    {labels?.NameCorrectionApplicationType?.[lang] || "Name Correction Application"}
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

                    <Form>
                        {/* ---------- Current details ---------- */}
                        <SectionCard
                            icon={<HomeWorkOutlined fontSize="small" />}
                            title="Current property details"
                        >
                            <Grid container spacing={3}>
                                <FieldRow label={labels.Type[lang]}>
                                    <SelectInput name="transactionTypeId" options={transactionsOptions} disabled />
                                </FieldRow>

                                <FieldRow label={labels.PropertyNumber[lang]}>
                                    <TextField fullWidth variant="standard" size="small" name="propertyCode" disabled value={propertyCodeFromURL || ""} />
                                </FieldRow>

                                <FieldRow label={labels.Zone[lang]}>
                                    <SelectInput name="zoneKey" options={zoneKeys} />
                                </FieldRow>

                                <FieldRow label={labels.Gat[lang]}>
                                    <SelectInput name="gatKey" options={gatKeys} />
                                </FieldRow>

                                <FieldRow label={labels.ownerName[lang]}>
                                    <TextField variant="standard" size="small" name="propertyOwnerName" disabled value={propertyOwnerDetails} sx={{ width: "100%" }} />
                                </FieldRow>

                                <FieldRow label={labels.occupantName[lang]}>
                                    <TextField variant="standard" size="small" name="occupantName" disabled value={occupant} sx={{ width: "100%" }} />
                                </FieldRow>

                                <FieldRow label={labels.RemarkForProperty[lang]}>
                                    {renderEditable("remark")}
                                </FieldRow>
                            </Grid>
                        </SectionCard>

                        {/* ---------- New details ---------- */}
                        <SectionCard
                            icon={<EditLocationAltOutlined fontSize="small" />}
                            title={labels?.NewDetails?.[lang] || "New details"}
                        >
                            <Grid container spacing={3}>
                                <FieldRow label={labels.PropertyNameMar[lang]}>
                                    {renderEditable("marPropertyName")}
                                </FieldRow>

                                <FieldRow label={labels.PropertyNameEng[lang]}>
                                    {renderEditable("engPropertyName")}
                                </FieldRow>

                                <FieldRow label={labels.PropertyOccupantNameMar[lang]}>
                                    {renderEditable("marPropertyOccupantName")}
                                </FieldRow>

                                <FieldRow label={labels.PropertyOccupantNameEng[lang]}>
                                    {renderEditable("engPropertyOccupantName")}
                                </FieldRow>
                            </Grid>
                        </SectionCard>

                        {/* ---------- Documents + submit ---------- */}
                        <SectionCard
                            footer={
                                <FormButtons
                                    // !formik.isValid removed so the click always reaches
                                    // handleSubmit and the alert can be shown.
                                    disabled={!formik.dirty}
                                    handleSubmitButtonClick={handleSubmit}
                                    resetForm={() => { window.location.reload(); }}
                                    submitBtnLabel="Submit"
                                    isSubmitIcon={false}
                                    cancelRedirect="/PropertyTransactionsDashBoard"
                                />
                            }
                        >
                            {uploadMode ? (
                                <Grid container spacing={3}>
                                    <Grid container item spacing={3} xs={12}>
                                        <PropertyDocumentsForm />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Table
                                    sx={{
                                        width: "100%",
                                        border: "1px solid #D5DCE6",
                                        borderRadius: 1,
                                    }}
                                    size="small"
                                >
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "#EEF2F7" }}>
                                            <TableCell sx={{ fontWeight: 600, width: "10%", color: NAVY, borderRight: "1px solid #D5DCE6" }}>Sr.</TableCell>
                                            <TableCell sx={{ fontWeight: 600, width: "60%", color: NAVY, borderRight: "1px solid #D5DCE6" }}>
                                                {labels.docs[lang]}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, width: "30%", color: NAVY }} align="center">View</TableCell>
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
                                                            color: MINT,
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {fieldErrors.documents && (
                                <Typography
                                    color="error"
                                    variant="body2"
                                    align="center"
                                    sx={{ mt: 2 }}
                                >
                                    {fieldErrors.documents}
                                </Typography>
                            )}
                        </SectionCard>
                    </Form>
                </FormikProvider>
            </Box>
        </DashBoardContainer>
    );
};
export default PropertyTranApplication;