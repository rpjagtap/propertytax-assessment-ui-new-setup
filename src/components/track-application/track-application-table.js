/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Loader from "../loader/loader";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
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
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import "../assessment-dashboard/styles.css"; // Import the custom CSS
import ArrowBack from "@mui/icons-material/ArrowBack";
import Schema from "@mui/icons-material/Schema";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ApplicationWorkflow from "../application-workflow";
import { getApiBaseUrl } from "../../utils/helpers";

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

const innerHeadCellSx = {
  bgcolor: "#EEF1F6",
  color: NAVY,
  fontWeight: 600,
  fontSize: "12px",
  padding: "6px 10px",
  border: "none",
  textAlign: "center",
};

// Maps a free-text status string to a chip color — falls back to a
// neutral navy tint for statuses not explicitly covered.
const statusChipSx = (status) => {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("complete") || normalized.includes("approved")) {
    return { bgcolor: MINT_BG, color: MINT };
  }
  if (normalized.includes("reject") || normalized.includes("cancel")) {
    return { bgcolor: "#FAECE7", color: "#993C1D" };
  }
  return { bgcolor: "#EEF2FA", color: NAVY };
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

const TrackApplicationTable = ({ data, handleBackClick }) => {
  const [openWorkflowModalId, setOpenWorkflowModalId] = useState("");
  const [pendingAppsData] = useState({
    ...data,
    assessmentFormVOLst: data.assessmentFormVOLst,
  });

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError, success, setSuccess } = useApiState();

  const handleDisplayPDF = async (id) => {
    try {
      const a = document.createElement("a");
      a.href = `${getApiBaseUrl()}/assessment/get-assessment-documents?docId=${id}`;
      a.download = "downloaded-file.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error displaying PDF:", error);
    }
  };

  const handleOpenWorkflowModal = (assessmentId) => {
    setOpenWorkflowModalId(assessmentId);
  };

  return (
    <Box sx={{ p: 2 }}>
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
      {openWorkflowModalId && (
        <ApplicationWorkflow
          setOpenWorkflowModalId={setOpenWorkflowModalId}
          assessmentId={openWorkflowModalId}
        />
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleBackClick}
        startIcon={<ArrowBack />}
        sx={{
          mb: 2,
          textTransform: "none",
          borderRadius: 2,
          bgcolor: NAVY,
          "&:hover": { bgcolor: NAVY_LIGHT },
        }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <ResultsHeader
          title="Tracked application details"
          right={
            <Chip
              label={`${pendingAppsData.assessmentFormVOLst.length} record${
                pendingAppsData.assessmentFormVOLst.length === 1 ? "" : "s"
              }`}
              sx={{ bgcolor: MINT_BG, color: MINT, fontWeight: 600 }}
            />
          }
        />

        <Box sx={{ p: 2 }}>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }} size="small" aria-label="track application details">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={headCellSx}>{labels.SrNo[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.MalakName[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.MalakAddress[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.MobileNo[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.ApplicationStatus[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.SRNumber[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.SRDate[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.SRDocuemnts[lang]}</TableCell>
                  <TableCell align="center" sx={headCellSx}></TableCell>
                  <TableCell align="center" sx={headCellSx}>{labels.Workflow[lang]}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pendingAppsData.assessmentFormVOLst.map((item, index) => (
                  <TableRow key={item.assessmentId} hover sx={{ "& td": { padding: "8px 10px", fontSize: "13px", verticalAlign: "top" } }}>
                    <TableCell align="center">{index + 1}</TableCell>

                    {/* Owner / application / property summary */}
                    <TableCell align="left">
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, color: NAVY }}>
                          {item.ownerName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          {labels.ApplicationNo[lang]}: <b>{item.applicationId}</b>
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          {labels.PropertyNumber[lang]}: <b>{item.propertyCode}</b>
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">{item.propertyAddressMarathi}</TableCell>
                    <TableCell align="center">{item.mobileNo}</TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={item.formStatus}
                        sx={{ fontWeight: 600, ...statusChipSx(item.formStatus) }}
                      />
                    </TableCell>

                    <TableCell align="center">{item.srNumber}</TableCell>
                    <TableCell align="center">{item.srDate}</TableCell>

                    {/* Documents — inner list */}
                    <TableCell>
                      {item.lstAssessmentDocVO.length ? (
                        <Stack spacing={0.5}>
                          {item.lstAssessmentDocVO.map((doc) => (
                            <Link
                              key={doc.docId}
                              onClick={(e) => {
                                e.preventDefault();
                                handleDisplayPDF(doc.docId);
                              }}
                              href="#"
                              underline="none"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: 12,
                                fontWeight: 600,
                                color: MINT,
                              }}
                            >
                              <DescriptionOutlined sx={{ fontSize: 15 }} />
                              {doc.docName}
                            </Link>
                          ))}
                        </Stack>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: "text.secondary", textAlign: "center" }}>
                          {labels.NoRecordFound[lang]}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Assessment details — inner table */}
                    <TableCell>
                      <TableContainer sx={{ border: "1px solid #DDE3EC", borderRadius: 1.5, overflow: "hidden" }}>
                        <Table size="small" aria-label="inner-table">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={innerHeadCellSx}>{labels.useType[lang]}</TableCell>
                              <TableCell sx={innerHeadCellSx}>{labels.secUseType[lang]}</TableCell>
                              <TableCell sx={innerHeadCellSx}>{labels.constructionType[lang]}</TableCell>
                              <TableCell sx={innerHeadCellSx}>{labels.aakarniDate[lang]}</TableCell>
                              <TableCell sx={innerHeadCellSx}>{labels.areaInMeter[lang]}</TableCell>
                              <TableCell sx={innerHeadCellSx}>{labels.taxAmount[lang]}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.assessmentFormDetailsVOLst.map((innerItem, innerIndex) => (
                              <TableRow key={`${item.assessmentId}-${innerIndex}`} hover>
                                <TableCell sx={{ fontSize: 12, border: "none", textAlign: "center" }}>{innerItem.usetype}</TableCell>
                                <TableCell sx={{ fontSize: 12, border: "none", textAlign: "center" }}>{innerItem.subusetype}</TableCell>
                                <TableCell sx={{ fontSize: 12, border: "none", textAlign: "center" }}>{innerItem.constructionType}</TableCell>
                                <TableCell sx={{ fontSize: 12, border: "none", textAlign: "center" }}>{innerItem.assessmentDate}</TableCell>
                                <TableCell sx={{ fontSize: 12, border: "none", textAlign: "center" }}>{innerItem.areaInSqmt}</TableCell>
                                <TableCell sx={{ fontSize: 12, border: "none", fontWeight: 600, textAlign: "center" }}>
                                  {innerItem.ratableValue}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        onClick={() => handleOpenWorkflowModal(item.assessmentId)}
                        endIcon={<Schema />}
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: "none",
                          borderRadius: 1.5,
                          borderColor: NAVY,
                          color: NAVY,
                          "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
                        }}
                      >
                        Workflow
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrackApplicationTable;