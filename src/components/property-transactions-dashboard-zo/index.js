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
import RenderTableHead from "../common/table";

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

const ROUTE_BY_TRANSACTION_TYPE = {
  1: "/viewPropertyTransactionApplicationPa",
  2: "/AdditionalConstructedPropertyProcess",
  8: "/PropertyNameChangeZo",
  9: "/PropertyAddressChangeZo",
  11: "/UseTypeChangeProcess",
  14: "/PropertyMobileEmailChangeZo",
};

const PropertyTransactionDashboardZo = () => {
  const initialState = {
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
    transactionTypeKey: "",
    formStatus: "",
    zoneKey: "",
    gatKey: "",
  };

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [allTrsactions, setAllTrsactions] = useState([]);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: propertyTransactionDashboardSchemaZo,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  /* ---------- Pagination ---------- */
  const paginatedData = useMemo(() => {
    if (!Array.isArray(pendingAppCountData) || pendingAppCountData.length === 0) return [];
    const startIndex = (page - 1) * rowsPerPage;
    return pendingAppCountData.slice(startIndex, startIndex + rowsPerPage);
  }, [pendingAppCountData, page, rowsPerPage]);

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

  /* ---------- Clear old results when the stage changes ---------- */
  useEffect(() => {
    setPendingAppCountData([]);
    setShowTable(false);
  }, [formik.values.formStatus]);

  /* ---------- Initial data ---------- */
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

  /* ---------- Actions ---------- */
  const handleSubmit = async () => {
    const { formStatus, zoneKey, gatKey, fromDate, toDate, transactionTypeKey } =
      formik.values;
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
      setPendingAppCountData(
        Array.isArray(res?.propertyUpdateVO) ? res.propertyUpdateVO : []
      );
      setPage(1);
      setShowTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
      setPendingAppCountData([]);
      setShowTable(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = (applicationId, propertyCode, transactionTypeId) => {
    const queryParams =
      `applicationNo=${encodeURIComponent(applicationId)}` +
      `&transactionTypeId=${encodeURIComponent(transactionTypeId)}` +
      `&propertyCode=${encodeURIComponent(propertyCode)}`;

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
                      background: "linear-gradient(90deg, #12233F 0%, #1B3A63 100%)",
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
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                        {labels?.PropertyTransactionDashboard?.[lang] ||
                          "Property Transactions Dashboard"}
                      </Typography>
                      <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                        Filter by transaction type, stage, zone or gat to review
                        property transaction applications.
                      </Typography>
                    </Box>

                    {showTable && !!pendingAppCountData.length && (
                      <Chip
                        icon={<ListAltOutlined sx={{ color: "#0F6E56 !important" }} />}
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
                                component={
                                  <SelectInput
                                    name="transactionTypeKey"
                                    options={transactionsOptions}
                                  />
                                }
                                required
                              />
                              <FormLabel label={labels.Stage[lang]} />
                              <FormValue
                                component={<SelectInput name="formStatus" options={stages} />}
                              />
                            </GridRow>
                            <GridRow>
                              <FormLabel label={labels.Zone[lang]} />
                              <FormValue
                                component={<SelectInput name="zoneKey" options={zoneKeys} />}
                              />
                              <FormLabel label={labels.Gat[lang]} />
                              <FormValue
                                component={<SelectInput name="gatKey" options={gatKeys} />}
                              />
                            </GridRow>
                            <GridRow>
                              <FormLabel label={labels.FromDate[lang]} required />
                              <FormValue component={<DateInput name="fromDate" required />} />
                              <FormLabel label={labels.ToDate[lang]} required />
                              <FormValue component={<DateInput name="toDate" required />} />
                            </GridRow>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

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
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#12233F" }}>
                      Transaction applications
                    </Typography>
                  </Stack>

                  {pendingAppCountData.length > rowsPerPage && (
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
                        count={Math.ceil(pendingAppCountData.length / rowsPerPage)}
                        page={page}
                        onChange={handleChangePage}
                      />
                    </Stack>
                  )}
                </Box>

                <Divider />

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
                        labels.ApplicationDate[lang],
                      ]}
                    />

                    <TableBody>
                      {tableLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            Please wait loading data...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length ? (
                        paginatedData.map((item, index) => (
                          <TableRow
                            key={`${item.applicationId}-${index}`}
                            hover
                            sx={{ "& td": { padding: "8px 12px", fontSize: "13px" } }}
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
                                    item.transactionTypeKey
                                  )
                                }
                                sx={{ fontWeight: 600, color: "#0F6E56" }}
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
                          <TableCell colSpan={5} align="center">
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

export default React.memo(PropertyTransactionDashboardZo);