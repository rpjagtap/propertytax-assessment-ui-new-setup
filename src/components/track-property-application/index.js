import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
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
  TableHead,
  Button,
  TextField,
} from "@mui/material";
// import { useSelector } from "react-redux";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { trackApplicationSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { RenderTableHead } from "../common/table";
import DateInput from "../form-fields/date-picker";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import { ArrowBack, Schema } from "@mui/icons-material";
import TableCard from "../common/table-card";

import TextInput from "../form-fields/text-input";
import {
  getAllStages,
  getGatByZonekey,
  getStagewiseApplicationsRpt,
  getStagewiseApplicationsCountRpt,
  getStagesByProfile,
  getZoneByProfile,
  getPropertyTransferPendingCount,
  getTransferPendingApplications,
  getAllPropertyTransactions,
  getTrackProperty,
} from "../../services/assessment-services";
// import TransferDashBoardTable from "./transfer-dashboard-table";
import TransferDashBoardTable from "../property-transfer-dashboard/transfer-dashboard-table";
import FormButtons from "../common/buttons";

const TrackPropertyApplication = () => {
  const oneMonthAgo = dayjs().subtract(1, "month");
  const navigate = useNavigate();

  const initialState = {
    fromDate: oneMonthAgo.format("DD/MM/YYYY"),
    toDate: getCurrentDate(),
    propertyCode: "",
    zoneKey: "",
    gatKey: "",
    applicationNo: "",
    transactionId: "",
  };

  const [selectedApplicationData, setSelectedApplicationData] = useState([]);
  const [showTransferTable, setShowTransferTable] = useState(false);

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [transactionType, setTransactionType] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const [isShowTrackAppTable, setTrackAppTable] = useState(false);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
  const [pendingAppsData, setPendingAppsData] = useState({
    assessmentFormVOLst: [],
  });

  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

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
    setPage(1);
    setTimeout(() => {
      setTableLoading(false);
    }, 0);
  }, []);

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: trackApplicationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  useEffect(() => {
    setPendingAppsData("");
    setPendingAppCountData([]);
  }, [formik.values.formStatus]);

  const resetData = () => {
    setTrackAppTable(false);
    setPendingAppsData("");
    setPendingAppCountData([]);
    handleSubmit();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statesRes, zonesRes, transactionRes] = await Promise.all([
          getStagesByProfile(),
          getZoneByProfile(),
          getAllPropertyTransactions(),
        ]);
        setStages(statesRes);
        const mappedTransactionTypes = transactionRes.map((item) => ({
          label: item.marTransactionTypeName,
          value: item.id,
        }));

        setTransactionType(mappedTransactionTypes);

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
  }, [formik.values.zoneKey]);

  const filteredData = useMemo(() => {
    if (!paginatedData || !searchTerm.trim()) return paginatedData;
    return paginatedData.filter(
      (item) =>
        item.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [paginatedData, searchTerm]);

  const handleSubmit = async () => {
    const fromDateValue = dayjs(formik.values.fromDate, "DD/MM/YYYY");

    const {
      propertyCode,
      zoneKey,
      gatKey,
      fromDate,
      toDate,
      applicationNo,
      transactionId,
    } = formik.values;

    const body = {
      propertyCode,
      transactionId,
      zoneKey,
      gatKey,
      fromDate,
      toDate,
      applicationNo,
    };

    try {
      setLoading(true);
      const res = await getTrackProperty(body);
      setPendingAppCountData(
        Array.isArray(res?.lstDetails) ? res.lstDetails : [],
      );
      setShowTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const [showTrackTable, setShowTrackTable] = useState(false);
  const [trackTableData, setTrackTableData] = useState(null);

  const handleApplicationCountClick = async (row) => {
    try {
      setLoading(true);
      const res = await getTransferPendingApplications({
        applicationNo: row.applicationNo,
      });
      setSelectedApplicationData(res?.propertyTransferDetails || []);
      setShowTransferTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = async (appId) => {
    try {
      setLoading(true);
      const res = await getTransferPendingApplications({ appId });
      setTrackTableData(res);
      setShowTrackTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
      setShowTrackTable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setTrackAppTable(false);
    setShowTrackTable(false);
    setTrackTableData(null);
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ marginTop: "65px" }} />
        </div>
      ) : (
        <>
          <ScrollBottom />
          <ScrollTop />
          {showTrackTable && trackTableData ? (
            <TransferDashBoardTable
              data={trackTableData}
              handleBackClick={handleBackClick}
              resetData={resetData}
            />
          ) : (
            <Grid>
              {!showTrackTable && !trackTableData ? (
                <FormikProvider value={formik}>
                  <Form>
                    <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                      <FormTitle title="Track Property Application" />
                      <GridRow>
                        <FormLabel label={labels.TransactionType[lang]} />
                        <FormValue
                          component={
                            <SelectInput
                              name="transactionId"
                              options={transactionType}
                            />
                          }
                        />
                      </GridRow>
                      <GridRow>
                        <FormLabel label={labels.PropertyCode[lang]} />
                        <FormValue
                          component={<TextInput name="propertyCode" />}
                        />

                        <FormLabel label={labels.ApplicationNo[lang]} />
                        <FormValue
                          component={<TextInput name="applicationNo" />}
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
                      <Grid
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
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
                    </Paper>
                  </Form>
                </FormikProvider>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBackClick}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
              )}

              {pendingAppCountData && (
                // TableCard supplies the padded shell — all border/header/
                // zebra/hover styling for the Table below comes from the
                // MuiTableContainer/MuiTableHead/MuiTableRow/MuiTableCell
                // overrides in theme.js, so it matches every other table
                // in the app automatically.
                <TableCard>
                  {pendingAppCountData.length > rowsPerPage && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
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
                        count={Math.ceil(
                          pendingAppCountData.length / rowsPerPage,
                        )}
                        page={page}
                        onChange={handleChangePage}
                      />
                    </div>
                  )}

                  <Grid container justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Search by Application No"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <TableContainer component={Paper} elevation={0}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="applications table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">{labels.SrNo?.[lang]}</TableCell>
                          <TableCell align="center">{labels.applicationNo?.[lang]}</TableCell>
                          <TableCell align="center">{labels.transactiontype?.[lang]}</TableCell>
                          <TableCell align="center">{labels.applicationDate?.[lang]}</TableCell>
                          <TableCell align="center">{labels.Action?.[lang]}</TableCell>
                        </TableRow>
                      </TableHead>
                      {tableLoading ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <CircularProgress size={22} sx={{ mr: 1 }} />
                              Please wait, loading data...
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody>
                          {filteredData.length ? (
                            filteredData.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                  {item.applicationNo}
                                </TableCell>
                                <TableCell align="center">{item.transactiontype}</TableCell>
                                <TableCell align="center">{item.applicationDate}</TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                      navigate(`/track-application-status?applicationNo=${item.applicationNo}`)
                                    }
                                  >
                                    Show
                                  </Button>
                                </TableCell>
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
                      )}
                    </Table>
                  </TableContainer>
                </TableCard>
              )}
            </Grid>
          )}
        </>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(TrackPropertyApplication);