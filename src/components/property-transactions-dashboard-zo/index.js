import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { propertyTransactionDashboardSchemaZo } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import DateInput from "../form-fields/date-picker";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import {
  getAllProTransactions,
  getPropertyTransactionStages,
  getGatByZonekey,
  getTransactionDashboardZo,
  getZoneByProfile,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import { useNavigate } from "react-router-dom";

// Theme tokens — same values used across the other redesigned pages.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const headCellSx = {
  bgcolor: NAVY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

const bodyRowSx = { "& td": { padding: "8px 12px", fontSize: "13px" } };

// Where clicking an application number goes, keyed by transaction type id.
const TRANSACTION_ROUTES = {
  1: "/viewPropertyTransactionApplicationPa",
  2: "/AdditionalConstructedPropertyProcess",
  8: "/PropertyNameChangeZo",
  9: "/PropertyAddressChangeZo",
  11: "/UseTypeChangeProcess",
  14: "/PropertyMobileEmailChangeZo",
};

// Reusable results card header (avatar + title + optional right side)
const ResultsHeader = ({ title, right }) => (
  <>
    <Box
      sx={{
        px: 2.5,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 34, height: 34, bgcolor: MINT_BG, color: MINT }}>
          <FactCheckOutlined fontSize="small" />
        </Avatar>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: NAVY }}>{title}</Typography>
      </Stack>
      {right}
    </Box>
    <Divider />
  </>
);

const PropertyTransactionDashboardZo = () => {
  const initialState = {
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
    transactionTypeKey: "",
    formStatus: "",
    zoneKey: "",
    gatKey: "",
  };

  const lang = useSelector((state) => state.userDetails?.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
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
    validationSchema: propertyTransactionDashboardSchemaZo,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  // Changing the stage invalidates any results already on screen.
  useEffect(() => {
    setPendingAppCountData("");
  }, [formik.values.formStatus]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes, statesRes, zonesRes] = await Promise.all([
          getAllProTransactions(),
          getPropertyTransactionStages(),
          getZoneByProfile(),
        ]);
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
      const res = await getTransactionDashboardZo(body);
      setPendingAppCountData(res?.propertyUpdateVO || []);
      setPage(1); // jump back to page 1 on a fresh search
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = (applicationId, propertyCode, transactionTypeId) => {
    const queryParams = `applicationNo=${encodeURIComponent(applicationId)}&transactionTypeId=${encodeURIComponent(
      transactionTypeId
    )}&propertyCode=${encodeURIComponent(propertyCode)}`;

    // Note: the original also had a second `["1"]` branch that navigated to
    // /SRDashboardForZo — it could never run because the first `["1"]`
    // branch always matched first. If SRDashboardForZo is meant to be
    // reached from a different transaction type, add it to
    // TRANSACTION_ROUTES above.
    const route = TRANSACTION_ROUTES[String(transactionTypeId)];
    if (route) {
      navigate(`${route}?${queryParams}`);
    }
  };

  const transactionsOptions = allTrsactions.map((item) => ({
    id: item.id,
    label: item.marTransactionTypeName,
  }));

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

          <Box sx={{ p: 2 }}>
            {/* ---------- Filter card ---------- */}
            <FormikProvider value={formik}>
              <Form>
                <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
                  {/* Header band */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2.5,
                      background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "rgba(255,255,255,0.12)",
                        color: "#5DCAA5",
                      }}
                    >
                      <AssignmentOutlined />
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                        Property Transactions Dashboard
                      </Typography>
                      <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                        Filter property transaction applications by type, stage, zone/gat and date range.
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ px: 3, py: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardHeader
                        avatar={<SearchOutlined sx={{ color: "text.secondary" }} />}
                        title="Search criteria"
                        titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                        subheader="Narrow down applications by transaction type, stage, zone/gat and date range"
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <GridRow>
                          <FormLabel label={labels.Type[lang]} required />
                          <FormValue
                            component={<SelectInput name="transactionTypeKey" options={transactionsOptions} />}
                            required
                          />
                          <FormLabel label={labels.Stage[lang]} />
                          <FormValue component={<SelectInput name="formStatus" options={stages} />} />
                        </GridRow>
                        <GridRow>
                          <FormLabel label={labels.Zone[lang]} />
                          <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} />} />
                          <FormLabel label={labels.Gat[lang]} />
                          <FormValue component={<SelectInput name="gatKey" options={gatKeys} />} />
                        </GridRow>
                        <GridRow>
                          <FormLabel label={labels.FromDate[lang]} required />
                          <FormValue component={<DateInput name="fromDate" required />} />
                          <FormLabel label={labels.ToDate[lang]} required />
                          <FormValue component={<DateInput name="toDate" required />} />
                        </GridRow>
                      </CardContent>
                    </Card>

                    <Divider sx={{ my: 3 }} />

                    <Grid container justifyContent="center">
                      <Grid item md={4} p={0}>
                        <FormButtons
                          isValid={!(formik.isValid && formik.dirty)}
                          handleSubmitButtonClick={handleSubmit}
                          resetForm={() => {
                            window.location.reload();
                          }}
                          submitBtnLabel="Show"
                          isSubmitIcon={false}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Form>
            </FormikProvider>

            {/* ---------- Results ---------- */}
            {pendingAppCountData && (
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                <ResultsHeader
                  title="Transactions"
                  right={
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                      {pendingAppCountData.length > 0 && (
                        <Chip
                          label={`${pendingAppCountData.length} record${pendingAppCountData.length === 1 ? "" : "s"}`}
                          sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                        />
                      )}
                      {pendingAppCountData.length > rowsPerPage && (
                        <>
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
                          />
                        </>
                      )}
                    </Stack>
                  }
                />

                <Box sx={{ p: 2 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="property transactions">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" sx={headCellSx}>{labels.SrNo[lang]}</TableCell>
                          <TableCell align="center" sx={headCellSx}>{labels.TransactionType[lang]}</TableCell>
                          <TableCell align="center" sx={headCellSx}>{labels.applicationNo[lang]}</TableCell>
                          <TableCell align="center" sx={headCellSx}>{labels.propertyCode[lang]}</TableCell>
                          <TableCell align="center" sx={headCellSx}>{labels.ApplicationDate[lang]}</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {tableLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <CircularProgress size={22} sx={{ mr: 1 }} />
                              Please wait, loading data...
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length ? (
                          paginatedData.map((item, index) => (
                            <TableRow key={`${item.applicationId}-${index}`} hover sx={bodyRowSx}>
                              <TableCell align="center">
                                {rowsPerPage * page - rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell align="center">{item.transactionType}</TableCell>
                              <TableCell align="center">
                                <Link
                                  onClick={() =>
                                    handleCountClick(item.applicationId, item.propertyCode, item.transactionTypeKey)
                                  }
                                  component="button"
                                  sx={{ fontWeight: 600, color: MINT }}
                                >
                                  {item.applicationId}
                                </Link>
                              </TableCell>
                              <TableCell align="center">{item.propertyCode}</TableCell>
                              <TableCell align="center">{item.applicationDate}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                              {labels.NoRecordFound[lang]}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            )}
          </Box>
        </>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(PropertyTransactionDashboardZo);