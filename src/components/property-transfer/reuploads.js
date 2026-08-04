// import React, { useState } from "react";
// import { Box, Button, Typography, Grid, TextField, Paper } from "@mui/material";
// import { useLocation, useNavigate } from "react-router-dom"; // Import navigation hook
// import {
//   citizenConsentApplications,
//   getreuploadDocument,
// } from "../../services/assessment-services";
// import { showToastError, showToastSuccess } from "../common/toastHelper";
// import { getApiErrorMessage } from "../../utils/helpers";

// const ReuploadDocument = () => {
//   const navigate = useNavigate();

//   const [selectedFile, setSelectedFile] = useState(null);
//   const [index, setIndex] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const location = useLocation();
//   const transferId = location.state?.transferId;
//   const applicationNo = location.state?.applicationNo;

//   const [documents, setDocuments] = useState([{ fileName: "", fileBase64: "" }]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type === "application/pdf") {
//       const convertFileToBase64 = (file) => {
//         return new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(file);
//           reader.onload = () => resolve(reader.result);
//           reader.onerror = (error) => reject(error);
//         });
//       };

//       convertFileToBase64(file)
//         .then((base64String) => {
//           console.log(base64String);
//           setSelectedFile(base64String);
//         })
//         .catch((error) => {
//           console.error("Error converting file to base64:", error);
//         });
//     } else {
//       alert("Please select a valid PDF file");
//       e.target.value = "";
//     }
//   };

//   const addDocument = () => {
//     setDocuments([...documents, { file: null }]);
//   };

//   const removeDocument = (index) => {
//     if (documents.length === 1) return;
//     const updatedDocs = documents.filter((_, i) => i !== index);
//     setDocuments(updatedDocs);
//   };

//   const handleSave = async () => {
//     if (!selectedFile) {
//       showToastError("Please select a PDF file first.");
//       // showToastError(getApiErrorMessage(error));

//       return;
//     }
//     navigate(-1);
//     // window.location.reload();

//     try {
//       setIsUploading(true);

//       const requestData = {
//         revertFormVO: {
//           revertAction: "Accept", // Accept or Reject
//           remark: "Document re-Upload",
//         },
//         transferId: transferId,
//       };

//       const res = await citizenConsentApplications(requestData);
//       // if (res?.status === "Success") {
//       //   showToastSuccess(res?.message || "Document saved successfully!");
//       //   handleBack();
//       // } else {
//       //   showToastError(res?.message || "Failed to saved document!");
//       // }
//     } catch (error) {
//       showToastError(getApiErrorMessage(error));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleBack = () => {
//     if (applicationNo) {
//       navigate(`/applications-status?applicationNo=${applicationNo}`, {
//         replace: true,
//       });
//     } else {
//       navigate("/applications-status");
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       showToastError("Please select a PDF file first.");
//       // showToastError(getApiErrorMessage(error));

//       return;
//     }

//     try {
//       setIsUploading(true);
//       console.log(transferId);
//       const body = {
//         transferId: transferId,
//         documentURLbase64: selectedFile,
//         // documentURLbase64: documentURLbase64,
//       };

//       const res = await getreuploadDocument(body);

//       if (res?.status === "Success") {
//         showToastSuccess(res?.message || "Document uploaded successfully!");
//       } else {
//         showToastError(res?.message || "Upload failed!");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       showToastError("Something went wrong while uploading.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         backgroundColor: "#f4f6f8",
//       }}
//     >
//       <Paper sx={{ width: 500, padding: 4, borderRadius: 3, boxShadow: 3 }}>
//         <Typography
//           variant="h6"
//           fontWeight="bold"
//           textAlign="center"
//           gutterBottom
//         >
//           Reupload Document
//         </Typography>

//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={8}>
//             <TextField
//               type="file"
//               // accept=".pdf"
//               fullWidth
//               size="small"
//               onChange={handleFileChange}
//               InputLabelProps={{ shrink: true }}
//               inputProps={{ accept: "application/pdf" }}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               onClick={handleUpload}
//             >
//               Upload
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Add (+) button only on last row */}
//         <Grid item xs={1}>
//           {index === documents.length - 1 && (
//             <Button variant="contained" color="success" onClick={addDocument}>
//               +
//             </Button>
//           )}
//         </Grid>

