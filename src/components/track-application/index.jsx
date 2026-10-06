import React, { useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
  Box,
  CircularProgress,
  Grid,
  Link,
  TextField,
  InputAdornment,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import { DataGrid } from "@mui/x-data-grid";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { trackApplicationSchema } from "../../utils/validation-schema";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import DateInput from "../form-fields/date-picker";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import TextInput from "../form-fields/text-input";
import {
  getAllStages,
  getGatByZonekey,
  getStagewiseApplicationsRpt,
  getStagewiseApplicationsCountRpt,
  getZoneByProfile,
} from "../../services/assessment-services";
import TrackApplicationTable from "./track-application-table";
import FormButtons from "../common/buttons";

// Theme tokens — same values used across the other redesigned pages.
// Kept local so this file has no dependency on any shared common/
// component that might not exist in the project.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

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
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: NAVY }}>
          {title}
        </Typography>
      </Stack>
      {right}
    </Box>
    <Divider />
  </>
);

const TrackApplication = () => {
  const initialState = {
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
    formStatus: "",
    zoneKey: "",
    gatKey: "",
    applicationNo: "",
  };

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [stages, setStages] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);

  const [isShowTrackAppTable, setTrackAppTable] = useState(false);
  const [pendingAppCountData, setPendingAppCountData] = useState([]);
  const [pendingAppsData, setPendingAppsData] = useState("");

  // Search box text used to filter the DataGrid rows client-side.
  const [searchText, setSearchText] = useState("");

  // DataGrid manages paging itself via this single object, and sorting
  // is handled internally by the grid (click any column header).
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

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
        const [statesRes, zonesRes] = await Promise.all([getAllStages(), getZoneByProfile()]);
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
    const { formStatus, zoneKey, gatKey, fromDate, toDate, applicationNo } = formik.values;
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
      const res = await getStagewiseApplicationsCountRpt(body);
      setPendingAppCountData(res?.assessmentFormVOLst || []);
      setPaginationModel((prev) => ({ ...prev, page: 0 })); // jump back to page 1 on a fresh search
      setSearchText(""); // clear any previous filter text on a fresh search
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = async (completionNo, floorMarathi, wingName) => {
    const body = {
      formStatus: formik.values.formStatus,
      completionNo,
      applicationNo: formik.values.applicationNo,
      floorMarathi,
      wingName,
    };
    try {
      setLoading(true);
      const res = await getStagewiseApplicationsRpt(body);
      setPendingAppsData(res);
      setTrackAppTable(true);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setTrackAppTable(false);
    setPendingAppsData("");
  };

  // Rows for DataGrid: it requires a unique "id" field on every row, so
  // we stamp one on using data that's already unique per row. Then we
  // filter by searchText across the visible text columns.
  const rows = useMemo(() => {
    if (!pendingAppCountData || pendingAppCountData.length === 0) return [];

    const mapped = pendingAppCountData.map((item, index) => ({
      id: `${item.completionNo}-${item.wingName}-${item.floorMarathi}-${index}`,
      srNo: index + 1,
      ...item,
    }));

    if (!searchText.trim()) return mapped;

    const term = searchText.trim().toLowerCase();
    return mapped.filter((row) =>
      [
        row.zoneName,
        row.gatName,
        row.completionNo,
        row.wingName,
        row.floorMarathi,
        row.completionDate,
        row.createdDate,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term))
    );
  }, [pendingAppCountData, searchText]);

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
      field: "completionDate",
      headerName: labels.CompletionDate[lang],
      flex: 1,
      minWidth: 140,
    },
    {
      field: "applicationCount",
      headerName: labels.FlatsCounts[lang],
      flex: 1,
      minWidth: 120,
      sortable: true,
      renderCell: (params) => (
        <Link
          component="button"
          sx={{ fontWeight: 600, color: MINT }}
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
      headerName: labels.Date[lang],
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
          {isShowTrackAppTable ? (
            <TrackApplicationTable
              data={pendingAppsData}
              handleBackClick={handleBackClick}
              stage={formik.values.formStatus}
              resetData={resetData}
            />
          ) : (
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
                        <TrackChangesOutlined />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                          Track Application
                        </Typography>
                        <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                          Search and track applications by stage, zone/gat, date range or application number.
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ px: 3, py: 3 }}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardHeader
                          avatar={<SearchOutlined sx={{ color: "text.secondary" }} />}
                          title="Search criteria"
                          titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                          subheader="Narrow down applications by stage, zone/gat, application number and date range"
                          sx={{ pb: 0 }}
                        />
                        <CardContent>
                          <GridRow>
                            <FormLabel label={labels.Stage[lang]} />
                            <FormValue component={<SelectInput name="formStatus" options={stages} />} />
                            <FormLabel label={labels.ApplicationNo[lang]} />
                            <FormValue component={<TextInput name="applicationNo" />} />
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
                    title="Tracked applications"
                    right={
                      <TextField
                        size="small"
                        placeholder="Search records..."
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setPaginationModel((prev) => ({ ...prev, page: 0 }));
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchOutlined fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 280, bgcolor: "#fff", borderRadius: 1 }}
                      />
                    }
                  />

                  <Box sx={{ p: 2 }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      getRowId={(row) => row.id}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}
                      pageSizeOptions={[5, 10, 20, 50, 100]}
                      disableRowSelectionOnClick
                      autoHeight
                      sx={{
                        border: "1px solid #DDE3EC",
                        borderRadius: 2,
                        // MUI X DataGrid paints the header/pinned-column
                        // background via this CSS variable, not a plain
                        // background-color — override it directly or the
                        // header text (white, below) ends up invisible
                        // against the variable's default white background.
                        "--DataGrid-containerBackground": NAVY,
                        "--DataGrid-pinnedBackground": NAVY,
                        "& .MuiDataGrid-columnHeaders": {
                          bgcolor: NAVY,
                        },
                        "& .MuiDataGrid-columnHeader": {
                          bgcolor: NAVY,
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 13,
                        },
                        "& .MuiDataGrid-columnSeparator": {
                          color: "rgba(255,255,255,0.3)",
                        },
                        "& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton, & .MuiDataGrid-iconButtonContainer svg": {
                          color: "#fff",
                        },
                        "& .MuiDataGrid-cell": {
                          fontSize: 13,
                        },
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                          backgroundColor: "#F7F9FC",
                        },
                        "& .MuiDataGrid-row:hover": {
                          backgroundColor: MINT_BG,
                        },
                        "& .MuiDataGrid-footerContainer": {
                          borderTop: "1px solid #DDE3EC",
                        },
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(TrackApplication);