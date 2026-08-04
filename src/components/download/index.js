import React, { useEffect, useState } from "react";
import { getApiBaseUrl } from "../../utils/helpers";
import { useLocation } from "react-router-dom";
import { Alert } from "@mui/material";
import { showToastError, showToastSuccess } from "../common/toastHelper";

export default function Download() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const applicationNo = queryParams.get("applicationNo");
  const [loading,setLoader] = useState(true);

  useEffect(() => {
    const downloadFile = async (fileUrl) => {
      try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch the file");
        }

        setLoader(false)

        // Extract the file name from the headers if available
        const contentDisposition = response.headers.get("content-disposition");
        let fileName = "Hearning-Letter";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+)"?/);
          if (match && match[1]) fileName = match[1];
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName); // Force download
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);
        showToastSuccess("Hearing Letter downloaded successfully.")
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    };
    if (applicationNo) {
      // Example usage:
      const fileUrl = `${getApiBaseUrl()}/assessment/download-hearing-letter?applicationNo=${applicationNo}`;
      downloadFile(fileUrl);
    } else {
      showToastError("Something went wrong!!");
      setLoader(false)
    }
  }, [applicationNo]);
  return <div>{loading && <Alert severity="info">Please wait download is inprogress...</Alert>}</div>;
}
