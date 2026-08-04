import React, { useMemo, useState, useEffect } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
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
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { Backdrop, LinearProgress } from "@mui/material";

import {
    getSthapatyaSurveyDashboard,
    getZoneByProfile,
    getGatByZonekey,
    submitSthapathyaVadhivProperty,
} from "../../services/assessment-services";

import { sthapatyavadhivPropertyDataSchema } from "../../utils/validation-schema";

const SthapatyaVadhivPropertyDashboard = () => {
    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError } = useApiState();

    const initialState = {
        zoneKey: "",
        gatKey: "",
    };

    const [zoneKeys, setZoneKeys] = useState([]);
    const [gatKeys, setGatKeys] = useState([]);
    const [records, setRecords] = useState([]);
    const [actionLoadingSrno, setActionLoadingSrno] = useState(null);
    const [searchText, setSearchText] = useState("");

    // Dialog state for viewing property details (replaces inline expand row)
    const [detailsDialog, setDetailsDialog] = useState({
        open: false,
        record: null,
    });

    // ----Loader  ----
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingMessages = [
        "Submitting record...",
        "Verifying property data...",
        "Almost done...",
    ];

    useEffect(() => {
        if (!actionLoadingSrno) {
            setLoadingStep(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [actionLoadingSrno]);

    // ---- Reject dialog state ----
    const [rejectDialog, setRejectDialog] = useState({
        open: false,
        record: null,
        remark: "",
        remarkError: "",
    });

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: sthapatyavadhivPropertyDataSchema,
        onSubmit: () => { },
    });

    useEffect(() => {
        const loadFilters = async () => {
            try {
                setLoading(true);
                const zonesRes = await getZoneByProfile();
                setZoneKeys(zonesRes.zoneLst);
                if (zonesRes.zoneLst.length === 1) {
                    formik.setFieldValue("zoneKey", zonesRes.zoneLst[0].value);
                }
            } catch (err) {
                showToastError(getErrorMsg(err));
            } finally {
                setLoading(false);
            }
        };
        loadFilters();
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
            } catch (err) {
                showToastError(getErrorMsg(err));
            } finally {
                setLoading(false);
            }
        };
        if (formik.values.zoneKey) loadGatData();
    }, [formik.values.zoneKey]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const res = await getSthapatyaSurveyDashboard();
            console.log("Dashboard Response:", res);
            setRecords(res?.propertyROLst || []);
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // DataGrid needs a unique `id` field on every row Dev...R.J.Patil

    const rows = useMemo(
        () =>
            (records || []).map((r) => ({
                id: r.propertyCode,
                ...r,
            })),
        [records]
    );

    const openDetailsDialog = (record) => {
        setDetailsDialog({ open: true, record });
    };

    const closeDetailsDialog = () => {
        setDetailsDialog({ open: false, record: null });
    };

    /// -----Submit Action-----Dev...R.J.Patil

    const handleSubmitRecord = async (record) => {
        try {
            setActionLoadingSrno(record.propertyCode);
            await submitSthapathyaVadhivProperty({ upicId: record.upicId, status: "Accept" });
            showToastSuccess(labels?.RecordSavedSuccessfully?.[lang] || "Record saved successfully");
            setRecords((prev) => prev.filter((r) => r.propertyCode !== record.propertyCode));
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setActionLoadingSrno(null);
        }
    };
    // ---- Reject action ----Dev...R.J.Patil
    const openRejectDialog = (record) => {
        setRejectDialog({ open: true, record, remark: "", remarkError: "" });
    };

    const closeRejectDialog = () => {
        setRejectDialog({ open: false, record: null, remark: "", remarkError: "" });
    };

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
            setActionLoadingSrno(record.srno);
            await submitSthapathyaVadhivProperty({
                upicId: record.upicId,
                status: "Reject",
                remark: remark,
            });
            showToastSuccess(labels?.RecordRejectedSuccessfully?.[lang] || "Record rejected successfully");
            setRecords((prev) => prev.filter((r) => r.srno !== record.srno));
            closeRejectDialog();
        } catch (err) {
            showToastError(getErrorMsg(err));
        } finally {
            setActionLoadingSrno(null);
        }
    };

    const columns = useMemo(
        () => [
            {
                field: "srNo",
                headerName: labels?.SrNo?.[lang] || "Sr No",
                align: "center",
                width: 80,
                sortable: false,
                renderCell: (params) => {
                    const idx = rows.findIndex((r) => r.id === params.id);
                    return idx + 1;
                },
            },
            {
                field: "propertyName",
                headerName: labels?.PropertyName?.[lang] || "Property Name",
                align: "center",
                flex: 1,
                minWidth: 150,
            },
            {
                field: "occupantName",
                headerName: labels?.occupantName?.[lang] || "Property Occupant Name",
                flex: 1,
                minWidth: 170,
            },
            {
                field: "upicId",
                headerName: labels?.UpicId?.[lang] || "upicId",
                width: 130,
            },
            {
                field: "propertyAddress",
                headerName: labels?.propertyAddress?.[lang] || "Address",
                flex: 1.2,
                minWidth: 200,
            },
            {
                field: "description",
                headerName: labels?.description?.[lang] || "Description",
                flex: 1,
                minWidth: 150,
            },
            {
                field: "totalAreaSqmt",
                headerName: labels?.totalAreaSqmt?.[lang] || "Total Area (sqmt)",
                width: 150,
                type: "number",
            },
            {
                field: "ratableValueSum",
                headerName: labels?.ratableValueSum?.[lang] || "Total Ratable Value",
                width: 160,
                type: "number",
                renderCell: (params) => `₹${params.value ?? ""}`,
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
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                        }}
                    >
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openDetailsDialog(params.row)}
                        >
                            View
                        </Button>
                    </Box>
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
                    const isBusy = actionLoadingSrno === params.row.propertyCode;
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                            }}
                        >

                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={isBusy}
                                onClick={() => handleSubmitRecord(params.row)}
                            // startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {isBusy ? (labels?.Submitting?.[lang] || "Submitting...") : (labels?.Submit?.[lang] || "Submit")}
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                disabled={isBusy}
                                onClick={() => openRejectDialog(params.row)}
                            // startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {labels?.Reject?.[lang] || "Reject"}
                            </Button>
                        </Box>
                    );
                },
            },
        ],
        [rows, lang, actionLoadingSrno]
    );

    return (
        <DashBoardContainer>
            {error && (
                <AlertMsg message={error} severity="error" onClose={() => setError("")} />
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

                        {records && records.length > 0 && (
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

                                <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <TextField
                                        size="small"
                                        label="Search"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Box>

                                <div style={{ width: "100%" }}>
                                    <DataGrid
                                        autoHeight
                                        rows={rows}
                                        columns={columns}
                                        initialState={{
                                            pagination: {
                                                paginationModel: { pageSize: 20, page: 0 },
                                            },
                                        }}
                                        pageSizeOptions={[5, 10, 20, 50, 100]}
                                        filterModel={{
                                            items: [],
                                            quickFilterValues: searchText ? searchText.split(" ") : [],
                                        }}
                                        disableRowSelectionOnClick
                                        getRowId={(row) => row.propertyCode}

                                        sx={{
                                            "& .MuiDataGrid-columnHeaders": {
                                                bgcolor: "#e3e0ab",
                                            },
                                            "& .MuiDataGrid-columnHeader": {
                                                bgcolor: "#e3e0ab",
                                            },
                                            "& .MuiDataGrid-columnHeaderTitle": {
                                                fontWeight: 600,
                                            },
                                            border: 1,
                                            borderColor: "grey.300",
                                        }}
                                        localeText={{
                                            noRowsLabel: labels?.NoRecordFound?.[lang] || "No records found",
                                        }}
                                    />
                                </div>
                            </Paper>
                        )}
                    </Grid>

                    {/* ---- Property details dialog (replaces inline expand row) ----Dev...R.J.Patil */}
                    <Dialog
                        open={detailsDialog.open}
                        onClose={closeDetailsDialog}
                        // maxWidth="md"
                        fullWidth
                        maxWidth={false}
                        PaperProps={{
                            sx: {
                                width: "90vw",
                                maxWidth: "90vw",
                            },
                        }}
                    >
                        <DialogTitle>
                            {labels?.PropertyDetails?.[lang] || "Property Details"}
                            {detailsDialog.record?.propertyName
                                ? ` — ${detailsDialog.record.propertyName}`
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
                                    {(detailsDialog.record?.propertyDetailsROLst || []).map((d, di) => (
                                        <TableRow key={di}>
                                            <TableCell align="center">{d.useTypeName}</TableCell>
                                            <TableCell align="center">{d.subuseTypeName}</TableCell>
                                            <TableCell align="center">{d.constructionTypeName}</TableCell>
                                            <TableCell align="center">{d.assessmentDate}</TableCell>
                                            <TableCell align="center">{d.area}</TableCell>
                                            <TableCell align="center">{d.ratableValue}</TableCell>
                                            <TableCell align="center">{d.rate}</TableCell>
                                            <TableCell align="center">
                                                {d.permission === "Y" ? "Yes" : "No"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {d.toilet === "Y" ? "Yes" : "No"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDetailsDialog}>Close</Button>
                        </DialogActions>
                    </Dialog>

                    {/* ---- Reject remark dialog ---- */}
                    <Dialog open={rejectDialog.open} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {labels?.RejectRemarkTitle?.[lang] || "Reject Record"}
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {labels?.RejectRemarkPrompt?.[lang] ||
                                    `Please provide a remark for rejecting property no. ${rejectDialog.record?.propertyNo || ""
                                    }.`}
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
                            <Button onClick={closeRejectDialog}>
                                {labels?.Cancel?.[lang] || "Cancel"}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleConfirmReject}
                                disabled={actionLoadingSrno === rejectDialog.record?.srno}
                            >
                                {labels?.Reject?.[lang] || "Reject"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
            {/* // ---- Loader Backdrop ----BY R.J.Patil---- */}
            <Backdrop
                open={Boolean(actionLoadingSrno)}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 999,
                    flexDirection: "column",
                    gap: 2,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                }}
            >
                <CircularProgress color="inherit" size={60} thickness={4} />
                <Typography variant="h6" sx={{ animation: "fadeIn 0.5s" }}>
                    {loadingMessages[loadingStep]}
                </Typography>
                <Box sx={{ width: 250 }}>
                    <LinearProgress color="inherit" />
                </Box>
            </Backdrop>
        </DashBoardContainer>
    );
};

export default React.memo(SthapatyaVadhivPropertyDashboard);