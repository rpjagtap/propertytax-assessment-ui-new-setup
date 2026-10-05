import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Button,
  Card,
  Avatar,
  Chip,
  Divider,
  Typography,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  AssessmentOutlined,
  ListAltOutlined,
  MapOutlined,
} from "@mui/icons-material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import Loader from "../loader/loader";

// Theme tokens (same as Property Transfer Dashboard)
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const SR_W = 56;
const GAT_W = 160;
const stickyShadow = "2px 0 0 rgba(18,35,63,0.08)";

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

const formatDateDMY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
};

const scrollSx = {
  maxHeight: 640,
  overflowX: "auto",
  overflowY: "auto",
  "&::-webkit-scrollbar": { height: 10, width: 10 },
  "&::-webkit-scrollbar-track": { backgroundColor: "#F0F2F5" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(18,35,63,0.35)",
    borderRadius: 10,
    "&:hover": { backgroundColor: "rgba(18,35,63,0.55)" },
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(18,35,63,0.35) #F0F2F5",
};

// Stage columns after Sr No / Gat — totals use `${key}TOT`
const DATA_KEYS = [
  "totalApplications",
  "sr2_generated",
  "sr3_generated",
  "citizenConsent",
  "prashasanAdhikariHearing",
  "prashasanAdhikariHOHearing",
  "assistantCommissionerHearing",
  "hodHearing",
  "additionalCommissionerHearing",
  "gatpramukhSR3",
  "zonalOfficerSR3",
  "prashasanAdhikariSR3",
  "prashasanAdhikariHOSR3",
  "assistantCommissionerSR3",
  "hodSR3",
  "additionalCommissionerSR3",
];

const ShowGatWiseCollection = ({ data, handleBackClick }) => {
  const { loading, error, setError } = useApiState();
  const lang = useSelector((state) => state.userDetails.lang);
  const [formattedDate] = useState(formatDateDMY(new Date()));
  const [formattedTime] = useState(new Date().toLocaleTimeString());
  const [tableLoading] = useState(false);

  const columns = [
    { label: labels.SrNo[lang] },
    { label: labels.Gat[lang] },
    { label: labels.Total[lang] },
    { label: labels.sr2generated[lang] },
    { label: labels.sr3generated[lang] },
    { label: labels.CitizenConsent[lang] },
    { label: labels.PrashasanAdhikariHearing[lang] },
    { label: labels.PrashasanAdhikariHOHearing[lang] },
    { label: labels.AssistantCommissionerHearing[lang] },
    { label: labels.HODHearing[lang] },
    { label: labels.AdditionalCommissionerHearing[lang] },
    { label: labels.GatpramukhSR3[lang] },
    { label: labels.ZonalOfficerSR3[lang] },
    { label: labels.PrashasanAdhikariSR3[lang] },
    { label: labels.PrashasanAdhikariHOSR3[lang] },
    { label: labels.AssistantCommissionerSR3[lang] },
    { label: labels.HODSR3[lang] },
    { label: labels.AdditionalCommissionerSR3[lang] },
  ];

  const rows = data?.lstAssessmentReportVO;
  const zoneName = rows?.[0]?.zoneName || "";

  const headCellSx = (i) => ({
    bgcolor: NAVY,
    color: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    padding: "10px 12px",
    whiteSpace: "normal",
    lineHeight: 1.35,
    verticalAlign: "bottom",
    minWidth: i === 0 ? SR_W : i === 1 ? GAT_W : 110,
    maxWidth: i === 0 ? SR_W : i === 1 ? GAT_W : 110,
    ...(i <= 1 && {
      position: "sticky",
      left: i === 0 ? 0 : SR_W,
      zIndex: 4,
      boxShadow: stickyShadow,
    }),
  });

  const stickyBodySx = (left, bg) => ({
    position: "sticky",
    left,
    zIndex: 1,
    backgroundColor: bg,
    boxShadow: stickyShadow,
  });

  return (
    <Grid>
      {loading && <Loader />}
      {error && (
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => {
            setError("");
          }}
        />
      )}

      {/* ---------- Header band ---------- */}
      <Card elevation={4} sx={{ borderRadius: 3, mt: 2, mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
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
              {`${zoneName} — ${labels.ZoneWiseBuildingPermission[lang]}`}
            </Typography>
            <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
              {`${formattedDate} • ${formattedTime}`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleBackClick}
            startIcon={<ArrowBack />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { bgcolor: "rgba(255,255,255,0.24)", boxShadow: "none" },
            }}
          >
            Back
          </Button>
        </Box>
      </Card>

      {/* ---------- Results card ---------- */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
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
              Gat summary
            </Typography>
          </Stack>
          {!!rows?.length && (
            <Chip
              size="small"
              label={`${rows.length} gats`}
              sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
            />
          )}
        </Box>
        <Divider />

        <TableContainer component={Paper} elevation={0} sx={scrollSx}>
          <Table
            stickyHeader
            sx={{ minWidth: 1200 }}
            size="small"
            aria-label="gat wise building permission report"
          >
            <TableHead>
              <TableRow>
                {columns.map((col, i) => (
                  <TableCell key={i} align="center" sx={headCellSx(i)}>
                    {wrapLabel(col.label)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {tableLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    Please wait, loading data...
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {rows ? (
                  <>
                    {rows.map((item, index) => {
                      // Opaque row colour so scrolled columns don't show
                      // through the sticky cells.
                      const rowBg = index % 2 === 1 ? "#F7F9FC" : "#FFFFFF";
                      return (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            backgroundColor: rowBg,
                            "& td": { padding: "8px 12px", fontSize: "13px" },
                            "&:hover td": { backgroundColor: "#EEF6F3" },
                          }}
                        >
                          <TableCell align="center" sx={stickyBodySx(0, rowBg)}>
                            {index + 1}
                          </TableCell>
                          <TableCell align="left" sx={stickyBodySx(SR_W, rowBg)}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: MINT_BG,
                                  color: MINT,
                                }}
                              >
                                <MapOutlined sx={{ fontSize: 15 }} />
                              </Avatar>
                              <span style={{ fontWeight: 600, color: NAVY }}>
                                {item.gatName}
                              </span>
                            </Stack>
                          </TableCell>

                          {DATA_KEYS.map((key, k) => (
                            <TableCell key={key} align="center">
                              {k === 0 ? (
                                <Chip
                                  size="small"
                                  label={item[key]}
                                  sx={{
                                    bgcolor: "#EEF2FA",
                                    color: NAVY,
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                item[key]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}

                    {/* Total row */}
                    <TableRow
                      sx={{
                        "& td": {
                          bgcolor: "#EEF1F6",
                          color: NAVY,
                          fontWeight: 700,
                          fontSize: "13px",
                          borderTop: "2px solid #DDE3EC",
                        },
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          bgcolor: "#EEF1F6 !important",
                        }}
                      />
                      <TableCell
                        align="center"
                        sx={{
                          position: "sticky",
                          left: SR_W,
                          zIndex: 1,
                          bgcolor: "#EEF1F6 !important",
                        }}
                      >
                        Total
                      </TableCell>
                      {DATA_KEYS.map((key) => (
                        <TableCell key={key} align="center">
                          {data[`${key}TOT`]}
                        </TableCell>
                      ))}
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      {labels.NoRecordFound[lang]}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>
    </Grid>
  );
};

export default ShowGatWiseCollection;