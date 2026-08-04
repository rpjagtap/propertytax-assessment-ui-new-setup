import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tab,
  List,
  ListItem,
  ListItemText,
  Link,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import DashboardHeader from "../layout/dashboard-header";
import { useSearchParams } from "react-router-dom";
import { citizenConsentPDF, citizenConsentApplication, objList } from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getApiBaseUrl, getErrorMsg } from "../../utils/helpers";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const CitizenConsent = () => {
  const [searchParams] = useSearchParams();
  const applicationNo = searchParams.get("applicationNo");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResponse, setUserResponse] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [remark, setRemark] = useState("");
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [action, setAction] = React.useState("");
  const [value, setValue] = React.useState("1");
  const [documents, setDocuments] = React.useState([]);
  const [objectionList, setObjectionList] = React.useState("");
  const [selectedObjections, setSelectedObjections] = React.useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOpen = (action) => {
    // if (action === "Reject") {
    //     setAction("Objection");
    // } else {
    // }
    setAction(action);
    setOpen(true);
    if (action !== "Reject") {
      //setObjectionList([]); // Reset selections if not rejecting
    }

  };


  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    // Handle the action (Accept or Reject) based on the 'action' state
    //console.log(`Confirmed: ${action}`);
    handleClose();
    handleAction(action);
  };
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const [response, objectionListRes] = await Promise.all([citizenConsentPDF(applicationNo), objList()]);
        const uint8ArrayString = response.uint8Array;
        setDocuments(response.lstAssessmentDocVO);
        setAssessmentId(response.assessmentId);
        setObjectionList(objectionListRes.lstObjection);



        if (uint8ArrayString) {
          // Parse the string to an array of numbers
          const byteArray = JSON.parse(uint8ArrayString);
          // Convert the array to a Uint8Array
          const uint8Array = new Uint8Array(byteArray);

          // Create a Blob from the Uint8Array
          const blob = new Blob([uint8Array], { type: "application/pdf" });
          // Generate a URL for the Blob
          const blobUrl = URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
        } else {
          throw new Error("Failed to fetch PDF data");
        }
      } catch (error) {
        // console.error("Error loading PDF:", error);
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }

    };

    getData();
    // eslint-disable-next-line
  }, []);

  const handleCheckboxChange = (reason) => {
    setSelectedObjections((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason) // Remove if already selected
        : [...prev, reason] // Add if not selected
    );
  };

  const handleAction = async (action) => {
    try {
      setLoading(true);

      /*if (!remark.trim()) {
        showToastError("Please enter remark.");
        return;
      }*/
      if (action === "Reject" && selectedObjections.length === 0) {
        showToastError("Please select at least one objection for rejection.");
        return;
      }

      if (action === "Accept" && !remark.trim()) {
        showToastError("Please enter a remark for acceptance.");
        return;
      }

      // Set remark based on action
      const finalRemark = action === "Reject" ? selectedObjections.join(", ") : remark;


      const requestData = {
        assessmentFormVOLst: [
          {
            revertFormVO: {
              revertAction: action, // Accept or Reject
              remark: finalRemark,
            },
            assessmentId: assessmentId,
          },
        ],
      };
      await citizenConsentApplication(requestData);

      if (action === "Accept") {
        setUserResponse("accepted");
      } else if (action === "Reject") {
        setUserResponse("rejected");
      }
      setButtonsVisible(false);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <DashboardHeader />
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Citizen">
            <Tab label="Citizen Consent" value="1" />
            <Tab label="Download Documents" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Box display="flex" flexDirection="column" alignItems="center" height="100vh" padding={2}>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Confirm Action</DialogTitle>
              {action !== "Reject" && (
                <DialogContent>Are you sure you want to {action}?</DialogContent>
              )}

              {action === "Reject" && (
                <div>
                  <DialogContent><label>Please select at least one objection:</label></DialogContent>

                  {objectionList.map((item, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        value={item.value}
                        checked={selectedObjections.includes(item.value)}
                        onChange={() => handleCheckboxChange(item.value)}
                      />
                      <label>{item.label}</label>
                    </div>
                  ))}
                </div>
              )}
              <DialogActions>
                <Button onClick={handleClose} color="error" variant="contained">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} autoFocus color="success" variant="contained">
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
            <Paper
              elevation={3}
              sx={{
                width: "70%",
                height: "100%", // Adjust height as needed
                borderRadius: "8px",
                boxShadow: 3,
                overflow: "hidden",
                display: "flex", // Add flex to allow vertical alignment
                flexDirection: "column",
              }}
            >
              <Alert severity="info">Please Accept or Reject Application from below</Alert>
              {/* PDF Viewer Container */}
              <Box
                sx={{
                  height: "80%", // Adjust height to accommodate iframe and consent section
                }}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="PDF Viewer"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="error">
                    Failed to load PDF. Please try again later.
                  </Typography>
                )}
              </Box>

              {/* Consent Section */}
              <Box
                sx={{
                  padding: 2,
                  textAlign: "center",
                  marginTop: 2, // Adjust margin as needed
                }}
              >
                <Typography variant="body1" gutterBottom>
                  Please review the document above and provide your consent.
                </Typography>
                <TextField
                  inputProps={{ maxLength: 350 }}
                  variant="outlined"
                  label="Remark"
                  name="remark"
                  required
                  size="small"
                  sx={{ width: "60%" }}
                  multiline
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <Box mt={2} display="flex" justifyContent="center" gap={2}>
                  {buttonsVisible && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleOpen("Accept")}
                        disabled={loading || !pdfUrl}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpen("Reject")}
                        disabled={loading || !pdfUrl}
                      >
                        Objection
                      </Button>
                    </>
                  )}
                </Box>
                {userResponse && (
                  <Typography
                    variant="body2"
                    sx={{
                      marginTop: 2,
                      color: userResponse === "accepted" ? "green" : "red",
                    }}
                  >
                    You have {userResponse === "accepted" ? "accepted" : "objection"} the consent.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </TabPanel>
        <TabPanel value="2">
          <>
            {documents.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                No documents available
              </Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <Card sx={{ maxWidth: "50%", width: "100%", textAlign: "center" }}>
                  <CardContent>
                    <List >
                      {documents.map((doc, index) => (
                        <ListItem key={index} divider>
                          <ListItemText>
                            <Link
                              href={`${getApiBaseUrl()}/assessment/get-assessment-documents?docId=${doc.docId
                                }`}
                              download
                              target="_blank"
                              rel="noopener"
                            >
                              {doc.docName}
                            </Link>
                            <IconButton
                              onClick={() =>
                                handleDownload(
                                  `${getApiBaseUrl()}/assessment/get-assessment-documents?docId=${doc.docId}`
                                )
                              }
                            >
                              <img src="/pdf-icon-1.jpg" alt="Icon" width={40} height={35} />
                            </IconButton>
                          </ListItemText>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        </TabPanel>
      </TabContext>
    </>
  );
};

export default CitizenConsent;
