import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FormButtons from "../common/buttons";
import * as XLSX from "xlsx";
import { useFormik } from "formik";
import { GridRow } from "../common/custom-form-grid";
import { onlineReconsilationBrowse } from "../../services/assessment-services";

const OnlineTransaction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setSelectedFile(file);
  // };
  const initialState = {};
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.match(/\.(xls|xlsx)$/i)) {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
      return;
    }
    setSelectedFile(file);
  };
  const resetStateData = () => {
    window.location.reload();
  };
  const formik = useFormik({
    initialValues: initialState,
  });

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please choose a file first!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (jsonData.length === 0) {
        alert("Excel file is empty!");
        return;
      }

      // Map JSON to table structure
      const formattedData = jsonData.map((row, index) => ({
        srNo: row["SR.NO."] || index + 1,
        customerId: row["txtcustomerid"] || "",
        department: row["Department"] || "",
        transactionDate: row["Trasaction date"] || "",
        grossAmount: row["gross Amt"] || "",
        netAmount: row["net Amt"] || "",
      }));

      setTableData(formattedData);
      console.log("Table Data:", formattedData); // You can use this data anywhere
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSubmit = async () => {
    if (tableData.length === 0) {
      alert("No table data to submit!");
      return;
    }

    const payload = {
      lst: tableData.map((row) => ({
        customerID: row.customerId,
        department: row.department,
        trasactionDate: row.transactionDate,
        grossAmt: Number(row.grossAmount),
        netAmt: Number(row.netAmount),
      })),
    };

    try {
      const response = await onlineReconsilationBrowse(payload);
      alert(response.status || "Data Saved Successfully");
    } catch (error) {
      alert("Error saving data!");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Heading */}
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Browse Online Transaction Excel
        </Typography>

        {/* File Upload Buttons */}
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Grid item>
            <Button variant="outlined" component="label">
              Choose File
              <input
                type="file"
                hidden
                accept=".xls,.xlsx"
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Typography
                variant="body2"
                sx={{
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "text.secondary",
                }}
              >
                {selectedFile.name}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              sx={{ ml: 2 }}
            >
              Upload
            </Button>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table size="small" sx={{ border: "1px solid #ccc" }}>
            <TableHead sx={{ backgroundColor: "#abd9e3" }}>
              <TableRow>
                <TableCell align="center">Sr No</TableCell>
                <TableCell align="center">Customer ID</TableCell>
                <TableCell align="center">Department</TableCell>
                <TableCell align="center">Transaction Date</TableCell>
                <TableCell align="center">Gross Amount</TableCell>
                <TableCell align="center">Net Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{row.srNo}</TableCell>
                    <TableCell align="center">{row.customerId}</TableCell>
                    <TableCell align="center">{row.department}</TableCell>
                    <TableCell align="center">{row.transactionDate}</TableCell>
                    <TableCell align="center">{row.grossAmount}</TableCell>
                    <TableCell align="center">{row.netAmount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={6}>
                    No Data Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <GridRow>
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
                cancelRedirect={null}
                // isValid={!(formik.isValid && formik.dirty)}
                isValid={!selectedFile ? true : false}
                handleSubmitButtonClick={handleSubmit}
                resetForm={() => {
                  formik.resetForm();
                  resetStateData();
                }}
                submitBtnLabel={"Submit"}
              />
            </Grid>
          </Grid>
        </GridRow>
      </Paper>
    </Box>
  );
};

export default OnlineTransaction;
