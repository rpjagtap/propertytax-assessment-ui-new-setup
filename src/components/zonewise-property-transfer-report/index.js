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
  Link,
  GlobalStyles,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Typography,
  Stack,
  Grid,
} from "@mui/material";
import { FormikProvider, Form, useFormik } from "formik";
import dayjs from "dayjs";
import FormButtons from "../common/buttons";
import DateInput from "../form-fields/date-picker";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import {
  getZonewisePropertyTransferReport,
  getGatwisePropertyTransferReport,
} from "../../services/assessment-services";
import DashBoardContainer from "../layout/dashboard-container";
import {
  ArrowBack,
  AssessmentOutlined,
  SearchOutlined,
  ListAltOutlined,
  MapOutlined,
  PrintOutlined,
} from "@mui/icons-material";

// Theme tokens (same as Property Transfer Dashboard)
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const wrapLabel = (label) => {
  if (!label || typeof label !== "string") return label;
  const words = label.trim().split(/\s+/);
  if (words.length <= 1) return label;
  const mid = Math.ceil(words.length / 2);
  return (
    <>
      {words.slice(0, mid).join(" ")}
      <br />
      {words.slice(mid).join(" ")}
    </>
  );
};

const COLUMN_LABELS = [
  "अ.क्र.",
  null, // Zone / Gat — filled in per-table
  "एकूण",
  "गटप्रमुखाकडे प्रलंबित",
  "सहाय्यक मंडल अधिकाऱ्याकडे प्रलंबित",
  "प्रशासन अधिकाऱ्याकडे प्रलंबित",
  "ऑनलाईन पेमेंट साठी प्रलंबित",
  "ऑनलाईन पेमेंट झालेले परंतु प्रशासन अधिकाऱ्याकडे प्रलंबित",
  "प्रक्रिया पूर्ण झालेले अर्ज",
  "गटप्रमुखाने रद्द केलेले अर्ज",
  "रद्द अर्ज",
];

