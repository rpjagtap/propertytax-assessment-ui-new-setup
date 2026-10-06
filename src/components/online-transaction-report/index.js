import React, { useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import SelectInput from "../form-fields/select-input";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Divider,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import DateInput from "../form-fields/date-picker";
import FormButtons from "../common/buttons";
import { labels } from "../../lang/labels";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import {
  getOnlineReconsilation,
  saveOnlineReconsilation,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import dayjs from "dayjs";

// Theme tokens — same values used across the other redesigned pages.
// Kept local so this file has no dependency on any shared common/
// component that might not exist in the project.
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

const OnlineTransactionReport = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading } = useApiState();

  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const formik = useFormik({
    initialValues: {
      fromDate: dayjs(),
      toDate: dayjs(),
      consumerNO: "",
      status: "",
    },
    onSubmit: async (values) => {
      const formattedValues = {
        ...values,
        fromDate: dayjs(values.fromDate).format("DD/MM/YYYY"),
        toDate: dayjs(values.toDate).format("DD/MM/YYYY"),
      };

      handleShow(formattedValues);
    },
  });

  const handleShow = async (values) => {
    try {
      setLoading(true);
      setTableLoading(true);

      const res = await getOnlineReconsilation(values);

      if (res?.lst?.length) {
        setFilteredData(res.lst);
      } else {
        setFilteredData([]);
        alert("No records found");
      }
      setSelectAll(false); // reset master checkbox on a fresh search
    } catch (err) {
      showToastError(getErrorMsg(err));
      setFilteredData([]);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setFilteredData([]);
    setSelectAll(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const body = { lst: filteredData };
      const res = await saveOnlineReconsilation(body);
      alert(res?.status || "Saved Successfully!");
    } catch (err) {
      showToastError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
    resetForm();
  };

  // Toggles every row's chkSelect at once, driven by the header checkbox.
  const handleSelectAllChange = (checked) => {
    setSelectAll(checked);
    setFilteredData((prev) => prev.map((row) => ({ ...row, chkSelect: checked })));
  };

  // Keep the header checkbox in sync when rows are (de)selected one by one.
  const handleRowCheckChange = (index, checked) => {
    const updated = [...filteredData];
    updated[index].chkSelect = checked;
    setFilteredData(updated);
    setSelectAll(updated.length > 0 && updated.every((row) => row.chkSelect));
  };

  const selectedCount = filteredData.filter((row) => row.chkSelect).length;

  return (
    <DashBoardContainer>
      <ScrollBottom />
      <ScrollTop />

      <Box sx={{ p: 2 }}>
        {/* ---------- Filter card ---------- */}
        <FormikProvider value={formik}>
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
                <ReceiptLongOutlined />
              </Avatar>
              <Box>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                  Online Transaction Report
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  Reconcile online payments by consumer number, status and date range.
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ px: 3, py: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                  avatar={<SearchOutlined sx={{ color: "text.secondary" }} />}
                  title="Search criteria"
                  titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                  subheader="Filter transactions by consumer number, status and date range"
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <GridRow>
                    <FormLabel label={labels.FromDate[lang]} required />
                    <FormValue
                      component={
                        <DateInput
                          name="fromDate"
                          required
                          value={formik.values.fromDate}
                          onChange={(date) => formik.setFieldValue("fromDate", date)}
                        />
                      }
                    />
                    <FormLabel label={labels.ToDate[lang]} required />
                    <FormValue
                      component={
                        <DateInput
                          name="toDate"
                          required
                          value={formik.values.toDate}
                          onChange={(date) => formik.setFieldValue("toDate", date)}
                        />
                      }
                    />
                  </GridRow>

                  <GridRow>
                    <FormLabel label={labels.ConsumerNo[lang]} />
                    <FormValue component={<TextInput name="consumerNO" />} />

                    <FormLabel label={labels.status[lang]} />
                    <FormValue
                      component={
                        <SelectInput
                          name="status"
                          options={[
                            { label: "Initiated", value: "initiated" },
                            { label: "Successful", value: "successful" },
                            { label: "Pending", value: "pending" },
                          ]}
                        />
                      }
                    />
                  </GridRow>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              <Grid container justifyContent="center">
                <Grid item md={3} p={0}>
                  <FormButtons
                    isValid={false}
                    handleSubmitButtonClick={formik.handleSubmit}
                    resetForm={resetForm}
                    submitBtnLabel="Show"
                    isSubmitIcon={false}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </FormikProvider>

        {/* ---------- Results ---------- */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <ResultsHeader
            title="Transactions"
            right={
              selectedCount > 0 && (
                <Chip
                  label={`${selectedCount} selected`}
                  sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                />
              )
            }
          />

          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={headCellSx}>{labels.SrNo?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>{labels.ConsumerNo?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>{labels.ConsumerName?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>{labels.transactionDate?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>{labels.customerID?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>{labels.Amount?.[lang]}</TableCell>
                    <TableCell align="center" sx={headCellSx}>
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        <Checkbox
                          size="small"
                          checked={selectAll}
                          disabled={!filteredData.length}
                          onChange={(e) => handleSelectAllChange(e.target.checked)}
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            p: 0.5,
                            "&.Mui-checked": { color: "#5DCAA5" },
                          }}
                        />
                        <span>{labels.SelectAll?.[lang]}</span>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length ? (
                    filteredData.map((item, index) => (
                      <TableRow key={index} hover sx={bodyRowSx}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{item.consumerNO}</TableCell>
                        <TableCell align="center">{item.partyName}</TableCell>
                        <TableCell align="center">{item.trasactionDate}</TableCell>
                        <TableCell align="center">{item.customerID}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          {item.amount}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={item.chkSelect || false}
                            onChange={(e) => handleRowCheckChange(index, e.target.checked)}
                            sx={{
                              color: "#DDE3EC",
                              "&.Mui-checked": { color: MINT },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!filteredData.length}
                sx={{
                  px: 3,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: NAVY,
                  "&:hover": { bgcolor: NAVY_LIGHT },
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltOutlined />}
                onClick={resetForm}
                sx={{
                  px: 3,
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: NAVY,
                  color: NAVY,
                  "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </DashBoardContainer>
  );
};

export default React.memo(OnlineTransactionReport);