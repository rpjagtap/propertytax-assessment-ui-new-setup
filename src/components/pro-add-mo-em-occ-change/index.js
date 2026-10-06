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
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
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

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    getPropertyForUpadate,
    submitPropertyInfoChange,
    ViewProTransactionDoc
} from "../../services/assessment-services";

// Theme tokens — same values used across the Property Transaction module.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

// A single "label: value/input" row.
const FieldRow = ({ label, children }) => (
    <Grid item xs={12} md={6}>
        <Box display="flex" alignItems="center">
            <Box minWidth={160}>
                <Typography fontWeight={600} fontSize={14} color={NAVY}>
                    {label}:
                </Typography>
            </Box>
            {children}
        </Box>
    </Grid>
);

// Section wrapper — icon-badged header + divider + padded body (+ optional footer).
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
                <Box sx={{ p: 2, display: "flex", justifyContent: "center", bgcolor: "#FAFBFD" }}>
                    {footer}
                </Box>
            </>
        )}
    </Card>
);


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
                                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                                    Review the current property details and submit the corrected owner and occupant names.
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
                            subtitle="Existing owner and occupant information on record"
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
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        name="remark"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        sx={{ width: "100%" }}
                                    />
                                </FieldRow>
                            </Grid>
                        </SectionCard>

                        {/* ---------- New details ---------- */}
                        <SectionCard
                            icon={<EditLocationAltOutlined fontSize="small" />}
                            title={labels?.NewDetails?.[lang] || "New details"}
                            subtitle="Enter the corrected owner and occupant names in both languages"
                        >
                            <Grid container spacing={3}>
                                <FieldRow label={labels.PropertyNameMar[lang]}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        name="marPropertyName"
                                        required
                                        sx={{ width: "100%" }}
                                        value={formik.values.marPropertyName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </FieldRow>

                                <FieldRow label={labels.PropertyNameEng[lang]}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        name="engPropertyName"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        sx={{ width: "100%" }}
                                    />
                                </FieldRow>

                                <FieldRow label={labels.PropertyOccupantNameMar[lang]}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        name="marPropertyOccupantName"
                                        required
                                        sx={{ width: "100%" }}
                                        value={formik.values.marPropertyOccupantName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </FieldRow>

                                <FieldRow label={labels.PropertyOccupantNameEng[lang]}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        name="engPropertyOccupantName"
                                        required
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        sx={{ width: "100%" }}
                                    />
                                </FieldRow>
                            </Grid>
                        </SectionCard>

                        {/* ---------- Documents + submit ---------- */}
                        <SectionCard
                            icon={<DescriptionOutlined fontSize="small" />}
                            title={labels?.DocumentDetails?.[lang] || "Document details"}
                            subtitle="Supporting documents for this name correction request"
                            footer={
                                <FormButtons
                                    disabled={!formik.isValid || !formik.dirty}
                                    handleSubmitButtonClick={handleSubmit}
                                    resetForm={() => { window.location.reload(); }}
                                    submitBtnLabel="Submit"
                                    isSubmitIcon={false}
                                    cancelRedirect="/PropertyTransactionsDashBoard"
                                />
                            }
                        >
                            {applicationFromIdFromURL === '2' ? (
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
                        </SectionCard>
                    </Form>
                </FormikProvider>
            </Box>
        </DashBoardContainer>
    );
};
export default PropertyTranApplication;