//         {/* Delete (-) button, but not if only 1 row */}
//         <Grid item xs={1}>
//           {documents.length > 1 && (
//             <Button
//               variant="contained"
//               color="error"
//               onClick={() => removeDocument(index)}
//             >
//               -
//             </Button>
//           )}
//         </Grid>

//         <Box display="flex" justifyContent="center" gap={2} mt={3}>
//           <Button
//             variant="contained"
//             color="success"
//             onClick={handleSave}
//             sx={{ width: "120px" }}
//           >
//             Save
//           </Button>
//           <Button
//             variant="outlined"
//             color="error"
//             onClick={handleBack}
//             sx={{ width: "120px" }}
//           >
//             Cancel
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default ReuploadDocument;

// import React, { useState } from "react";
// import { Box, Button, Typography, Grid, TextField, Paper } from "@mui/material";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   citizenConsentApplications,
//   getreuploadDocument,
// } from "../../services/assessment-services";
// import { showToastError, showToastSuccess } from "../common/toastHelper";
// import { getApiErrorMessage } from "../../utils/helpers";

// const ReuploadDocument = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from;
//   const [selectedFile, setSelectedFile] = useState(null);

//   const transferId = location.state?.transferId;
//   const applicationNo = location.state?.applicationNo;

//   const [documents, setDocuments] = useState([
//     { fileName: "", fileBase64: "" },
//   ]);
//   const [isUploading, setIsUploading] = useState(false);

//   // Convert file to base64
//   const convertFileToBase64 = (file, callback) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => callback(reader.result);
//     reader.onerror = (error) => console.error("Base64 error:", error);
//   };

//   // Handle file selection for a specific row
//   const handleFileChange = (e, index) => {
//     const file = e.target.files[0];

//     if (!file || file.type !== "application/pdf") {
//       alert("Please upload a valid PDF file");
//       e.target.value = "";
//       return;
//     }

//     convertFileToBase64(file, (base64) => {
//       const updated = [...documents];
//       updated[index].fileName = file.name;
//       updated[index].fileBase64 = base64;
//       setDocuments(updated);
//     });
//   };

//   // Add new document row
//   const addDocument = () => {
//     setDocuments([...documents, { fileName: "", fileBase64: "" }]);
//   };

//   // Remove selected row
//   const removeDocument = (index) => {
//     if (documents.length === 1) return; // cannot delete last row
//     setDocuments(documents.filter((_, i) => i !== index));
//   };

//   // Upload (single or multiple)
//   const handleUpload = async () => {
//     const emptyFiles = documents.filter((d) => !d.fileBase64);

//     if (emptyFiles.length > 0) {
//       showToastError("Please upload all selected documents.");
//       return;
//     }

//     try {
//       setIsUploading(true);

//       for (let doc of documents) {
//         // const body = {
//         //   transferId,
//         //   documentURLbase64: doc.fileBase64,
//         // };

//         const body = {
//           transferId,

//           lstDocument: documents.map((doc) => ({
//             documentURLbase64: doc.fileBase64,
//           })),
//         };
//         // const body = {
//         //   transferId: transferId,
//         //   lstDocument: [
//         //     {
//         //       documentURLbase64: selectedFile,
//         //     },
//         //   ],
//         // };

//         const res = await getreuploadDocument(body);

//         if (res?.status !== "Success") {
//           showToastError(res?.message || "Upload failed");
//           return;
//         }
//       }

//       showToastSuccess("All documents uploaded successfully!");
//     } catch (error) {
//       console.error("Upload Error:", error);
//       showToastError("Something went wrong during upload");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const req = {
//         revertFormVO: {
//           revertAction: "Accept",
//           remark: "Document re-upload",
//         },
//         transferId,
//       };

//       await citizenConsentApplications(req);
//       showToastSuccess("Saved Successfully!");
//       navigate(-1);
//     } catch (error) {
//       showToastError(getApiErrorMessage(error));
//     }
//   };

