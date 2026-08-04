import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    CircularProgress,
    Grid,
    Link,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
} from "@mui/material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { propertyTransactionDashboardSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { RenderTableHead } from "../common/table";
import DateInput from "../form-fields/date-picker";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import {
    getAllProTransactions,
    getAllStages,
    getGatByZonekey,
    getStagewiseApplicationsRpt,
    getTransactionDashboard,
    getZoneByProfile,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import { useNavigate } from "react-router-dom";

const PropertyTransactionDashboard = () => {
    const initialState = {
        fromDate: getCurrentDate(),
        toDate: getCurrentDate(),
        transactionTypeKey: "",
        zoneKey: "",
        gatKey: "",
    };

    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError } = useApiState();
    const [stages, setStages] = useState([]);
    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);
    const [isShowTrackAppTable, setTrackAppTable] = useState(false);
    const [pendingAppCountData, setPendingAppCountData] = useState([]);
    const [pendingAppsData, setPendingAppsData] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20); // Default rows per page
    const [allTrsactions, setAllTrsactions] = useState([]);
    const navigate = useNavigate();

    // Calculate the slice range for current page
    const paginatedData = useMemo(() => {
        if (!pendingAppCountData || pendingAppCountData.length === 0) return [];
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return pendingAppCountData.slice(startIndex, endIndex);
    }, [pendingAppCountData, page, rowsPerPage]);


    const handleChangePage = useCallback((event, newPage) => {
        setTableLoading(true);
        setPage(newPage);

        setTimeout(() => {
            setTableLoading(false);
        }, 0);
    }, []);

    const handleRowsPerPageChange = useCallback((event) => {
        const value = parseInt(event.target.value, 10);
        setTableLoading(true);
        setRowsPerPage(value);
        setPage(1); // Reset to first page

        setTimeout(() => {
            setTableLoading(false);
        }, 0);
    }, []);

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: propertyTransactionDashboardSchema,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    useEffect(() => {
        setPendingAppsData("");
        setPendingAppCountData("");
    }, [formik.values.formStatus]);

    const resetData = () => {
        setTrackAppTable(false);
        setPendingAppsData("");
        setPendingAppCountData("");
        handleSubmit();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [allProTransactionsRes, statesRes, zonesRes] = await Promise.all([getAllProTransactions(), getAllStages(), getZoneByProfile()]);
                setStages(statesRes);
                setZoneKeys(zonesRes.zoneLst);
                setAllTrsactions(allProTransactionsRes);
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
    }, [formik.values.zoneKey]);

    const handleSubmit = async () => {
        const { formStatus, zoneKey, gatKey, fromDate, toDate, transactionTypeKey } = formik.values;
        const body = {
            formStatus,
            zoneKey,
            gatKey,
            fromDate,
            toDate,
            transactionTypeKey,
        };
        try {
            setLoading(true);
            const res = await getTransactionDashboard(body);
            setPendingAppCountData(res?.propertyTransactionVO);
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCountClick = (applicationId, propertyCode, transactionTypeId, applicationFromId) => {
        const queryParams = `applicationNo=${encodeURIComponent(applicationId)}&transactionTypeId=${encodeURIComponent(transactionTypeId)}&propertyCode=${encodeURIComponent(propertyCode)}&applicationFromId=${encodeURIComponent(applicationFromId)}`;
        const id = String(transactionTypeId); // normalize to string
        if (["1"].includes(id)) {
            navigate(`/submitApplication?${queryParams}`);
        }
        else if (["2"].includes(id)) {
            navigate(`/AdditionalConstructedProperty?${queryParams}`);
        }
        else if (["11"].includes(id)) {
            navigate(`/PropertyUseTypeChange?${queryParams}`);
        }
        else if (["9"].includes(id)) {
            navigate(`/PropertyAddressChange?${queryParams}`);
        }
        else if (["8"].includes(id)) {
            navigate(`/PropertyInfoChange?${queryParams}`);
        }
        else if (["14"].includes(id)) {
            navigate(`/PropertyContactChange?${queryParams}`);
        }
    };

    const transactionsOptions = allTrsactions.map(item => ({
        id: item.id,
        label: item.marTransactionTypeName,
    }))

    const handleBackClick = () => {
        setTrackAppTable(false);
        setPendingAppsData("");
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
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress sx={{ marginTop: "65px" }} />
                </div>
            ) : (
                <>
                    <ScrollBottom />
                    <ScrollTop />

                    <Grid>
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
                                        {labels?.PropertyTransactionDashboard?.[lang] || ""}
                                    </Typography>
                                    <FormikProvider value={formik}>
                                        <Form>
                                            <GridRow>
                                                <FormLabel label={labels.Type[lang]} required />
                                                <FormValue component={<SelectInput name="transactionTypeKey" options={transactionsOptions} variant="standard" />} />
                                            </GridRow>
                                            <GridRow>
                                                <FormLabel label={labels.Zone[lang]} />
                                                <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} variant="standard" />} />
                                                <FormLabel label={labels.Gat[lang]} />
                                                <FormValue component={<SelectInput name="gatKey" options={gatKeys} variant="standard" />} />
                                            </GridRow>
                                            <GridRow>
                                                <FormLabel label={labels.FromDate[lang]} required />
                                                <FormValue component={<DateInput name="fromDate" required variant="standard" />} />
                                                <FormLabel label={labels.ToDate[lang]} required />
                                                <FormValue component={<DateInput name="toDate" required variant="standard" />} />
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
                                                        isValid={!(formik.isValid && formik.dirty)}
                                                        handleSubmitButtonClick={handleSubmit}
                                                        resetForm={() => {
                                                            window.location.reload();
                                                        }}
                                                        submitBtnLabel="Show"
                                                        isSubmitIcon={false}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate("/PropertyTransactions")}
                                                        style={{
                                                            marginLeft: "10px", // or use MUI spacing
                                                            padding: "8px",
                                                            background: "#d2b019ff",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            marginTop: "10px",
                                                            width: "75%",
                                                        }}
                                                    >
                                                        {labels.NewApplication[lang]}
                                                    </button>
                                                </Grid>
                                            </Grid>

                                        </Form>
                                    </FormikProvider>
                                </Paper>
                            </Box>
                        </Box>

                        {pendingAppCountData && (
                            <Paper>
                                <Grid>
                                    {/* Pagination Component */}
                                    {pendingAppCountData.length > rowsPerPage && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: "10px",
                                            }}
                                        >
                                            {/* Rows Per Page Dropdown */}
                                            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
                                                {[5, 10, 20, 50, 100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num} Rows
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <Pagination
                                                count={Math.ceil(pendingAppCountData.length / rowsPerPage)}
                                                page={page}
                                                onChange={handleChangePage}
                                                sx={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
                                            />
                                        </div>
                                    )}
                                    <TableContainer component={Paper}>
                                        <Table
                                            sx={{
                                                minWidth: 650,
                                                border: 1,
                                                borderColor: "grey.300",
                                            }}
                                            size="small"
                                            aria-label="a dense table"
                                        >
                                            <RenderTableHead
                                                thSx={{
                                                    bgcolor: "#abd9e3",
                                                    fontWeight: 600,
                                                }}
                                                trSx={{
                                                    "& th": {
                                                        border: "1px solid grey",
                                                        padding: 0,
                                                        margin: 0,
                                                    },
                                                }}
                                                cells={[
                                                    labels.SrNo[lang],
                                                    labels.TransactionType[lang],
                                                    labels.applicationNo[lang],
                                                    labels.propertyCode[lang],
                                                    labels.applicantName[lang],
                                                    labels.mobileNo[lang],
                                                ]}
                                            />
                                            {tableLoading ? (
                                                <>Please wait loading data...</>
                                            ) : (
                                                <TableBody>
                                                    {paginatedData.length ? (
                                                        paginatedData.map((item, index) => {
                                                            return (
                                                                <TableRow
                                                                    key={1}
                                                                    sx={{
                                                                        "& td": {
                                                                            border: "1px solid grey",
                                                                        },
                                                                        padding: 0,
                                                                        margin: 0,
                                                                    }}
                                                                >
                                                                    {" "}
                                                                    <TableCell align="center">
                                                                        {rowsPerPage * page - rowsPerPage + index + 1}
                                                                    </TableCell>
                                                                    <TableCell align="center">{item.transactionType}</TableCell>
                                                                    <TableCell align="center">
                                                                        <Link onClick={() => handleCountClick(item.applicationId, item.propertyCode, item.transactionTypeId, item.applicationFromId)} component="button">{item.applicationId}</Link>
                                                                    </TableCell>
                                                                    <TableCell align="center">{item.propertyCode}</TableCell>
                                                                    <TableCell align="center">{item.applicantName}</TableCell>
                                                                    <TableCell align="center">{item.applicantMobile}</TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    ) : (
                                                        <>{labels.NoRecordFound[lang]}</>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Paper>
                        )}
                    </Grid>

                </>
            )}
        </DashBoardContainer>
    );
};

export default React.memo(PropertyTransactionDashboard);
