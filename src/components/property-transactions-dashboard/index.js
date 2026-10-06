import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TextField,
  Box,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Typography,
  Stack,
} from "@mui/material";
import {
  SearchOutlined,
  ListAltOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { propertyTransactionDashboardSchema } from "../../utils/validation-schema";
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
  getGatByZonekey,
  getTransactionDashboard,
  getZoneByProfile,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import { useNavigate } from "react-router-dom";

const ROUTE_BY_TRANSACTION_TYPE = {
  1: "/submitApplication",
  2: "/AdditionalConstructedProperty",
  8: "/PropertyInfoChange",
  9: "/PropertyAddressChange",
  11: "/PropertyUseTypeChange",
  14: "/PropertyContactChange",
};

// sessionStorage key used to restore the last search when the user comes Back
const FILTER_KEY = "propertyTxnDashboardState";

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
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [allTrsactions, setAllTrsactions] = useState([]);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const lastSearchRef = useRef(null); // filters used for the list currently shown
  const restoredGatKeyRef = useRef(null); // gat to re-select after the gat list loads

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: propertyTransactionDashboardSchema,
    onSubmit: () => {},
  });

  /* ---------- Search + pagination (search runs on ALL rows, then paginate) ---------- */
  const filteredAll = useMemo(() => {
    if (!Array.isArray(pendingAppCountData)) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pendingAppCountData;
    return pendingAppCountData.filter(
      (item) =>
        item.applicantName?.toLowerCase().includes(term) ||
        item.propertyCode?.toLowerCase().includes(term) ||
        String(item.applicationId ?? "").toLowerCase().includes(term) ||
        String(item.applicantMobile ?? "").includes(term),
    );
  }, [pendingAppCountData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAll.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  const handleChangePage = useCallback((event, newPage) => {
    setTableLoading(true);
    setPage(newPage);
    setTimeout(() => setTableLoading(false), 0);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    const value = parseInt(event.target.value, 10);
    setTableLoading(true);
    setRowsPerPage(value);
    setPage(1);
    setTimeout(() => setTableLoading(false), 0);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  /* ---------- Initial data ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProTransactionsRes, zonesRes] = await Promise.all([
          getAllProTransactions(),
          getZoneByProfile(),
        ]);
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
        if (
          restoredGatKeyRef.current &&
          gatRes.gatLst.some(
            (g) => String(g.value) === String(restoredGatKeyRef.current),
          )
        ) {
          // coming back via the Back button: re-select the saved gat
          formik.setFieldValue("gatKey", restoredGatKeyRef.current);
          restoredGatKeyRef.current = null;
        } else if (gatRes.gatLst.length === 1) {
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

  /* ---------- Actions ---------- */
  const fetchList = async (body, restore) => {
    lastSearchRef.current = body;
    try {
      setLoading(true);
      const res = await getTransactionDashboard(body);
      setPendingAppCountData(
        Array.isArray(res?.propertyTransactionVO) ? res.propertyTransactionVO : [],
      );
      setPage(restore?.page || 1);
      setSearchTerm(restore?.searchTerm || "");
      setShowTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
      setPendingAppCountData([]);
      setShowTable(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const { zoneKey, gatKey, fromDate, toDate, transactionTypeKey } =
      formik.values;
    fetchList({ zoneKey, gatKey, fromDate, toDate, transactionTypeKey });
  };

  /* ---------- Restore last search when coming back (Back button) ---------- */
  useEffect(() => {
    const raw = sessionStorage.getItem(FILTER_KEY);
    if (!raw) return;
    try {
      const { body, page, rowsPerPage, searchTerm } = JSON.parse(raw);
      restoredGatKeyRef.current = body.gatKey || null;
      formik.setValues({ ...initialState, ...body });
      if (rowsPerPage) setRowsPerPage(rowsPerPage);
      fetchList(body, { page, searchTerm });
    } catch (e) {
      sessionStorage.removeItem(FILTER_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Save the search state whenever the list/page/search changes ---------- */
  useEffect(() => {
    if (!showTable || !lastSearchRef.current) return;
    sessionStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        body: lastSearchRef.current,
        page,
        rowsPerPage,
        searchTerm,
      }),
    );
  }, [showTable, pendingAppCountData, page, rowsPerPage, searchTerm]);

  const handleCountClick = (
    applicationId,
    propertyCode,
    transactionTypeId,
    applicationFromId,
  ) => {
    const queryParams =
      `applicationNo=${encodeURIComponent(applicationId)}` +
      `&transactionTypeId=${encodeURIComponent(transactionTypeId)}` +
      `&propertyCode=${encodeURIComponent(propertyCode)}` +
      `&applicationFromId=${encodeURIComponent(applicationFromId)}`;

    const route = ROUTE_BY_TRANSACTION_TYPE[String(transactionTypeId)];
    if (route) navigate(`${route}?${queryParams}`);
  };

  const transactionsOptions = allTrsactions.map((item) => ({
    id: item.id,
    label: item.marTransactionTypeName,
  }));

  return (
    <DashBoardContainer>
      {error && (
        <AlertMsg message={error} severity="error" onClose={() => setError("")} />
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress sx={{ color: "#12233F" }} />
        </Box>
      ) : (
        <>
          <ScrollBottom />
          <ScrollTop />

          <Grid>
            <FormikProvider value={formik}>
              <Form>
                <Card
                  elevation={4}
                  sx={{ borderRadius: 3, mt: 2, mb: 3, overflow: "hidden" }}
                >
                  {/* Header band */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2.5,
                      background:
                        "linear-gradient(90deg, #12233F 0%, #1B3A63 100%)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
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
                      <ReceiptLongOutlined />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}
                      >
                        {labels?.PropertyTransactionDashboard?.[lang] ||
                          "Property Transaction Dashboard"}
                      </Typography>
                      <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                        Filter by transaction type, zone or gat to track property
                        transaction applications.
                      </Typography>
                    </Box>

                    {!!pendingAppCountData?.length && (
                      <Chip
                        icon={
                          <ListAltOutlined sx={{ color: "#0F6E56 !important" }} />
                        }
                        label={`${pendingAppCountData.length} records`}
                        sx={{ bgcolor: "#E1F5EE", color: "#0F6E56", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ px: 3, py: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardHeader
                            avatar={
                              <SearchOutlined sx={{ color: "text.secondary" }} />
                            }
                            title="Search criteria"
                            titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                            subheader="Narrow down applications by transaction type, zone/gat and date range"
                            sx={{ pb: 0 }}
                          />
                          <CardContent>
                            <GridRow>
                              <FormLabel label={labels.Type[lang]} required />
                              <FormValue
                                component={
                                  <SelectInput
                                    name="transactionTypeKey"
                                    options={transactionsOptions}
                                  />
                                }
                              />
                            </GridRow>
                            <GridRow>
                              <FormLabel label={labels.Zone[lang]} />
                              <FormValue
                                component={
                                  <SelectInput name="zoneKey" options={zoneKeys} />
                                }
                              />
                              <FormLabel label={labels.Gat[lang]} />
                              <FormValue
                                component={
                                  <SelectInput name="gatKey" options={gatKeys} />
                                }
                              />
                            </GridRow>
                            <GridRow>
                              <FormLabel label={labels.FromDate[lang]} required />
                              <FormValue
                                component={<DateInput name="fromDate" required />}
                              />
                              <FormLabel label={labels.ToDate[lang]} required />
                              <FormValue
                                component={<DateInput name="toDate" required />}
                              />
                            </GridRow>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Buttons: Show + New Application (original button kept as is) */}
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
                            sessionStorage.removeItem(FILTER_KEY);
                            window.location.reload();
                          }}
                          submitBtnLabel="Show"
                          isSubmitIcon={false}
                        />
                        <button
                          type="button"
                          onClick={() => navigate("/PropertyTransactions")}
                          style={{
                            marginLeft: "10px",
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
                  </CardContent>
                </Card>
              </Form>
            </FormikProvider>

            {/* Results */}
            {showTable && (
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
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
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "#E1F5EE",
                        color: "#0F6E56",
                      }}
                    >
                      <ListAltOutlined fontSize="small" />
                    </Avatar>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: 15, color: "#12233F" }}
                    >
                      Transaction applications
                    </Typography>
                  </Stack>

                  {filteredAll.length > rowsPerPage && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        size="small"
                      >
                        {[5, 10, 20, 50, 100].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num} Rows
                          </MenuItem>
                        ))}
                      </Select>
                      <Pagination
                        count={Math.ceil(filteredAll.length / rowsPerPage)}
                        page={page}
                        onChange={handleChangePage}
                      />
                    </Stack>
                  )}
                </Box>

                <Divider />

                <Grid container justifyContent="flex-end" spacing={1} p={1.5}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Search by Applicant / Application No / Property Code"
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </Grid>
                </Grid>

                <TableContainer>
                  <Table
                    sx={{ minWidth: 650, borderCollapse: "collapse" }}
                    size="small"
                    aria-label="clean table"
                  >
                    <RenderTableHead
                      thSx={{
                        bgcolor: "#12233F",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                      trSx={{ "& th": { padding: "10px 12px" } }}
                      cells={[
                        labels.SrNo[lang],
                        labels.TransactionType[lang],
                        labels.applicationNo[lang],
                        labels.propertyCode[lang],
                        labels.applicantName[lang],
                        labels.mobileNo[lang],
                      ]}
                    />

                    <TableBody>
                      {tableLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Please wait loading data...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length ? (
                        paginatedData.map((item, index) => (
                          <TableRow
                            key={`${item.applicationId}-${index}`}
                            hover
                            sx={{
                              "& td": { padding: "8px 12px", fontSize: "13px" },
                            }}
                          >
                            <TableCell align="center">
                              {(page - 1) * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={item.transactionType}
                                sx={{ bgcolor: "#EEF2FA", color: "#12233F" }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Link
                                component="button"
                                onClick={() =>
                                  handleCountClick(
                                    item.applicationId,
                                    item.propertyCode,
                                    item.transactionTypeId,
                                    item.applicationFromId,
                                  )
                                }
                                sx={{ fontWeight: 600, color: "#0F6E56" }}
                              >
                                {item.applicationId}
                              </Link>
                            </TableCell>
                            <TableCell align="center">
                              {item.propertyCode}
                            </TableCell>
                            <TableCell align="center">
                              {item.applicantName}
                            </TableCell>
                            <TableCell align="center">
                              {item.applicantMobile}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            {labels.NoRecordFound[lang]}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Grid>
        </>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(PropertyTransactionDashboard);
