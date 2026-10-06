import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
} from "@mui/material";
import FormButtons from "../common/buttons";
import * as XLSX from "xlsx";
import { useFormik } from "formik";
import { GridRow } from "../common/custom-form-grid";
import { onlineReconsilationBrowse } from "../../services/assessment-services";
import DashBoardContainer from "../layout/dashboard-container";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";

// Theme tokens — same values used across the other redesigned pages.
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

const OnlineTransactionExcel = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);

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

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (jsonData.length === 0) {
        alert("Excel file is empty!");
        return;
      }

      const formattedData = jsonData.map((row, index) => ({
        srNo: row["SR.NO."] || index + 1,
        customerId: row["txtcustomerid"] || "",
        department: row["Department"] || "",
        transactionDate: row["Trasaction date"] || "",
        grossAmount: row["gross Amt"] || "",
        netAmount: row["net Amt"] || "",
      }));

      setTableData(formattedData);
      console.log("Table Data:", formattedData);
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
    resetStateData();
  };

  return (
    <DashBoardContainer>
      <Box sx={{ p: 2 }}>
        {/* ---------- Upload card ---------- */}
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
              <UploadFileOutlined />
            </Avatar>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                Browse Online Transaction Excel
              </Typography>
              <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                Upload an Excel file (.xls or .xlsx) to preview and reconcile online transactions.
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ px: 3, py: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader
                avatar={<InsertDriveFileOutlined sx={{ color: "text.secondary" }} />}
                title="Select file"
                titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                subheader="Choose an Excel file and upload it to generate a preview below"
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="center"
                >
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: NAVY,
                      color: NAVY,
                      "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
                    }}
                  >
                    Choose File
                    <input type="file" hidden accept=".xls,.xlsx" onChange={handleFileChange} />
                  </Button>

                  {selectedFile ? (
                    <Chip
                      icon={<InsertDriveFileOutlined sx={{ color: `${MINT} !important` }} />}
                      label={selectedFile.name}
                      sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      No file chosen
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: MINT,
                      "&:hover": { bgcolor: "#0B5A46" },
                    }}
                  >
                    Upload
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* ---------- Preview results ---------- */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <ResultsHeader
            title="Transaction preview"
            right={
              tableData.length > 0 && (
                <Chip
                  label={`${tableData.length} row${tableData.length === 1 ? "" : "s"}`}
                  sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                />
              )
            }
          />

          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={headCellSx}>Sr No</TableCell>
                    <TableCell align="center" sx={headCellSx}>Customer ID</TableCell>
                    <TableCell align="center" sx={headCellSx}>Department</TableCell>
                    <TableCell align="center" sx={headCellSx}>Transaction Date</TableCell>
                    <TableCell align="center" sx={headCellSx}>Gross Amount</TableCell>
                    <TableCell align="center" sx={headCellSx}>Net Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <TableRow key={index} hover sx={{ "& td": { padding: "8px 12px", fontSize: "13px" } }}>
                        <TableCell align="center">{row.srNo}</TableCell>
                        <TableCell align="center">{row.customerId}</TableCell>
                        <TableCell align="center">{row.department}</TableCell>
                        <TableCell align="center">{row.transactionDate}</TableCell>
                        <TableCell align="center">{row.grossAmount}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          {row.netAmount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 4, color: "text.secondary" }}>
                        No Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <GridRow>
              <Grid container justifyContent="center" alignItems="center">
                <Grid item md={3} p={0} sx={{ mt: 3 }}>
                  <FormButtons
                    cancelRedirect={"/home"}
                    isValid={!selectedFile ? true : false}
                    handleSubmitButtonClick={handleSubmit}
                    resetForm={() => window.location.reload()}
                    cancelBtnLabel="Cancel"
                    submitBtnLabel={"Submit"}
                  />
                </Grid>
              </Grid>
            </GridRow>
          </Box>
        </Paper>
      </Box>
    </DashBoardContainer>
  );
};

export default OnlineTransactionExcel;