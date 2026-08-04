import React, { useState } from "react";
import { Box, Button, Typography, Grid, TextField, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"; // Import navigation hook
import {
  citizenConsentApplications,
  getreuploadDocument,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getApiErrorMessage } from "../../utils/helpers";

const ReuploadDocument = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const location = useLocation();
  // const transferId = location.state?.transferId;
  const transferId =
    location.state?.transferId || searchParams.get("transferId");

  if (!transferId) {
    showToastError("Transfer ID not found");
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      // setSelectedFile(file);
      const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

      // Usage
      convertFileToBase64(file)
        .then((base64String) => {
          // base64String contains the file content encoded in base64
          console.log(base64String);
          setSelectedFile(base64String); // or separate state for base64
        })
        .catch((error) => {
          console.error("Error converting file to base64:", error);
        });
    } else {
      alert("Please select a valid PDF file");
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      showToastError("Please select a PDF file first.");
      // showToastError(getApiErrorMessage(error));
      return;
    }
    // navigate(-1);

    try {
      setIsUploading(true);
      const requestData = {
        revertFormVO: {
          revertAction: "Accept", // Accept or Reject
          remark: "Document re-Upload",
        },
        transferId: transferId,
      };

      const res = await citizenConsentApplications(requestData);
      // if (res?.status === "Success") {
      //   showToastSuccess(res?.message || "Document saved successfully!");
      //   handleBack();
      // } else {
      //   showToastError(res?.message || "Failed to saved document!");
      // }
      window.location.href = "/applications-status";
    } catch (error) {
      showToastError(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    //   navigate(-1); // Redirect to application-status page
    navigate("/applications-status");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToastError("Please select a PDF file first.");
      // showToastError(getApiErrorMessage(error));

      return;
    }

    try {
      setIsUploading(true);

      // const body = {
      //   transferId: transferId,
      //   documentURLbase64: selectedFile,
      //   // documentURLbase64: documentURLbase64,
      // };

      const body = {
        transferId: transferId,
        lstDocument: [
          {
            documentURLbase64: selectedFile,
          },
        ],
      };
      console.log("Upload Payload:", body); // check payload in console

      const res = await getreuploadDocument(body);

      if (res?.status === "Success") {
        showToastSuccess(res?.message || "Document uploaded successfully!");
      } else {
        showToastError(res?.message || "Upload failed!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToastError("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Paper sx={{ width: 500, padding: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Reupload Document
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <TextField
              type="file"
              // accept=".pdf"
              fullWidth
              size="small"
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: "application/pdf" }}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpload}
            >
              Upload
            </Button>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            sx={{ width: "120px" }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleBack}
            sx={{ width: "120px" }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReuploadDocument;
