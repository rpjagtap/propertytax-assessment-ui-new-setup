/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Loader from "../loader/loader";
import {
  Button,
  Divider,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextareaAutosize,
} from "@mui/material";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { RenderTableHead } from "../common/table";
import "../assessment-dashboard/styles.css"; // Import the custom CSS
import { ArrowBack, Schema } from "@mui/icons-material";
import { getPDF } from "../../services/assessment-services";
import ApplicationWorkflow from "../application-workflow";
import { getApiBaseUrl } from "../../utils/helpers";

const TrackApplicationTable = ({ data, handleBackClick }) => {
  // const initialState = {};
  console.log(data);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [openWorkflowModalId, setOpenWorkflowModalId] = useState("");
  const [pendingAppsData, setPendingAppsData] = useState({
    ...data,
    //assessmentFormVOLst: data.assessmentFormVOLst.slice(0, 4),
    assessmentFormVOLst: data.assessmentFormVOLst,
  });

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError, success, setSuccess } = useApiState();

  const handleDisplayPDF = async (id) => {
    try {
      //console.log("id is",id);

      const a = document.createElement("a");
      
      a.href = `${getApiBaseUrl()}/assessment/get-assessment-documents?docId=${id}`; // Direct path or URL to the PDF file
      a.download = "downloaded-file.pdf"; // The filename for the downloaded file
      document.body.appendChild(a); // Append to the DOM
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up

      // Make an API call to get the PDF as a byte array
      // //const pdfRes = await getPDF(id);

      // const binaryData = new Uint8Array([...pdfRes].map(char => char.charCodeAt(0)));
      // // Create a Blob from the binary data
      // const blob = new Blob([binaryData], { type: 'application/pdf' });
      // const pdfUrl = URL.createObjectURL(blob);
      // console.log(blob);
      // console.log(pdfUrl);
      // const a = document.createElement('a');
      // a.href = pdfUrl;
      // a.download = 'test.pdf';
      // a.click();
      //window.open(pdfUrl, '_blank');
      //setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

      //             console.log(pdfRes.slice(0, 100)); // Check the beginning of the string
      //             const blob = new Blob([pdfRes], { type: 'application/pdf' });
      // const pdfUrl = URL.createObjectURL(blob);
      // window.open(pdfUrl, '_blank');
      // setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

      // console.log("PDF content type is",typeof pdfRes);
      // const encoder = new TextEncoder();
      // const binaryData = encoder.encode(pdfRes);

      // // Create a Blob and open the PDF
      // const blob = new Blob([binaryData], { type: 'application/pdf' });
      // const pdfUrl = URL.createObjectURL(blob);
      // window.open(pdfUrl, '_blank');

      // Optional cleanup
      //setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

      //             console.log("PDF content type is",typeof pdfRes);
      // console.log(pdfRes);
      // console.log("first few characters", pdfRes.slice(0, 100)); // Check the beginning of the string

      //             const byteArray = Uint8Array.from(atob(pdfRes), char => char.charCodeAt(0));
      // const blob = new Blob([byteArray], { type: "application/pdf" });
      // const pdfUrl = URL.createObjectURL(blob);
      // window.open(pdfUrl, "_blank");

      // // Get the byte array from the response
      // //const byteArray = await pdfRes.arrayBuffer(); // Ensure you fetch the response as binary data

      // // Create a Blob from the byte array
      // const blob = new Blob([pdfRes], { type: "application/pdf" });

      // // Generate a URL for the Blob
      // const pdfUrl = URL.createObjectURL(blob);

      // // Open the PDF in a new tab
      // window.open(pdfUrl, "_blank");

      // // Optional cleanup
      // setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error("Error displaying PDF:", error);
    }
  };

  const handleOpenWorkflowModal = (assessmentId) => {
    setOpenWorkflowModalId(assessmentId);
  };

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
      {openWorkflowModalId && (
        <ApplicationWorkflow
          setOpenWorkflowModalId={setOpenWorkflowModalId}
          assessmentId={openWorkflowModalId}
        />
      )}
      <Grid sx={{ margin: 2 }}>
        <Button variant="contained" color="primary" onClick={handleBackClick} startIcon={<ArrowBack />}>
          Back
        </Button>
      </Grid>
      {/* <Paper sx={{ marginTop: "15px" }}> */}
      <Grid>
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 600, border: 1, borderColor: "grey.300" }}
            size="small"
            aria-label="a dense table"
          >
            <RenderTableHead
              thSx={{ bgcolor: "#abd9e3", fontWeight: 600 }}
              trSx={{
                "& th": {
                  border: "1px solid grey",
                  padding: 0,
                  margin: 0,
                },
              }}
              cells={[
                labels.SrNo[lang],
                labels.MalakName[lang],
                labels.MalakAddress[lang],
                labels.MobileNo[lang],
                labels.ApplicationStatus[lang],
                labels.SRNumber[lang],
                labels.SRDate[lang],
                labels.SRDocuemnts[lang],
                "",
                labels.Workflow[lang],
                "",
              ]}
            />
            <TableBody>
              {pendingAppsData.assessmentFormVOLst.map((item, index) => {
                return (
                  <TableRow
                    key={item.assessmentId}
                    sx={{
                      "& td": { border: "1px solid grey" },
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {" "}
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">
                      <>
                        {item.ownerName}
                        <Divider />
                        <b>
                          {labels.ApplicationNo[lang]} - {item.applicationId}
                        </b>
                        <Divider />
                        <b>
                          {labels.PropertyNumber[lang]} - {item.propertyCode}
                        </b>
                        <Divider />
                      </>
                    </TableCell>
                    <TableCell align="center">{item.propertyAddressMarathi}</TableCell>
                    <TableCell align="center">{item.mobileNo}</TableCell>
                    <TableCell align="center">{item.formStatus}</TableCell>
                    <TableCell align="center">{item.srNumber}</TableCell>
                    <TableCell align="center">{item.srDate}</TableCell>
                    <TableCell>
                      <Table size="small" aria-label="inner-table" sx={{ margin: "4px" }}>
                        <RenderTableHead
                          thSx={{ bgcolor: "#cbd5d7", fontWeight: 600 }}
                          trSx={{
                            "& th": {
                              border: "1px solid black",
                              padding: 0,
                              margin: 0,
                            },
                          }}
                          cells={
                            [
                              // labels.DocName[lang],
                            ]
                          }
                        />
                        <TableBody>
                          {item.lstAssessmentDocVO.length ? (
                            <>
                              {item.lstAssessmentDocVO.map((innerItem1, innerIndex1) => {
                                return (
                                  <TableRow key={innerItem1.docId}>
                                    <TableCell align="center" style={{ border: "none" }}>
                                      <Link
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleDisplayPDF(innerItem1.docId);
                                        }}
                                        href="#"
                                        underline="none"
                                      >
                                        {innerItem1.docName}
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              <TableRow>
                                <TableCell align="center" style={{ border: "none" }}>
                                  {labels.NoRecordFound[lang]}
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </TableCell>
                    <TableCell>
                      <Table size="small" aria-label="inner-table" sx={{ margin: "4px" }}>
                        <RenderTableHead
                          thSx={{ bgcolor: "#cbd5d7", fontWeight: 600 }}
                          trSx={{
                            "& th": {
                              border: "1px solid black",
                              padding: 0,
                              margin: 0,
                            },
                          }}
                          cells={[
                            labels.useType[lang],
                            labels.secUseType[lang],
                            labels.constructionType[lang],
                            labels.aakarniDate[lang],
                            labels.areaInMeter[lang],
                            labels.taxAmount[lang],
                          ]}
                        />
                        <TableBody>
                          
                          
                          {item.assessmentFormDetailsVOLst.map((innerItem, innerIndex) => {
                            return (
                              <TableRow key={item.assessmentDetailId}>
                                <TableCell>{innerItem.usetype}</TableCell>
                                <TableCell>{innerItem.subusetype}</TableCell>
                                <TableCell>{innerItem.constructionType}</TableCell>
                                <TableCell>{innerItem.assessmentDate}</TableCell>
                                <TableCell>{innerItem.areaInSqmt}</TableCell>
                                <TableCell>{innerItem.ratableValue}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          handleOpenWorkflowModal(item.assessmentId);
                        }}
                        endIcon={<Schema />}
                        disabled={false}
                        sx={{
                          marginTop: "8px",
                        }}
                        variant="outlined"
                      >
                        Workflow
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {/* </Paper> */}
    </Grid>
  );
};

export default TrackApplicationTable;
