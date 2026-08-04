import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Grid,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  downloadTransferDoc,
  getCitizenApplications,
} from "../../services/assessment-services";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getTransferNotice,
  getPropertyTransferDocumentType,
} from "../../services/assessment-services";
import DashBoardContainer from "../layout/dashboard-container";

const TrackApplicationStatus = () => {
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const handleDownload = async (doc) => {
    try {
      const file = await downloadTransferDoc(doc.documentId);

      const blob = new Blob([file], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(url, "_blank");

      // Clean up URL after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const res = await getPropertyTransferDocumentType();
        console.log(" API Response:", res);

        const docList = res?.lstDocVO || [];

        if (Array.isArray(docList) && docList.length > 0) {
          const options = docList.map((item) => item.label);
          console.log("Extracted Options:", options);
          setDocumentTypeOptions(options);
        } else {
          console.warn("No document types found in response:", res);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchDocumentTypes();
  }, []);

  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationNo = searchParams.get("applicationNo");
  const [documentType, setDocumentType] = useState("");

  const handleNoticeClick = async (row) => {
    try {
      navigate("/transfer-notice", {
        state: {
          applicationNo: row.applicationNo,
          trackingId: row.trackingId,
        },
      });
    } catch (err) {
      console.error("Error navigating to notice", err);
    }
  };

  const handleOrderClick = (row) => {
    navigate("/transfer-order", {
      state: {
        applicationNo: row.applicationNo,
        trackingId: row.trackingId,
      },
    });
  };

  const handleViewReceiptClick = (transferId) => {
    navigate("/view-fees", {
      state: { transferId },
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const body = {
          applicationNo: applicationNo,
        };
        // TR2526000259
        const data = await getCitizenApplications(body);
        setRows(data.lstDetails || []);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }
    fetchData();
  }, []);

  return (
    <DashBoardContainer>
      <Box sx={{ maxWidth: "100%", margin: "auto", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBack />}
          // onClick={() => {
          // setOpenViewFee1(false);
          // }}
          onClick={() => navigate("/TrackPropertyApplication")}
          sx={{ mb: 1 }}
        >
          Back
        </Button>

        <TableContainer component={Paper}>
          <Table sx={{ tableLayout: "auto", width: "100%" }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e8f5e9", height: "40px" }}>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    borderRight: "1px solid #ccc",
                    width: "3%",
                  }}
                >
                  Sr No
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    borderRight: "1px solid #ccc",
                    width: "6%",
                  }}
                >
                  Application No
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    borderRight: "1px solid #ccc",
                    width: "6%",
                  }}
                >
                  Applicant Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Application Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Property code
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Property Address
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  New Owner Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Document Type{" "}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    borderRight: "1px solid #ccc",
                    width: "6%",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Reason Of Rejection
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}
                >
                  Transfer Fees
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: "250px" }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      height: "40px",
                      "& .MuiTableCell-root": {
                        lineHeight: "40px",
                        padding: "0 8px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {i + 1}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.applicationNo}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.applicantName}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.applicationDate}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.propertyCode}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        whiteSpace: "pre-line",
                        borderRight: "1px solid #ccc",
                      }}
                    >
                      {row.propertyAddress}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.newOwnerName}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {/* {JSON.stringify(row.lstDocument)} */}
                      {(row.lstDocument || []).map((doc, index) => (
                        <Typography
                          key={doc.documentId}
                          sx={{
                            color: "#1976d2",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "0.85rem",
                            mt: 0.5,
                          }}
                          onClick={() => handleDownload(doc)}
                        >
                          {/* Click to view */}
                          {row.documentType}
                          {/* {doc.documentURL}{" "} */}
                          {/* {row.lstDocument.length > 1 ? `(${index + 1})` : ""} */}
                        </Typography>
                      ))}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.status}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.reasonOfRejection || "-"}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ccc" }}
                    >
                      {row.totalAmount || "-"}
                    </TableCell>

                    <TableCell align="center">
                      {row.flag ? (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {(row.flag === "C" || row.flag === "P") && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() =>
                                handleViewReceiptClick(row.transferId)
                              }
                            >
                              View Fees
                            </Button>
                          )}
                          {row.flag === "O" && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() =>
                                handleViewReceiptClick(row.transferId)
                              }
                            >
                              Reupload Document{" "}
                            </Button>
                          )}

                          {row.flag === "D" && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleViewReceiptClick(row.transferId)
                                }
                              >
                                View Receipt
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => handleNoticeClick(row)}
                              >
                                Notice
                              </Button>
                            </>
                          )}
                          {row.flag === "Z" && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleViewReceiptClick(row.transferId)
                                }
                              >
                                View Receipt
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => handleNoticeClick(row)}
                              >
                                Notice
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleOrderClick(row)}
                              >
                                Generate Order
                              </Button>
                            </>
                          )}
                        </Box>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={11}>
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashBoardContainer>
  );
};

export default TrackApplicationStatus;