//   // const handleBack = () => {
//   //   if (applicationNo) {
//   //     navigate(`/applications-status?applicationNo=${applicationNo}`, {
//   //       replace: true,
//   //     });
//   //   } else {
//   //     navigate("/applications-status");
//   //   }
//   // };

//   const handleBack = () => {
//     const from = location.state?.from;

//     // Coming from Track Application Status
//     if (from === "TRACK_APPLICATION_STATUS") {
//       navigate("/track-application-status", { replace: true });
//       return;
//     }

//     // Existing behaviour (Application Status)
//     if (applicationNo) {
//       navigate(`/applications-status?applicationNo=${applicationNo}`, {
//         replace: true,
//       });
//     } else {
//       navigate("/applications-status", { replace: true });
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         backgroundColor: "#f4f6f8",
//       }}
//     >
//       <Paper sx={{ width: 500, padding: 4, borderRadius: 3, boxShadow: 3 }}>
//         <Typography
//           variant="h6"
//           fontWeight="bold"
//           textAlign="center"
//           gutterBottom
//         >
//           Reupload Document
//         </Typography>

//         {/* DYNAMIC DOCUMENT ROWS */}
//         {documents.map((doc, index) => (
//           <Grid
//             container
//             spacing={2}
//             alignItems="center"
//             key={index}
//             sx={{ mb: 1 }}
//           >
//             {/* File Input */}
//             <Grid item xs={8}>
//               <TextField
//                 type="file"
//                 fullWidth
//                 size="small"
//                 inputProps={{ accept: "application/pdf" }}
//                 onChange={(e) => handleFileChange(e, index)}
//               />
//               {doc.fileName && (
//                 <Typography sx={{ fontSize: "0.8rem", mt: 0.5 }}></Typography>
//               )}
//             </Grid>

//             {/* + Button (only on last row) */}
//             <Grid item xs={2}>
//               {index === documents.length - 1 && (
//                 <Button
//                   variant="contained"
//                   color="success"
//                   fullWidth
//                   onClick={addDocument}
//                 >
//                   +
//                 </Button>
//               )}
//             </Grid>

//             {/* - Button */}
//             <Grid item xs={2}>
//               {documents.length > 1 && (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   fullWidth
//                   onClick={() => removeDocument(index)}
//                 >
//                   -
//                 </Button>
//               )}
//             </Grid>
//           </Grid>
//         ))}

//         {/* Upload All */}
//         <Button
//           variant="contained"
//           color="primary"
//           // fullWidth
//           sx={{ mt: 2, width: "150px", mx: "auto", display: "block" }}
//           onClick={handleUpload}
//         >
//           Upload
//         </Button>

//         {/* Save & Cancel */}
//         <Box display="flex" justifyContent="center" gap={2} mt={3}>
//           <Button
//             variant="contained"
//             color="success"
//             sx={{ width: 120 }}
//             onClick={handleSave}
//           >
//             Save
//           </Button>

//           <Button
//             variant="outlined"
//             color="error"
//             sx={{ width: 120 }}
//             onClick={handleBack}
//           >
//             Cancel
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default ReuploadDocument;

// import React, { useState } from "react";
// import { Box, Button, Typography, Grid, TextField, Paper } from "@mui/material";
// import { useLocation, useNavigate } from "react-router-dom"; // Import navigation hook
// import {
//   citizenConsentApplications,
//   getreuploadDocument,
// } from "../../services/assessment-services";
// import { showToastError, showToastSuccess } from "../common/toastHelper";
// import { getApiErrorMessage } from "../../utils/helpers";

// const ReuploadDocument = () => {
//   const navigate = useNavigate();

//   const [selectedFile, setSelectedFile] = useState(null);
//   const [index, setIndex] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const location = useLocation();
//   const transferId = location.state?.transferId;
//   const applicationNo = location.state?.applicationNo;

//   const [documents, setDocuments] = useState([{ fileName: "", fileBase64: "" }]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type === "application/pdf") {
//       const convertFileToBase64 = (file) => {
//         return new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(file);
//           reader.onload = () => resolve(reader.result);
//           reader.onerror = (error) => reject(error);
//         });
//       };

