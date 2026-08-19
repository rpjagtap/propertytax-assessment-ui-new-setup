import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import { CircularProgress, Grid, Link, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
// import { useSelector } from "react-redux";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { assessmentDashSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
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

  // DataGrid manages paging itself via this single object,
  // instead of the separate page / rowsPerPage / tableLoading state we had before.
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

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
      setPaginationModel((prev) => ({ ...prev, page: 0 })); // jump back to page 1 on a fresh search
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  // Same as your original: a plain function declared after `formik`,
  // so it always reads the current formStatus value. No stale-closure risk.
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

  // Rows for DataGrid: it requires a unique "id" field on every row,
  // so we stamp one on using data that's already unique per row.
  const rows = useMemo(() => {
    if (!pendingAppCountData || pendingAppCountData.length === 0) return [];
    return pendingAppCountData.map((item, index) => ({
      id: `${item.completionNo}-${item.wingName}-${item.floorMarathi}-${index}`,
      srNo: index + 1,
      ...item,
    }));
  }, [pendingAppCountData]);

  // Column definitions replace both RenderTableHead (headers) and the
  // hand-written <TableCell> list (body) in one place.
  // Plain array, rebuilt on every render (like your original table body was) -
  // so applicationCount's onClick always calls the current handleCountClick,
  // exactly like your original code.
  const columns = [
    {
      field: "srNo",
      headerName: labels.SrNo[lang],
      width: 80,
      sortable: false,
    },
    {
      field: "zoneName",
      headerName: labels.Zone[lang],
      flex: 1,
      minWidth: 120,
    },
    {
      field: "gatName",
      headerName: labels.Gat[lang],
      flex: 1,
      minWidth: 120,
    },
    {
      field: "completionNo",
      headerName: labels.CompletionNumber[lang],
      flex: 1,
      minWidth: 140,
    },
    {
      field: "completionDate",
      headerName: labels.CompletionDate[lang],
      flex: 1,
      minWidth: 140,
    },
    {
      field: "wingName",
      headerName: labels.Wing[lang],
      flex: 1,
      minWidth: 100,
    },
    {
      field: "floorMarathi",
      headerName: labels.Floor[lang],
      flex: 1,
      minWidth: 100,
    },
    {
      field: "applicationCount",
      headerName: labels.FlatsCounts[lang],
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() =>
            handleCountClick(params.row.completionNo, params.row.floorMarathi, params.row.wingName)
          }
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "createdDate",
      headerName: labels.ApplicationDate[lang],
      flex: 1,
      minWidth: 140,
    },
  ];

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

              {pendingAppCountData && (
                <Paper sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20, 50, 100]}
                    disableRowSelectionOnClick
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        bgcolor: "#abd9e3",
                      },
                      "& .MuiDataGrid-columnHeader": {
                        bgcolor: "#abd9e3",
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 600,
                      },
                      border: 1,
                      borderColor: "grey.300",
                    }}
                  />
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
