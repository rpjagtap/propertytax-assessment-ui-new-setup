import React, { useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import SelectInput from "../form-fields/select-input";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  Button,
  Box,
} from "@mui/material";

import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import FormTitle from "../form-fields/form-title";
import DateInput from "../form-fields/date-picker";
import TextInput from "../form-fields/text-input";
import FormButtons from "../common/buttons";
import { RenderTableHead } from "../common/table";
import { labels } from "../../lang/labels";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import {
  getOnlineReconsilation,
  saveOnlineReconsilation,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import dayjs from "dayjs";

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
    // onSubmit: async (values) => handleShow(values),
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

  return (
    <DashBoardContainer>
      <ScrollBottom />
      <ScrollTop />

      <FormikProvider value={formik}>
        <Paper
          elevation={4}
          sx={{
            marginBottom: "15px",
            paddingBottom: 2,
            marginTop: "10px",
          }}
        >
          <FormTitle
            title="Online Transaction Report"
            sx={{ textAlign: "center" }}
          />

          <GridRow>
            <FormLabel label={labels.FromDate[lang]} required />{" "}
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

          <Grid container justifyContent="center">
            <Grid item md={3} p={2}>
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
        </Paper>
      </FormikProvider>

      <Paper>
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650, borderCollapse: "collapse" }}
            size="small"
          >
            <RenderTableHead
              thSx={{ bgcolor: "#abd9e3", fontWeight: 600, fontSize: "13px" }}
              trSx={{
                "& th": { border: "1px solid grey", padding: "4px 8px" },
              }}
              cells={[
                labels.SrNo?.[lang],
                labels.ConsumerNo?.[lang],
                labels.ConsumerName?.[lang],
                labels.transactionDate?.[lang],
                labels.customerID?.[lang],
                labels.Amount?.[lang],
                labels.SelectAll?.[lang],
              ]}
            />

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "& td": {
                        border: "1px solid grey",
                        padding: "4px 8px",
                        fontSize: "13px",
                      },
                    }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{item.consumerNO}</TableCell>
                    <TableCell align="center">{item.partyName}</TableCell>
                    <TableCell align="center">{item.trasactionDate}</TableCell>
                    <TableCell align="center">{item.customerID}</TableCell>
                    <TableCell align="center">{item.amount}</TableCell>
                    {/* <TableCell align="center">{item.chkSelect}</TableCell> */}
                    <TableCell align="center">
                      <input
                        type="checkbox"
                        checked={item.chkSelect || false}
                        onChange={(e) => {
                          const updated = [...filteredData];
                          updated[index].chkSelect = e.target.checked;
                          setFilteredData(updated);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <button
          style={{
            padding: "6px 20px",
            marginRight: "10px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleSave}
        >
          Save
        </button>

        <button
          style={{
            padding: "6px 20px",
            background: "#ed6c02",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={resetForm}
        >
          Reset
        </button>
      </div>
    </DashBoardContainer>
  );
};

export default React.memo(OnlineTransactionReport);