//       convertFileToBase64(file)
//         .then((base64String) => {
//           console.log(base64String);
//           setSelectedFile(base64String);
//         })
//         .catch((error) => {
//           console.error("Error converting file to base64:", error);
//         });
//     } else {
//       alert("Please select a valid PDF file");
//       e.target.value = "";
//     }
//   };

//   const addDocument = () => {
//     setDocuments([...documents, { file: null }]);
//   };

//   const removeDocument = (index) => {
//     if (documents.length === 1) return;
//     const updatedDocs = documents.filter((_, i) => i !== index);
//     setDocuments(updatedDocs);
//   };

//   const handleSave = async () => {
//     if (!selectedFile) {
//       showToastError("Please select a PDF file first.");
//       // showToastError(getApiErrorMessage(error));

//       return;
//     }
//     navigate(-1);
//     // window.location.reload();

//     try {
//       setIsUploading(true);

//       const requestData = {
//         revertFormVO: {
//           revertAction: "Accept", // Accept or Reject
//           remark: "Document re-Upload",
//         },
//         transferId: transferId,
//       };

//       const res = await citizenConsentApplications(requestData);
//       // if (res?.status === "Success") {
//       //   showToastSuccess(res?.message || "Document saved successfully!");
//       //   handleBack();
//       // } else {
//       //   showToastError(res?.message || "Failed to saved document!");
//       // }
//     } catch (error) {
//       showToastError(getApiErrorMessage(error));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleBack = () => {
//     if (applicationNo) {
//       navigate(`/applications-status?applicationNo=${applicationNo}`, {
//         replace: true,
//       });
//     } else {
//       navigate("/applications-status");
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       showToastError("Please select a PDF file first.");
//       // showToastError(getApiErrorMessage(error));

//       return;
//     }

//     try {
//       setIsUploading(true);
//       console.log(transferId);
//       const body = {
//         transferId: transferId,
//         documentURLbase64: selectedFile,
//         // documentURLbase64: documentURLbase64,
//       };

//       const res = await getreuploadDocument(body);

//       if (res?.status === "Success") {
//         showToastSuccess(res?.message || "Document uploaded successfully!");
//       } else {
//         showToastError(res?.message || "Upload failed!");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       showToastError("Something went wrong while uploading.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         backgroundColor: "#f4f6f8",
//       }}
//     >
//       <Paper sx={{ width: 500, padding: 4, borderRadius: 3, boxShadow: 3 }}>
//         <Typography
//           variant="h6"
//           fontWeight="bold"
//           textAlign="center"
//           gutterBottom
//         >
//           Reupload Document
//         </Typography>

//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={8}>
//             <TextField
//               type="file"
//               // accept=".pdf"
//               fullWidth
//               size="small"
//               onChange={handleFileChange}
//               InputLabelProps={{ shrink: true }}
//               inputProps={{ accept: "application/pdf" }}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               onClick={handleUpload}
//             >
//               Upload
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Add (+) button only on last row */}
//         <Grid item xs={1}>
//           {index === documents.length - 1 && (
//             <Button variant="contained" color="success" onClick={addDocument}>
//               +
//             </Button>
//           )}
//         </Grid>

//         {/* Delete (-) button, but not if only 1 row */}
//         <Grid item xs={1}>
//           {documents.length > 1 && (
//             <Button
//               variant="contained"
//               color="error"
//               onClick={() => removeDocument(index)}
//             >
//               -
//             </Button>
//           )}
//         </Grid>

//         <Box display="flex" justifyContent="center" gap={2} mt={3}>
//           <Button
//             variant="contained"
//             color="success"
//             onClick={handleSave}
//             sx={{ width: "120px" }}
//           >
//             Save
//           </Button>
//           <Button
//             variant="outlined"
//             color="error"
//             onClick={handleBack}
//             sx={{ width: "120px" }}
//           >
//             Cancel
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default ReuploadDocument;

import React, { useState } from "react";
import { Box, Button, Typography, Grid, TextField, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  citizenConsentApplications,
  getreuploadDocument,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getApiErrorMessage } from "../../utils/helpers";