const scrollSx = {
  overflowX: "auto",
  "&::-webkit-scrollbar": { height: 10 },
  "&::-webkit-scrollbar-track": { backgroundColor: "#F0F2F5" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(18,35,63,0.35)",
    borderRadius: 10,
    "&:hover": { backgroundColor: "rgba(18,35,63,0.55)" },
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(18,35,63,0.35) #F0F2F5",
};

const headCellSx = (i) => ({
  bgcolor: NAVY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "10px 12px",
  whiteSpace: "normal",
  lineHeight: 1.35,
  minWidth: i === 0 ? 56 : i === 1 ? 130 : 110,
});

const bodyRowSx = { "& td": { padding: "8px 12px", fontSize: "13px" } };

const totalRowSx = {
  "& td": {
    bgcolor: "#EEF1F6",
    color: NAVY,
    fontWeight: 700,
    fontSize: "13px",
    borderTop: "2px solid #DDE3EC",
  },
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
          <ListAltOutlined fontSize="small" />
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

const ZonewisePropertyTransferReport = () => {
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
    initialValues: { fromDate: dayjs(), toDate: dayjs() },
    onSubmit: () => {},
  });

  const toDateStr = (v) =>
    typeof v === "string" ? v : dayjs(v).format("DD/MM/YYYY");

  const handleSubmitButtonClick = () => {
    fetchData(toDateStr(formik.values.fromDate), toDateStr(formik.values.toDate));
  };

  const handleZoneClick = async (zonename) => {
    try {
      setLoading(true);
      setSelectedZone(zonename);
      const res = await getGatwisePropertyTransferReport({
        fromDate: toDateStr(formik.values.fromDate),
        toDate: toDateStr(formik.values.toDate),
        zoneName: zonename,
      });
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

  const resetStateData = () => window.location.reload();
  const handlePrint = () => window.print();

  const renderRows = (rows, isZoneTable) =>
    rows.map((row, index) => (
      <TableRow key={index} hover sx={bodyRowSx}>
        <TableCell align="center">{index + 1}</TableCell>
        <TableCell align="left">
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{ width: 28, height: 28, bgcolor: MINT_BG, color: MINT }}
            >
              <MapOutlined sx={{ fontSize: 15 }} />
            </Avatar>
            {isZoneTable ? (
              <Link
                onClick={() => handleZoneClick(row.zoneName)}
                component="button"
                sx={{ fontWeight: 600, color: MINT, fontSize: "13px" }}
              >
                {row.zoneName}
              </Link>
            ) : (
              <span style={{ fontWeight: 600 }}>{row.zoneName}</span>
            )}
          </Stack>
        </TableCell>
        <TableCell align="center">
          <Chip
            size="small"
            label={row.totalApplication}
            sx={{ bgcolor: "#EEF2FA", color: NAVY, fontWeight: 600 }}
          />
        </TableCell>
        <TableCell align="center">{row.gatPending}</TableCell>
        <TableCell align="center">{row.zopending}</TableCell>
        <TableCell align="center">{row.papending}</TableCell>
        <TableCell align="center">{row.paymentPending}</TableCell>
        <TableCell align="center">{row.finalApproval}</TableCell>
        <TableCell align="center">{row.completed}</TableCell>
        <TableCell align="center">{row.objectionPending}</TableCell>
        <TableCell align="center">{row.rejected}</TableCell>
      </TableRow>
    ));

  const renderTotalRow = (t) => (
    <TableRow sx={totalRowSx}>
      <TableCell colSpan={2} align="center">
        Total
      </TableCell>
      <TableCell align="center">{t.alltotalApplication}</TableCell>
      <TableCell align="center">{t.totalgatPending}</TableCell>
      <TableCell align="center">{t.totalZOPending}</TableCell>
      <TableCell align="center">{t.totalPAPending}</TableCell>
      <TableCell align="center">{t.totalPaymentPending}</TableCell>
      <TableCell align="center">{t.totalFinalApproval}</TableCell>
      <TableCell align="center">{t.totalCompleted}</TableCell>
      <TableCell align="center">{t.totalObjectionPending}</TableCell>
      <TableCell align="center">{t.totalRejected}</TableCell>
    </TableRow>
  );

  const renderTable = (firstColLabel, rows, isZoneTable, t, ariaLabel) => (
    <TableContainer component={Paper} elevation={0} sx={scrollSx}>
      <Table size="small" aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {COLUMN_LABELS.map((label, i) => (
              <TableCell key={i} align="center" sx={headCellSx(i)}>
                {wrapLabel(i === 1 ? firstColLabel : label)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {renderRows(rows, isZoneTable)}
          {renderTotalRow(t)}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <DashBoardContainer>
      <GlobalStyles
        styles={{
          "@media print": {
            body: { margin: 0, padding: 0 },
            ".print-hide": { display: "none !important" },
            ".print-area": { position: "absolute", left: 0, top: 0, width: "100%" },
            "body *": { visibility: "hidden" },
            ".print-area, .print-area *": { visibility: "visible" },
            "@page": { size: "A4", margin: "10mm" },
          },
        }}
      />

      <Box sx={{ p: 2 }}>
        {/* ---------- Filter card ---------- */}
        <FormikProvider value={formik}>
          <Form>
            <Card
              className="print-hide"
              elevation={4}
              sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}
            >
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
                  <AssessmentOutlined />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    Zonewise Property Transfer Report
                  </Typography>
                  <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                    Select a date range to view zone-wise status of property
                    transfer applications.
                  </Typography>
                </Box>
                {showTable && !!zoneData.length && (
                  <Chip
                    icon={<ListAltOutlined sx={{ color: `${MINT} !important` }} />}
                    label={`${zoneData.length} zones`}
                    sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
                  />
                )}
              </Box>

              <CardContent sx={{ px: 3, py: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardHeader
                    avatar={<SearchOutlined sx={{ color: "text.secondary" }} />}
                    title="Search criteria"
                    titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                    subheader="Choose the from and to date for the report"
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <GridRow>
                      <FormLabel label="From Date" required />
                      <FormValue component={<DateInput name="fromDate" />} />
                      <FormLabel label="To Date" required />
                      <FormValue component={<DateInput name="toDate" />} />
                    </GridRow>
                  </CardContent>
                </Card>

                <Divider sx={{ my: 3 }} />

                <Grid container justifyContent="center">
                  <Grid item md={4} p={0}>
                    <FormButtons
                      isValid={false}
                      handleSubmitButtonClick={handleSubmitButtonClick}
                      resetForm={() => {
                        formik.resetForm();
                        resetStateData();
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

        {/* ---------- ZONE SUMMARY ---------- */}
        {showTable && !showDetailTable && (
          <div ref={printRef} className="print-area">
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <ResultsHeader
                title="Zone summary"
                right={
                  <Button
                    className="print-hide"
                    variant="contained"
                    startIcon={<PrintOutlined />}
                    onClick={handlePrint}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: NAVY,
                      "&:hover": { bgcolor: NAVY_LIGHT },
                    }}
                  >
                    Print
                  </Button>
                }
              />
              {renderTable(
                "झोन",
                zoneData,
                true,
                totals,
                "zonewise property transfer report",
              )}
            </Paper>
          </div>
        )}

        {/* ---------- GAT-WISE DETAIL ---------- */}
        {showDetailTable && (
          <>
            <Button
              className="print-hide"
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => {
                setShowDetailTable(false);
                setShowTable(true);
              }}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: NAVY,
                "&:hover": { bgcolor: NAVY_LIGHT },
                mb: 2,
              }}
            >
              Back
            </Button>

            <div ref={printRef} className="print-area">
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                <ResultsHeader
                  title={`${selectedZone} झोन — Gat-wise report`}
                  right={
                    <Button
                      className="print-hide"
                      variant="contained"
                      startIcon={<PrintOutlined />}
                      onClick={handlePrint}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        bgcolor: NAVY,
                        "&:hover": { bgcolor: NAVY_LIGHT },
                      }}
                    >
                      Print
                    </Button>
                  }
                />
                {renderTable(
                  "गट",
                  detailTableData,
                  false,
                  zoneTotal,
                  "gatwise property transfer report",
                )}
              </Paper>
            </div>
          </>
        )}
      </Box>
    </DashBoardContainer>
  );
};

export default ZonewisePropertyTransferReport;