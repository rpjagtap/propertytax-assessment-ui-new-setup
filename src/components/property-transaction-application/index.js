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
} from "@mui/material";
import { useNavigate } from 'react-router-dom';

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { transferApplicationSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import NumericTextInput from "../form-fields/numeric-text-input";

import {
    getAllProTransactions,
    getGatByZonekey,
    getZoneByProfile,
    validatePropertyCode,
    submitPropertyTransactionApplication
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";


const PropertyTranApplication = () => {
    const initialState = {
        transactionTypeId: "",
        zoneKey: "",
        gatKey: "",
        propertyCode: "",
        applicantName: "",
        applicantMobile: "",
    };

    const lang = useSelector((state) => state.userDetails.lang);
    const { setLoading, error, setError } = useApiState();
    const [allTrsactions, setAllTrsactions] = useState([]);
    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);


    const formik = useFormik({
        initialValues: initialState,
        validationSchema: transferApplicationSchema,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    const transactionsOptions = allTrsactions.map(item => ({
        id: item.id,
        label: item.marTransactionTypeName,
    }))

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
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    const handleSubmit = async () => {
        const { transactionTypeId, propertyCode, zoneKey, gatKey, applicantName, applicantMobile, applicantEmail } = formik.values;
        const body = {

            requestId: generateUUID(),
            channelName: "PropertyTax",
            propertyTransactionVO: [
                {
                    transactionTypeId,
                    propertyCode,
                    zoneKey,
                    gatKey,
                    applicantName,
                    applicantMobile,
                    applicantEmail
                }
            ]
        };
        try {
            setLoading(true);
            const res = await submitPropertyTransactionApplication(body);
            if (res?.applicationNo) {
                showToastSuccess(`Thank you for your application. Your application number is ${res.applicationNo}. You will be redirected in 5 seconds...`);
                setTimeout(() => {
                    navigate("/PropertyTransactionsDashBoard");
                }, 5000);
            } else {
                showToastError("applicationNo", "Application submission failed. Please try again.");
            }
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    const [isPropertyCodeDisabled, setIsPropertyCodeDisabled] = useState(true);
    const [isPropertyCodeValid, setIsPropertyCodeValid] = useState(false);

    useEffect(() => {
        if (formik.values.transactionTypeId !== 1) {
            setIsPropertyCodeDisabled(false);
        }
        else {
            setIsPropertyCodeDisabled(true);
        }
    }, [formik.values.transactionTypeId]);

    const handlePropertyCodeBlur = async (e) => {
        const propertyCode = e.target.value;

        if (formik.values.transactionTypeId === 1) {
            setIsPropertyCodeValid(true);
            return;
        }

        if (!propertyCode) return;

        try {
            const res = await validatePropertyCode({
                propertyCode: propertyCode,
            });
            if (res?.status?.toLowerCase().includes("zone or gat does not match")) {
                showToastError(res.status);
                formik.setFieldValue("propertyCode", "");
                setIsPropertyCodeValid(false);
            } else {
                formik.setFieldError("propertyCode", "");
                setIsPropertyCodeValid(true);
            }
        } catch (err) {
            showToastError(getErrorMsg(error));
            setIsPropertyCodeValid(false);
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
                <Box sx={{ width: "100%" }}>
                    <Paper
                        elevation={3}
                        sx={{
                            maxWidth: "1400px",
                            margin: "0 auto",
                            padding: 5,
                            borderRadius: 5,
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bolder"
                            align="center"
                            paddingBottom={2}
                            paddingTop={2}
                        >
                            {labels?.PropertyTransactionApplication?.[lang] || ""}
                        </Typography>
                        <Grid container alignItems="flex-start" justifyContent="flex-start" sx={{ width: "100%" }}>
                            <FormikProvider value={formik}>
                                <Form style={{ width: "100%" }}>
                                    <GridRow>
                                        <FormLabel label={labels.Type[lang]} required />
                                        <FormValue component={<SelectInput name="transactionTypeId" options={transactionsOptions} variant="standard" />} />
                                        <FormLabel label={labels.PropertyNumber[lang]} />
                                        <FormValue component={<TextInput name="propertyCode" disabled={isPropertyCodeDisabled} onBlur={handlePropertyCodeBlur} variant="standard" />} />
                                    </GridRow>
                                    <GridRow>
                                        <FormLabel label={labels.Zone[lang]} />
                                        <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} variant="standard" />} />
                                        <FormLabel label={labels.Gat[lang]} />
                                        <FormValue component={<SelectInput name="gatKey" options={gatKeys} variant="standard" />} />
                                    </GridRow>
                                    <GridRow>
                                        <FormLabel label={labels.applicantName[lang]} required />
                                        <FormValue component={<TextInput name="applicantName" variant="standard" />} />
                                        <FormLabel label={labels.MobileNo[lang]} required />
                                        <FormValue component={<NumericTextInput name="applicantMobile" required maxLength={10} variant="standard" />} />
                                    </GridRow>
                                    <GridRow>
                                        <FormLabel label={labels.emailId[lang]} />
                                        <FormValue component={<TextInput name="applicantEmail" variant="standard" />} />
                                    </GridRow>

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
                                                isValid={!(formik.isValid && formik.dirty) || (formik.values.transactionTypeId !== 1 && !isPropertyCodeValid)}
                                                handleSubmitButtonClick={handleSubmit}
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
                    </Paper>
                </Box>
            </Box>
        </DashBoardContainer>
    );
};
export default PropertyTranApplication;