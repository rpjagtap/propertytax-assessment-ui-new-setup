import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  GlobalStyles,
} from "@mui/material";
// import TableViewIcon from "@mui/icons-material/TableView";
import { FormikProvider, Form, useFormik } from "formik";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import FormButtons from "../common/buttons";
import DateInput from "../form-fields/date-picker";
import FormTitle from "../form-fields/form-title";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import { getZonewisePropertyTransferReport } from "../../services/assessment-services";
import DashBoardContainer from "../layout/dashboard-container";
// import IconButton from "@mui/material/IconButton";
import GridOnIcon from "@mui/icons-material/GridOn";
import TableViewIcon from "@mui/icons-material/TableView";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { getGatwisePropertyTransferReport } from "../../services/assessment-services";

const ZonewisePropertyTransferReport = () => {
  const today = dayjs();
  const tableRef = useRef();
  const printRef = useRef(null);
  const [zoneData, setZoneData] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showDetailTable, setShowDetailTable] = useState(false);
  const [detailTableData, setDetailTableData] = useState([]);
  const [zoneTotal, setZoneTotal] = useState({});
  const [selectedZone, setSelectedZone] = useState("");

  const fetchData = async (fromDate, toDate) => {
    try {
      setLoading(true);

      const response = await getZonewisePropertyTransferReport({
        fromDate,
        toDate,
      });

      const apiData = response || {};

      setZoneData(apiData?.propertyTransferDetails || []);

      setTotals({
        alltotalApplication: apiData?.alltotalApplication || 0,
        totalgatPending: apiData?.totalgatPending || 0,
        totalZOPending: apiData?.totalZOPending || 0,
        totalPAPending: apiData?.totalPAPending || 0,
        totalPaymentPending: apiData?.totalPaymentPending || 0,
        totalFinalApproval: apiData?.totalFinalApproval || 0,
        totalCompleted: apiData?.totalCompleted || 0,
        totalObjectionPending: apiData?.totalObjectionPending || 0,
        totalRejected: apiData?.totalRejected || 0,
      });

      setShowTable(true);
    } catch (error) {
      console.log(error);
      setZoneData([]);
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      fromDate: dayjs(),
      toDate: dayjs(),
    },
    onSubmit: () => {},
  });

  // const handleSubmitButtonClick = () => {
  //   const from =
  //     dayjs(formik.values.fromDate).format("DD/MM/YYYY") === "Invalid Date"
  //       ? formik.values.fromDate
  //       : dayjs(formik.values.fromDate).format("DD/MM/YYYY");

  //   const to =
  //     dayjs(formik.values.toDate).format("DD/MM/YYYY") === "Invalid Date"
  //       ? formik.values.toDate
  //       : dayjs(formik.values.toDate).format("DD/MM/YYYY");

  //   fetchData(from, to);
  // };
  const handleSubmitButtonClick = () => {
    const from =
      typeof formik.values.fromDate === "string"
        ? formik.values.fromDate
        : dayjs(formik.values.fromDate).format("DD/MM/YYYY");

    const to =
      typeof formik.values.toDate === "string"
        ? formik.values.toDate
        : dayjs(formik.values.toDate).format("DD/MM/YYYY");

    fetchData(from, to);
  };
  // const formatDate = (date) => {
  //   const d = new Date(date);

  //   const day = String(d.getDate()).padStart(2, "0");
  //   const month = String(d.getMonth() + 1).padStart(2, "0");
  //   const year = d.getFullYear();

  //   return `${day}/${month}/${year}`;
  // };

  const formatDate = (date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  // const handleZoneClick = async (zonename) => {
  //   try {
  //     setLoading(true);

  //     setSelectedZone(zonename);

  //     // const body = {
  //     //   fromDate: formatDate(formik.values.fromDate),
  //     //   toDate: formatDate(formik.values.toDate),
  //     //   zoneName: zonename,
  //     // };

  //     const body = {
  //       fromDate: dayjs(formik.values.fromDate).format("DD/MM/YYYY"),
  //       toDate: dayjs(formik.values.toDate).format("DD/MM/YYYY"),
  //       zoneName: zonename,
  //     };

  //     const res = await getGatwisePropertyTransferReport(body);

  //     setDetailTableData(res?.propertyTransferDetails || []);
  //     setZoneTotal(res || {});

  //     setShowTable(false);
  //     setShowDetailTable(true);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const exportToExcel = () => {
  //   const table = tableRef.current;
  //   if (!table) return;

  //   const workbook = XLSX.utils.book_new();
  //   const worksheet = XLSX.utils.table_to_sheet(table);

  //   XLSX.utils.book_append_sheet(workbook, worksheet, "ZoneReport");

  //   const fileName = `Zonewise_Report_${new Date()
  //     .toISOString()
  //     .slice(0, 10)}.xlsx`;

  //   XLSX.writeFile(workbook, fileName);
  // };

  const handleZoneClick = async (zonename) => {
    try {
      setLoading(true);
      setSelectedZone(zonename);

      const fromDate =
        typeof formik.values.fromDate === "string"
          ? formik.values.fromDate
          : dayjs(formik.values.fromDate).format("DD/MM/YYYY");

      const toDate =
        typeof formik.values.toDate === "string"
          ? formik.values.toDate
          : dayjs(formik.values.toDate).format("DD/MM/YYYY");

      const body = {
        fromDate,
        toDate,
        zoneName: zonename,
      };

      console.log(body);

      const res = await getGatwisePropertyTransferReport(body);

      setDetailTableData(res?.propertyTransferDetails || []);
      setZoneTotal(res || {});

      setShowTable(false);
      setShowDetailTable(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const resetStateData = () => {
    window.location.reload();
  };

  const headerStyle = {
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#c0e0ee",
    border: "1px solid #999",
    fontSize: "12px",
  };

  const cellStyle = {
    textAlign: "center",
    border: "1px solid #999",
    fontSize: "12px",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashBoardContainer>
      {/* <GlobalStyles
        styles={{
          "@media print": {
            ".print-hide": {
              display: "none !important",
            },
            "@page": {
              size: "A4",
              margin: "10mm",
            },
            body: {
              margin: 0,
              padding: 0,
            },
          },
        }}
      /> */}
      <GlobalStyles
        styles={{
          "@media print": {
            body: {
              margin: 0,
              padding: 0,
            },

            ".print-hide": {
              display: "none !important",
            },

            ".print-area": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
            },

            ".print-area *": {
              visibility: "visible",
            },

            "body *": {
              visibility: "hidden",
            },

            ".print-area, .print-area *": {
              visibility: "visible",
            },

            "@page": {
              size: "A4",
              margin: "10mm",
            },
          },
        }}
      />

      <Box sx={{ p: 2 }}>
        <Paper elevation={4} sx={{ p: 2, mb: 2 }}>
          <FormTitle title="Zonewise Property Transfer Report" />
          <FormikProvider value={formik}>
            <Form>
              <GridRow>
                <FormLabel label="From Date" required />
                <FormValue component={<DateInput name="fromDate" />} />

                <FormLabel label="To Date" required />
                <FormValue component={<DateInput name="toDate" />} />

                {/* BUTTONS */}
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
                        // cancelRedirect={null}
                        // isValid={!formik.isValid || loading}
                        // isValid={!(formik.isValid && formik.dirty)}
                        isValid={false}
                        handleSubmitButtonClick={handleSubmitButtonClick}
                        resetForm={() => {
                          formik.resetForm();
                          resetStateData();
                        }}
                        submitBtnLabel={"Show"}
                      />
                    </Grid>
                  </Grid>
                </GridRow>
              </GridRow>
            </Form>
          </FormikProvider>
        </Paper>
        {/* <Box
          className="print-hide"
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 2,
            mx: 2,
            mt: 2,
          }}
        >
          <Button variant="contained" onClick={handlePrint}>
            Print
          </Button>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
          <Button variant="contained" onClick={exportToExcel}>
            Export to Excel
          </Button>
        </Box> */}
        <Box
          className="print-hide"
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2, // space between buttons
            mb: 2,
            mx: 2,
            mt: 2,
          }}
        >
          <Button variant="contained" onClick={handlePrint}>
            Print
          </Button>

          {/* <Button variant="contained" onClick={exportToExcel}>
            Export to Excel
          </Button> */}

          {/* <IconButton color="success" onClick={exportToExcel}>
            <TableViewIcon />
          </IconButton> */}

          {/* <Button
            variant="contained"
            color="success"
            startIcon={<SimCardDownloadIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button> */}
        </Box>

        {/* TABLE */}
        {showTable && !showDetailTable && (
          <div ref={printRef} className="print-area">
            <TableContainer component={Paper}>
              <Table
                ref={tableRef}
                size="small"
                sx={{ tableLayout: "fixed", width: "100%" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerStyle}>अ.क्र.</TableCell>
                    <TableCell sx={headerStyle}>झोन</TableCell>
                    <TableCell sx={headerStyle}>एकूण</TableCell>
                    <TableCell sx={headerStyle}>
                      गटप्रमुखाकडे प्रलंबित
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      सहाय्यक मंडल अधिकाऱ्याकडे प्रलंबित
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      प्रशासन अधिकाऱ्याकडे प्रलंबित
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      ऑनलाईन पेमेंट साठी प्रलंबित
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      ऑनलाईन पेमेंट झालेले परंतु प्रशासन अधिकाऱ्याकडे प्रलंबित
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      प्रक्रिया पूर्ण झालेले अर्ज
                    </TableCell>
                    <TableCell sx={headerStyle}>
                      गटप्रमुखाने रद्द केलेले अर्ज
                    </TableCell>
                    <TableCell sx={headerStyle}>रद्द अर्ज</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {zoneData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={cellStyle}>{index + 1}</TableCell>
                      {/* <TableCell sx={cellStyle}>{row.zoneName}</TableCell> */}
                      <TableCell
                        sx={{
                          ...cellStyle,
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                          fontWeight: "bold",
                        }}
                        onClick={() => handleZoneClick(row.zoneName)}
                      >
                        {row.zoneName}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {row.totalApplication}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.gatPending}</TableCell>
                      <TableCell sx={cellStyle}>{row.zopending}</TableCell>
                      <TableCell sx={cellStyle}>{row.papending}</TableCell>
                      <TableCell sx={cellStyle}>{row.paymentPending}</TableCell>
                      <TableCell sx={cellStyle}>{row.finalApproval}</TableCell>
                      <TableCell sx={cellStyle}>{row.completed}</TableCell>
                      <TableCell sx={cellStyle}>
                        {row.objectionPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>{row.rejected}</TableCell>
                    </TableRow>
                  ))}

                  {/* TOTAL */}
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell colSpan={2} sx={cellStyle}>
                      <b>Total</b>
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      {totals.alltotalApplication}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalgatPending}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalZOPending}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalPAPending}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalPaymentPending}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalFinalApproval}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalCompleted}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {totals.totalObjectionPending}
                    </TableCell>
                    <TableCell sx={cellStyle}>{totals.totalRejected}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {showDetailTable && (
          <>
            {/* <Box
              sx={{
                mx: 2,
                mb: 2,
              }}
            >
              <FormTitle title={`${selectedZone} Zone`} />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mx: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setShowDetailTable(false);
                  setShowTable(true);
                }}
              >
                Back
              </Button>
            </Box> */}

            <Box sx={{ mx: 2, mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowDetailTable(false);
                    setShowTable(true);
                  }}
                >
                  Back
                </Button>
              </Box>
              <FormTitle title={`${selectedZone} झोन`} />
            </Box>
            <div ref={printRef} className="print-area">
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerStyle}>अ.क्र.</TableCell>
                      <TableCell sx={headerStyle}>गट</TableCell>
                      <TableCell sx={headerStyle}>एकूण</TableCell>
                      <TableCell sx={headerStyle}>
                        गटप्रमुखाकडे प्रलंबित
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        सहाय्यक मंडल अधिकाऱ्याकडे प्रलंबित
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        प्रशासन अधिकाऱ्याकडे प्रलंबित
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        ऑनलाईन पेमेंट साठी प्रलंबित
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        ऑनलाईन पेमेंट झालेले परंतु प्रशासन अधिकाऱ्याकडे प्रलंबित
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        प्रक्रिया पूर्ण झालेले अर्ज
                      </TableCell>
                      <TableCell sx={headerStyle}>
                        गटप्रमुखाने रद्द केलेले अर्ज
                      </TableCell>
                      <TableCell sx={headerStyle}>रद्द अर्ज</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {detailTableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell sx={cellStyle}>{index + 1}</TableCell>

                        <TableCell sx={cellStyle}>{row.zoneName}</TableCell>

                        <TableCell sx={cellStyle}>
                          {row.totalApplication}
                        </TableCell>

                        <TableCell sx={cellStyle}>{row.gatPending}</TableCell>

                        <TableCell sx={cellStyle}>{row.zopending}</TableCell>

                        <TableCell sx={cellStyle}>{row.papending}</TableCell>

                        <TableCell sx={cellStyle}>
                          {row.paymentPending}
                        </TableCell>

                        <TableCell sx={cellStyle}>
                          {row.finalApproval}
                        </TableCell>

                        <TableCell sx={cellStyle}>{row.completed}</TableCell>
                        <TableCell sx={cellStyle}>
                          {row.objectionPending}
                        </TableCell>
                        <TableCell sx={cellStyle}>{row.rejected}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                      <TableCell colSpan={2} sx={cellStyle}>
                        <b>Total</b>
                      </TableCell>

                      <TableCell sx={cellStyle}>
                        {zoneTotal.alltotalApplication}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalgatPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalZOPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalPAPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalPaymentPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalFinalApproval}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalCompleted}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalObjectionPending}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {zoneTotal.totalRejected}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </>
        )}
      </Box>
    </DashBoardContainer>
  );
};

export default ZonewisePropertyTransferReport;
