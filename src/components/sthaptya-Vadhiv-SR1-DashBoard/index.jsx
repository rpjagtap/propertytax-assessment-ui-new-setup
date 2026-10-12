import React, { useMemo, useState, useEffect } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    CircularProgress,
    Grid,
    Paper,
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Backdrop,
    LinearProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";

import {
    getSthapatyaSurveyDashboardSR1,
    getZoneByProfile,
    getGatByZonekey,
    submitSthapathyaVadhivPropertySR1,
} from "../../services/assessment-services";

// Dropdown option helper (adjust if your list items use different keys)
const optLabel = (o) => o?.label ?? o?.name ?? String(o?.value ?? "");

// Sum helper for string numbers like "35.38"
const sumField = (list, field) =>
    (list || []).reduce((acc, d) => acc + (parseFloat(d?.[field]) || 0), 0);

const SthaptyaVadhivSR1DashBoard = () => {
    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError } = useApiState();

    const [zoneList, setZoneList] = useState([]);
    const [gatList, setGatList] = useState([]);
    const [records, setRecords] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null); // applicationId
    const [searchText, setSearchText] = useState("");

    const [detailsDialog, setDetailsDialog] = useState({ open: false, record: null });
    const [rejectDialog, setRejectDialog] = useState({
        open: false,
        record: null,
        remark: "",
        remarkError: "",
    });

    // ---- Loader messages ----
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingMessages = ["Submitting record...", "Verifying property data...", "Almost done..."];

    useEffect(() => {
        if (!actionLoadingId) {
            setLoadingStep(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionLoadingId]);

    // ---- Filters (zoneName / gatName go to the API) ----
    const formik = useFormik({
        initialValues: { zoneName: "", gatName: "" },
        onSubmit: () => { },
    });

    // Load zones and select the first one by default
    useEffect(() => {
        const loadZones = async () => {
            try {
                setLoading(true);
                const res = await getZoneByProfile();
                const list = res?.zoneLst || [];
                setZoneList(list);
                if (list.length > 0) {
                    formik.setFieldValue("zoneName", optLabel(list[0])); // default first zone
                }
            } catch (err) {
                showToastError(getErrorMsg(err));
            } finally {
                setLoading(false);
            }
        };
        loadZones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load gats when zone changes and select the first one by default
    useEffect(() => {
        formik.setFieldValue("gatName", "");
        setGatList([]);
        setRecords([]);
        setHasSearched(false);

        const zone = zoneList.find((z) => optLabel(z) === formik.values.zoneName);
        if (!zone) return;

        const loadGats = async () => {
            try {
                setLoading(true);
                const res = await getGatByZonekey({ zoneKey: zone.value });
                const list = res?.gatLst || [];
                setGatList(list);
                if (list.length > 0) {
                    formik.setFieldValue("gatName", optLabel(list[0])); // default first gat
                }
            } catch (err) {
                showToastError(getErrorMsg(err));
            } finally {
                setLoading(false);
            }
        };
        loadGats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.zoneName]);

    // Clear old records when the gat changes
    useEffect(() => {
        setRecords([]);
        setHasSearched(false);
    }, [formik.values.gatName]);

    // ---- Load dashboard data (only on "Show Record" click) ----
    const loadDashboard = async () => {
        const { zoneName, gatName } = formik.values;
        if (!zoneName || !gatName) {
            showToastError(labels?.SelectZoneGat?.[lang] || "Please select Zone and Gat");
            return;
        }
        try {
            setTableLoading(true);
            const res = await getSthapatyaSurveyDashboardSR1({ zoneName, gatName });
            setRecords(res?.propertyTransactionVO || res?.data?.propertyTransactionVO || []);
            setHasSearched(true);
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setTableLoading(false);
        }
    };

    // propertyCode is duplicated in the response, so applicationId is the row id
    const rows = useMemo(
        () =>
            (records || []).map((r) => ({
                ...r,
                id: r.applicationId,
                totalArea: sumField(r.propertyTransactionDetailsVO, "area"),
                totalRV: sumField(r.propertyTransactionDetailsVO, "rateableValue"),
            })),
        [records]
    );

    // ---- Details dialog ----
    const openDetailsDialog = (record) => setDetailsDialog({ open: true, record });
    const closeDetailsDialog = () => setDetailsDialog({ open: false, record: null });

    // ---- Accept / Submit ----
    const handleSubmitRecord = async (record) => {
        try {
            setActionLoadingId(record.applicationId);
            await submitSthapathyaVadhivPropertySR1({
                applicationId: record.applicationId,
                status: "Accept",
            });
            showToastSuccess(labels?.RecordSavedSuccessfully?.[lang] || "Record saved successfully");
            setRecords((prev) => prev.filter((r) => r.applicationId !== record.applicationId));
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setActionLoadingId(null);
        }
    };

    // ---- Reject ----
    const openRejectDialog = (record) =>
        setRejectDialog({ open: true, record, remark: "", remarkError: "" });

    const closeRejectDialog = () =>
        setRejectDialog({ open: false, record: null, remark: "", remarkError: "" });

    const handleConfirmReject = async () => {
        if (!rejectDialog.remark || !rejectDialog.remark.trim()) {
            setRejectDialog((prev) => ({
                ...prev,
                remarkError: labels?.RemarkRequired?.[lang] || "Remark is required to reject",
            }));
            return;
        }
        const { record, remark } = rejectDialog;
        try {
            setActionLoadingId(record.applicationId);
            await submitSthapathyaVadhivPropertySR1({
                applicationId: record.applicationId,
                status: "Reject",
                remark,
            });
            showToastSuccess(labels?.RecordRejectedSuccessfully?.[lang] || "Record rejected successfully");
            setRecords((prev) => prev.filter((r) => r.applicationId !== record.applicationId));
            closeRejectDialog();
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setActionLoadingId(null);
        }
    };

    // ---- Columns ----
    const columns = useMemo(
        () => [
            {
                field: "srNo",
                headerName: labels?.SrNo?.[lang] || "Sr No",
                align: "center",
                headerAlign: "center",
                width: 80,
                sortable: false,
                filterable: false,
                renderCell: (params) =>
                    params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
            },
            {
                field: "applicationId",
                headerName: labels?.ApplicationId?.[lang] || "Application Id",
                width: 170,
            },
            {
                field: "propertyName",
                headerName: labels?.PropertyName?.[lang] || "Property Name",
                flex: 1,
                minWidth: 170,
            },
            {
                field: "propertyOccupantName",
                headerName: labels?.occupantName?.[lang] || "Property Occupant Name",
                flex: 1,
                minWidth: 170,
            },
            {
                field: "propertyMobileNo",
                headerName: labels?.MobileNo?.[lang] || "Mobile No",
                width: 130,
            },
            {
                field: "propertyAddress",
                headerName: labels?.propertyAddress?.[lang] || "Address",
                flex: 1.5,
                minWidth: 250,
            },
            {
                field: "description",
                headerName: labels?.description?.[lang] || "Description",
                width: 110,
            },
            {
                field: "sr1Date",
                headerName: labels?.Sr1Date?.[lang] || "SR1 Date",
                width: 120,
            },
            {
                field: "totalArea",
                headerName: labels?.totalAreaSqmt?.[lang] || "Total Area (sqmt)",
                width: 150,
                type: "number",
                valueFormatter: (value) =>
                    value != null ? Number(value).toFixed(2) : "",
            },
            {
                field: "totalRV",
                headerName: labels?.ratableValueSum?.[lang] || "Total Ratable Value",
                width: 160,
                type: "number",
                valueFormatter: (value) =>
                    value != null ? `₹${Number(value).toFixed(2)}` : "",
            },
            {
                field: "propertyDetails",
                headerName: labels?.PropertyDetails?.[lang] || "Property Details",
                width: 140,
                sortable: false,
                filterable: false,
                align: "center",
                headerAlign: "center",
                renderCell: (params) => (
                    <Button size="small" variant="outlined" onClick={() => openDetailsDialog(params.row)}>
                        View
                    </Button>
                ),
            },
            {
                field: "action",
                headerName: labels?.Action?.[lang] || "Action",
                width: 200,
                sortable: false,
                filterable: false,
                align: "center",
                headerAlign: "center",
                renderCell: (params) => {
                    const isBusy = actionLoadingId === params.row.applicationId;
                    return (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={isBusy}
                                onClick={() => handleSubmitRecord(params.row)}
                            >
                                {isBusy
                                    ? labels?.Submitting?.[lang] || "Submitting..."
                                    : labels?.Submit?.[lang] || "Submit"}
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                disabled={isBusy}
                                onClick={() => openRejectDialog(params.row)}
                            >
                                {labels?.Reject?.[lang] || "Reject"}
                            </Button>
                        </Box>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lang, actionLoadingId]
    );

    const detailRows = detailsDialog.record?.propertyTransactionDetailsVO || [];

    return (
        <DashBoardContainer>
            {error && <AlertMsg message={error} severity="error" onClose={() => setError("")} />}

            <ScrollBottom />
            <ScrollTop />

            <Grid>
                <Paper sx={{ p: 2 }}>
                    <Typography
                        variant="h5"
                        fontWeight="bolder"
                        align="center"
                        paddingBottom={2}
                        paddingTop={2}
                        sx={{
                            animation: "expandLetters 0.9s ease-out",
                            "@keyframes expandLetters": {
                                "0%": { opacity: 0, letterSpacing: "-3px" },
                                "100%": { opacity: 1, letterSpacing: "normal" },
                            },
                        }}
                    >
                        {labels?.SthapatyaVadhivPropertyDashboard?.[lang] ||
                            "Sthapatya vadhiv Property Dashboard"}
                    </Typography>

                    {/* ---- Filters ---- */}
                    <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
                        <TextField
                            select
                            size="small"
                            sx={{ minWidth: 200 }}
                            label={labels?.Zone?.[lang] || "Zone"}
                            name="zoneName"
                            value={formik.values.zoneName}
                            onChange={formik.handleChange}
                            disabled={loading}
                        >
                            {zoneList.map((z) => (
                                <MenuItem key={z.value} value={optLabel(z)}>
                                    {optLabel(z)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            sx={{ minWidth: 200 }}
                            label={labels?.Gat?.[lang] || "Gat"}
                            name="gatName"
                            value={formik.values.gatName}
                            onChange={formik.handleChange}
                            disabled={loading || !formik.values.zoneName}
                        >
                            {gatList.map((g) => (
                                <MenuItem key={g.value} value={optLabel(g)}>
                                    {optLabel(g)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="contained"
                            onClick={loadDashboard}
                            disabled={
                                tableLoading ||
                                loading ||
                                !formik.values.zoneName ||
                                !formik.values.gatName
                            }
                        >
                            {labels?.ShowRecord?.[lang] || "Show Record"}
                        </Button>

                        <Box flexGrow={1} />

                        <TextField
                            size="small"
                            label="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Box>

                    {/* ---- Grid ---- */}
                    <div style={{ width: "100%" }}>
                        <DataGrid
                            autoHeight
                            rows={rows}
                            columns={columns}
                            loading={tableLoading}
                            getRowId={(row) => row.applicationId}
                            initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
                            pageSizeOptions={[5, 10, 20, 50, 100]}
                            filterModel={{
                                items: [],
                                quickFilterValues: searchText ? searchText.split(" ") : [],
                            }}
                            disableRowSelectionOnClick
                            sx={{
                                "& .MuiDataGrid-columnHeader": { bgcolor: "#e3e0ab" },
                                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
                                border: 1,
                                borderColor: "grey.300",
                            }}
                            localeText={{
                                noRowsLabel: hasSearched
                                    ? labels?.NoRecordFound?.[lang] || "No records found"
                                    : labels?.ClickShowRecord?.[lang] ||
                                      "Select Zone and Gat, then click Show Record",
                            }}
                        />
                    </div>
                </Paper>
            </Grid>

            {/* ---- Property details dialog ---- */}
            <Dialog
                open={detailsDialog.open}
                onClose={closeDetailsDialog}
                fullWidth
                maxWidth={false}
                PaperProps={{ sx: { width: "90vw", maxWidth: "90vw" } }}
            >
                <DialogTitle>
                    {labels?.PropertyDetails?.[lang] || "Property Details"}
                    {detailsDialog.record?.propertyName
                        ? ` — ${detailsDialog.record.propertyName.trim()}`
                        : ""}
                </DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    "& th": {
                                        border: "1px solid grey",
                                        bgcolor: "#abd9e3",
                                        fontWeight: 600,
                                        padding: "8px",
                                    },
                                }}
                            >
                                <TableCell align="center">Use Type</TableCell>
                                <TableCell align="center">Sub Use Type</TableCell>
                                <TableCell align="center">Construction Type</TableCell>
                                <TableCell align="center">Assessment Date</TableCell>
                                <TableCell align="center">Area</TableCell>
                                <TableCell align="center">Rate</TableCell>
                                <TableCell align="center">RV</TableCell>
                                <TableCell align="center">Permission</TableCell>
                                <TableCell align="center">Toilet</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detailRows.map((d, di) => (
                                <TableRow key={di}>
                                    <TableCell align="center">{d.useType}</TableCell>
                                    <TableCell align="center">{d.subUseType}</TableCell>
                                    <TableCell align="center">{d.constructionType}</TableCell>
                                    <TableCell align="center">{d.assessmentDate}</TableCell>
                                    <TableCell align="center">{d.area}</TableCell>
                                    <TableCell align="center">{d.rate}</TableCell>
                                    <TableCell align="center">{d.rateableValue}</TableCell>
                                    <TableCell align="center">{d.permission === "Y" ? "Yes" : "No"}</TableCell>
                                    <TableCell align="center">{d.toiletFlag === "Y" ? "Yes" : "No"}</TableCell>
                                </TableRow>
                            ))}
                            {detailRows.length > 0 && (
                                <TableRow sx={{ "& td": { fontWeight: 700, bgcolor: "#f5f5f5" } }}>
                                    <TableCell align="right" colSpan={4}>Total</TableCell>
                                    <TableCell align="center">{sumField(detailRows, "area").toFixed(2)}</TableCell>
                                    <TableCell />
                                    <TableCell align="center">{sumField(detailRows, "rateableValue").toFixed(2)}</TableCell>
                                    <TableCell colSpan={2} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDetailsDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ---- Reject remark dialog ---- */}
            <Dialog open={rejectDialog.open} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{labels?.RejectRemarkTitle?.[lang] || "Reject Record"}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {labels?.RejectRemarkPrompt?.[lang] ||
                            `Please provide a remark for rejecting application no. ${rejectDialog.record?.applicationId || ""}.`}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label={labels?.Remark?.[lang] || "Remark"}
                        value={rejectDialog.remark}
                        onChange={(e) =>
                            setRejectDialog((prev) => ({
                                ...prev,
                                remark: e.target.value,
                                remarkError: "",
                            }))
                        }
                        error={Boolean(rejectDialog.remarkError)}
                        helperText={rejectDialog.remarkError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRejectDialog}>{labels?.Cancel?.[lang] || "Cancel"}</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmReject}
                        disabled={actionLoadingId === rejectDialog.record?.applicationId}
                    >
                        {labels?.Reject?.[lang] || "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---- Loader Backdrop ---- */}
            <Backdrop
                open={Boolean(actionLoadingId)}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 999,
                    flexDirection: "column",
                    gap: 2,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                }}
            >
                <CircularProgress color="inherit" size={60} thickness={4} />
                <Typography variant="h6">{loadingMessages[loadingStep]}</Typography>
                <Box sx={{ width: 250 }}>
                    <LinearProgress color="inherit" />
                </Box>
            </Backdrop>
        </DashBoardContainer>
    );
};

export default React.memo(SthaptyaVadhivSR1DashBoard);