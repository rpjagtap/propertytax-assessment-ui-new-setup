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
} from "@mui/material";
// import { useSelector } from "react-redux";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { assessmentDashSchema } from "../../utils/validation-schema";
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
  getGatByZonekey,
  getPendingApplications,
  getPendingApplicationsCount,
  getStages,
  getZoneByProfile,
} from "../../services/assessment-services";
import GenerateSRTable from "./generate-sr-table";
import FormButtons from "../common/buttons";

const AssessmentDashboard = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const stage = urlParams.get("stage");

  const initialState = {
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
    formStatus: stage || "",
    zoneKey: "",
    gatKey: "",
  };

  // const [isSelectAll, setIsSelectAll] = useState(false);

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  // const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);

  const [isShowGenerateSRTable, setIsShowGenerateSRTable] = useState(false);
  const [pendingAppCountData, setPendingAppCountData] = useState("");
  const [pendingAppsData, setPendingAppsData] = useState("");

  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default rows per page

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
    validationSchema: assessmentDashSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  useEffect(() => {
    setPendingAppsData("");
    setPendingAppCountData("");
  }, [formik.values.formStatus]);

  const resetData = () => {
    setIsShowGenerateSRTable(false);
    setPendingAppsData("");
    setPendingAppCountData("");
    handleSubmit();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statesRes, zonesRes] = await Promise.all([getStages(), getZoneByProfile()]);
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
    const { formStatus, zoneKey, gatKey, fromDate, toDate } = formik.values;
    const body = {
      formStatus,
      zoneKey,
      gatKey,
      fromDate,
      toDate,
    };
    try {
      setLoading(true);
      const res = await getPendingApplicationsCount(body);
      setPendingAppCountData(res);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = async (completionNo, floorMarathi, wingName) => {
    const body = { formStatus: formik.values.formStatus, completionNo, floorMarathi, wingName };
    try {
      setLoading(true);
      const res = await getPendingApplications(body);
      setPendingAppsData(res);
      setIsShowGenerateSRTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setIsShowGenerateSRTable(false);
    setPendingAppsData("");
  };

  console.log(rowsPerPage, page);

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
          {isShowGenerateSRTable ? (
            <GenerateSRTable
              data={pendingAppsData}
              handleBackClick={handleBackClick}
              stage={formik.values.formStatus}
              resetData={resetData}
              zoneKey={formik.values.zoneKey}
            />
          ) : (
            <Grid>
              <FormikProvider value={formik}>
                <Form>
                  <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                    <FormTitle title="Process Applications" />
                    <GridRow>
                      <FormLabel label={labels.Stage[lang]} required />
                      <FormValue component={<SelectInput name="formStatus" options={stages} required />} />
                    </GridRow>
                    <GridRow>
                      <FormLabel label={labels.Zone[lang]} required />
                      <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} required />} />
                      <FormLabel label={labels.Gat[lang]} required />
                      <FormValue component={<SelectInput name="gatKey" options={gatKeys} required />} />
                    </GridRow>
                    <GridRow>
                      <FormLabel label={labels.FromDate[lang]} required />
                      <FormValue component={<DateInput name="fromDate" required />} />
                      <FormLabel label={labels.ToDate[lang]} required />
                      <FormValue component={<DateInput name="toDate" required />} />
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
                          submitBtnLabel={labels.show[lang]}
                          isSubmitIcon={false}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Form>
              </FormikProvider>

              {paginatedData && (
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
                            labels.Zone[lang],
                            labels.Gat[lang],
                            labels.CompletionNumber[lang],
                            labels.CompletionDate[lang],
                            labels.Wing[lang],
                            labels.Floor[lang],
                            labels.FlatsCounts[lang],
                            labels.ApplicationDate[lang],
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
                                    <TableCell align="center" sx={{ minWidth: "10px !important" }}>
                                      {rowsPerPage * page - rowsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell align="center">{item.zoneName}</TableCell>
                                    <TableCell align="center">{item.gatName}</TableCell>
                                    <TableCell align="center">{item.completionNo}</TableCell>
                                    <TableCell align="center">{item.completionDate}</TableCell>
                                    <TableCell align="center">{item.wingName}</TableCell>
                                    <TableCell align="center">{item.floorMarathi}</TableCell>
                                    <TableCell align="center">
                                      <Link
                                        onClick={() =>
                                          handleCountClick(
                                            item.completionNo,
                                            item.floorMarathi,
                                            item.wingName
                                          )
                                        }
                                        component="button"
                                      >
                                        {item.applicationCount}
                                      </Link>
                                    </TableCell>
                                    <TableCell align="center">{item.createdDate}</TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <>Data not available</>
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

export default AssessmentDashboard;