const ReuploadDocument = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const transferId = location.state?.transferId;
  const applicationNo = location.state?.applicationNo;
  console.log(transferId);
  const [documents, setDocuments] = useState([
    { fileName: "", fileBase64: "" },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  // Convert file to base64
  const convertFileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error("Base64 error:", error);
  };

  // Handle file selection for a specific row
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];

    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      e.target.value = "";
      return;
    }

    convertFileToBase64(file, (base64) => {
      const updated = [...documents];
      updated[index].fileName = file.name;
      updated[index].fileBase64 = base64;
      setDocuments(updated);
    });
  };

  // Add new document row
  const addDocument = () => {
    setDocuments([...documents, { fileName: "", fileBase64: "" }]);
  };

  // Remove selected row
  const removeDocument = (index) => {
    if (documents.length === 1) return; // cannot delete last row
    setDocuments(documents.filter((_, i) => i !== index));
  };

  // Upload (single or multiple)
  const handleUpload = async () => {
    const emptyFiles = documents.filter((d) => !d.fileBase64);

    if (emptyFiles.length > 0) {
      showToastError("Please upload all selected documents.");
      return;
    }

    try {
      setIsUploading(true);

      for (let doc of documents) {
        // const body = {
        //   transferId,
        //   documentURLbase64: doc.fileBase64,
        // };

        const body = {
          transferId,
          lstDocument: documents.map((doc) => ({
            documentURLbase64: doc.fileBase64,
          })),
        };
        console.log(body);
        const res = await getreuploadDocument(body);

        if (res?.status !== "Success") {
          showToastError(res?.message || "Upload failed");
          return;
        }
      }

      showToastSuccess("All documents uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      showToastError("Something went wrong during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const req = {
        revertFormVO: {
          revertAction: "Accept",
          remark: "Document re-upload",
        },
        transferId,
      };

      await citizenConsentApplications(req);
      showToastSuccess("Saved Successfully!");
      navigate(-1);
    } catch (error) {
      showToastError(getApiErrorMessage(error));
    }
  };

  // const handleBack = () => {
  //   if (applicationNo) {
  //     navigate(`/applications-status?applicationNo=${applicationNo}`, {
  //       replace: true,
  //     });
  //   } else {
  //     navigate("/applications-status");
  //   }
  // };

  const handleBack = () => {
    const from = location.state?.from;

    // Coming from Track Application Status
    if (from === "TRACK_APPLICATION_STATUS") {
      navigate("/track-application-status", { replace: true });
      return;
    }

    // Existing behaviour (Application Status)
    if (applicationNo) {
      navigate(`/applications-status?applicationNo=${applicationNo}`, {
        replace: true,
      });
    } else {
      navigate("/applications-status", { replace: true });
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

        {/* DYNAMIC DOCUMENT ROWS */}
        {documents.map((doc, index) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={index}
            sx={{ mb: 1 }}
          >
            {/* File Input */}
            <Grid item xs={8}>
              <TextField
                type="file"
                fullWidth
                size="small"
                inputProps={{ accept: "application/pdf" }}
                onChange={(e) => handleFileChange(e, index)}
              />
              {doc.fileName && (
                <Typography sx={{ fontSize: "0.8rem", mt: 0.5 }}></Typography>
              )}
            </Grid>

            {/* + Button (only on last row) */}
            <Grid item xs={2}>
              {index === documents.length - 1 && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={addDocument}
                >
                  +
                </Button>
              )}
            </Grid>

            {/* - Button */}
            <Grid item xs={2}>
              {documents.length > 1 && (
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={() => removeDocument(index)}
                >
                  -
                </Button>
              )}
            </Grid>
          </Grid>
        ))}

        {/* Upload All */}
        <Button
          variant="contained"
          color="primary"
          // fullWidth
          sx={{ mt: 2, width: "150px", mx: "auto", display: "block" }}
          onClick={handleUpload}
        >
          Upload
        </Button>

        {/* Save & Cancel */}
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            color="success"
            sx={{ width: 120 }}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{ width: 120 }}
            onClick={handleBack}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReuploadDocument;
