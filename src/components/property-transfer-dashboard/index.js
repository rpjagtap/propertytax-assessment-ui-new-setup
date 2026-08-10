import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import dayjs from "dayjs";
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
  Button,
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
import {
  ArrowBack,
  Schema,
  MapOutlined,
  SwapHorizOutlined,
  SearchOutlined,
  ListAltOutlined,
} from "@mui/icons-material";

import TextInput from "../form-fields/text-input";
import {
  getGatByZonekey,
  getStagesByProfile,
  getZoneByProfile,
  getPropertyTransferPendingCount,
  getTransferPendingApplications,
} from "../../services/assessment-services";
import TransferDashBoardTable from "./transfer-dashboard-table";
import FormButtons from "../common/buttons";

const PropertyTransferDashBoard = () => {
  const oneMonthAgo = dayjs().subtract(1, "month");

  const initialState = {
    // fromDate: getCurrentDate(),
    fromDate: oneMonthAgo.format("DD/MM/YYYY"),
    toDate: getCurrentDate(),
    formStatus: "",
    zoneKey: "",
    gatKey: "",
    applicationNo: "",
  };

  const [selectedApplicationData, setSelectedApplicationData] = useState([]);
  const [showTransferTable, setShowTransferTable] = useState(false);

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [isShowTrackAppTable, setTrackAppTable] = useState(false);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
  const [pendingAppsData, setPendingAppsData] = useState({
    assessmentFormVOLst: [],
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default rows per page
  const [searchTerm, setSearchTerm] = useState("");

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

    // Wait for state to update before disabling loader
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
        const [statesRes, zonesRes] = await Promise.all([
          getStagesByProfile(),
          getZoneByProfile(),
        ]);
        setStages(statesRes);
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
    const { formStatus, zoneKey, gatKey, fromDate, toDate, applicationNo } =
      formik.values;

    const body = {
      formStatus,
      zoneKey,
      gatKey,
      fromDate,
      toDate,
      applicationNo,
    };

    try {
      setLoading(true);
      const res = await getPropertyTransferPendingCount(body);
      console.log("Pending Applications Count:", res);
      setPendingAppCountData(
        Array.isArray(res?.propertyTransferDetails)
          ? res.propertyTransferDetails
          : [],
      );
      setShowTable(true);
    } catch (error) {
      // showToastError(getErrorMsg(error));
      setShowTable(true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Button disables when loading
  <FormButtons
    isValid={!(formik.isValid && formik.dirty)}
    handleSubmitButtonClick={handleSubmit}
    resetForm={() => window.location.reload()}
    submitBtnLabel="Show"
    isSubmitIcon={false}
    disabled={loading} // Add this prop if possible
  />;

  const [showTrackTable, setShowTrackTable] = useState(false);
  const [trackTableData, setTrackTableData] = useState(null);

  const handleApplicationCountClick = async (row) => {
    try {
      setLoading(true);
      // Replace `getTransferPendingApplications` params as needed
      const res = await getTransferPendingApplications({
        applicationNo: row.applicationNo,
      });
      setSelectedApplicationData(res?.propertyTransferDetails || []); // adjust path if needed
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
      const res = await getTransferPendingApplications({ appId }); // API call
      setTrackTableData(res); // store result
      console.log(res);
      setShowTrackTable(true); // trigger rendering
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
          {showTrackTable && trackTableData ? (
            <TransferDashBoardTable
              data={trackTableData}
              handleBackClick={handleBackClick}
              stage={formik.values.formStatus}
              resetData={resetData}
            />
          ) : (
            <Grid>
              {!showTrackTable && !trackTableData ? (
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
                          <SwapHorizOutlined />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}
                          >
                            Property Transfer Dashboard
                          </Typography>
                          <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                            Filter by stage, zone or gat to track pending property
                            transfer applications.
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
                          {/* Search criteria */}
                          <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                              <CardHeader
                                avatar={
                                  <SearchOutlined sx={{ color: "text.secondary" }} />
                                }
                                title="Search criteria"
                                titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                                subheader="Narrow down applications by stage, application number, zone/gat and date range"
                                sx={{ pb: 0 }}
                              />
                              <CardContent>
                                <GridRow>
                                  <FormLabel label={labels.Stage[lang]} />
                                  <FormValue
                                    component={
                                      <SelectInput name="formStatus" options={stages} />
                                    }
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
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>

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
              ) : (
                <Button
                  variant="contained"
                  onClick={handleBackClick}
                  startIcon={<ArrowBack />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#12233F",
                    "&:hover": { bgcolor: "#1B3A63" },
                    mb: 2,
                  }}
                >
                  Back
                </Button>
              )}

              {pendingAppCountData && (
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Grid>
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
                          sx={{ width: 34, height: 34, bgcolor: "#E1F5EE", color: "#0F6E56" }}
                        >
                          <ListAltOutlined fontSize="small" />
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#12233F" }}>
                          Transfer applications
                        </Typography>
                      </Stack>

                      {/* Pagination Component */}
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
                            count={Math.ceil(
                              pendingAppCountData.length / rowsPerPage,
                            )}
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
                          label="Search by Applicant Name / Application No"
                          variant="outlined"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <TableContainer>
                      <Table
                        sx={{
                          minWidth: 650,
                          borderCollapse: "collapse", // Ensures single borders
                        }}
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
                          trSx={{
                            "& th": { padding: "10px 12px" },
                          }}
                          cells={[
                            labels.SrNo?.[lang],
                            labels.applicantName?.[lang],
                            labels.applicationNo?.[lang],
                            labels.transferType?.[lang],
                            labels.propertyCode?.[lang],
                            labels.applicantAddress?.[lang],
                            labels.applicationDate?.[lang],
                            labels.applicationCount?.[lang],
                          ]}
                        />

                        {tableLoading ? (
                          <>Please wait loading data...</>
                        ) : (
                          <TableBody>
                            {filteredData.length ? (
                              filteredData.map((item, index) => (
                                <TableRow
                                  key={index}
                                  hover
                                  sx={{
                                    "& td": {
                                      padding: "8px 12px",
                                      fontSize: "13px",
                                    },
                                  }}
                                >
                                  <TableCell align="center">
                                    {index + 1}
                                  </TableCell>

                                  <TableCell align="left">
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                      <Avatar
                                        sx={{
                                          width: 28,
                                          height: 28,
                                          fontSize: 12,
                                          bgcolor: "#E1F5EE",
                                          color: "#0F6E56",
                                        }}
                                      >
                                        <MapOutlined sx={{ fontSize: 15 }} />
                                      </Avatar>
                                      <span>{item.applicantName}</span>
                                    </Stack>
                                  </TableCell>

                                  <TableCell align="center">
                                    {item.applicationNo}
                                  </TableCell>

                                  <TableCell align="center">
                                    <Chip
                                      size="small"
                                      label={item.transferType}
                                      sx={{ bgcolor: "#EEF2FA", color: "#12233F" }}
                                    />
                                  </TableCell>

                                  <TableCell align="center">
                                    {item.propertyCode}
                                  </TableCell>
                                  <TableCell align="center">
                                    {item.applicantAddress}
                                  </TableCell>
                                  <TableCell align="center">
                                    {item.applicationDate}
                                  </TableCell>

                                  <TableCell align="center">
                                    <Link
                                      onClick={() =>
                                        handleCountClick(
                                          item.appId,
                                        )
                                      }
                                      component="button"
                                      sx={{ fontWeight: 600, color: "#0F6E56" }}
                                    >
                                      {/* {item.appId} /{item.applicationCount} */}
                                      {item.applicationCount}
                                    </Link>

                                    {/* Show Transfer Table */}
                                    {showTrackTable && trackTableData && (
                                      <TransferDashBoardTable
                                        data={trackTableData}
                                        handleBackClick={() =>
                                          setShowTrackTable(false)
                                        }
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  {labels.NoRecordFound[lang]}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        )}
                      </Table>
                    </TableContainer>
                  </Grid>
                </Paper>
              )}
            </Grid>
          )}
        </>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(PropertyTransferDashBoard);