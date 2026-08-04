import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  GlobalStyles,
} from "@mui/material";
import { getPropertyNocPdf } from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getApiErrorMessage } from "../../utils/helpers";

const NocPdf = () => {
  const [propertyDetails, setPropertyDetails] = useState({});
  const [signImage, setSignImage] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const propertyCode = queryParams.get("propertyCode");

  useEffect(() => {
    async function fetchData() {
      if (!propertyCode) return;

      try {
        // const body = { propertyCode };
        const response = await getPropertyNocPdf(propertyCode);
        setPropertyDetails(response || {});
        if (response?.status) {
          setSignImage(
            response?.status ? `data:image/png;base64,${response.status}` : ""
          );
        } else {
          setSignImage("");
        }
      } catch (error) {
        showToastError(getApiErrorMessage(error));
      }
    }
    fetchData();
  }, [propertyCode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            ".print-hide": {
              display: "none !important",
            },
          },
        }}
      />
      <style>
        {`
                @media print {
                  button .print-hide {
                    display: none;
                  }
                }
              `}
      </style>
      <Box
        sx={{
          textAlign: "right",
          mb: 2,
          mx: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          className="print-hide"
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
      <Paper
        sx={{
          maxWidth: 800,
          height: 1000,
          margin: "auto",
          padding: 3,
          backgroundColor: "#fff",
          border: "1px solid #333",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box
            component="img"
            src="/pcmclogo.jpeg"
            alt="PCMC Logo"
            sx={{ width: 90, height: 90, mr: 4, ml: 7 }}
          />
          <Box>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: "bold" }}>
              पिंपरी चिंचवड महानगरपालिका, पिंपरी - 411018
            </Typography>
            <Typography
              sx={{ fontSize: "1.2rem", fontWeight: "bold", mt: 0.5, ml: 7 }}
            >
              कर आकारणी व कर संकलन विभाग
            </Typography>
            <Typography
              sx={{ fontSize: "1.2rem", fontWeight: "bold", mt: 0.5, ml: 12 }}
            >
              {propertyDetails?.zone || "_________"} विभागीय कार्यालय
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "#000", mb: 1, width: "100%" }} />
        <Typography
          sx={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            textAlign: "center",
            mb: 2,
          }}
        >
          थकबाकी नसलेचा दाखला
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
          }}
        >
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;दाखला
          देण्यात येतो की, पिंपरी चिंचवड महानगरपालिकेच्या हद्दीतील{" "}
          {propertyDetails?.zone || "_________"}&nbsp;विभागीय कार्यालयाच्या
          कार्यक्षेत्रातील खालील नमूद मालमत्तेपोटी सन&nbsp;
          {propertyDetails?.financialYear || "_________"} अखेर महानगरपालिकेची
          मालमत्ता कराची थकबाकी येणे नाही.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          <Box sx={{ display: "flex" }}>
            <Typography sx={{ fontWeight: "bold", width: "200px" }}>
              मालमत्ता क्रमांक
            </Typography>
            <Typography sx={{ px: 1 }}>:</Typography>

            <Typography>
              {propertyDetails?.propertyCode || "_________"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography sx={{ fontWeight: "bold", width: "200px" }}>
              मालकाचे नाव
            </Typography>
            <Typography sx={{ px: 1 }}>:</Typography>

            <Typography>
              {propertyDetails?.propertyName || "_________"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography sx={{ fontWeight: "bold", width: "200px" }}>
              भोगवटादाराचे नाव
            </Typography>
            <Typography sx={{ px: 1 }}>:</Typography>{" "}
            <Typography>
              {propertyDetails?.occupantName ||
                propertyDetails?.propertyName ||
                "_________"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography
              sx={{ fontWeight: "bold", width: "200px", flexShrink: "0" }}
            >
              मालमत्ता पत्ता
            </Typography>
            <Typography sx={{ px: 1 }}>:</Typography>
            <Typography>
              {propertyDetails?.propertyAddress || "_________"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography
              sx={{ fontWeight: "bold", width: "200px", flexShrink: "0" }}
            >
              मालमत्ता वर्णन
            </Typography>
            <Typography sx={{ px: 1 }}>:</Typography>

            <Typography sx={{ flex: "1" }}>
              {propertyDetails?.description || "_________"}
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
            mt: 3,
          }}
        >
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          तथापि सदर मालमत्तेपोटी लेखापरीक्षण / रेकॉर्ड तपासणी / अन्य कारणास्तव
          येणे रक्कम देय असल्याचे निदर्शनास आल्यास ती वसुलीस पात्र राहील याची
          नोंद घ्यावी. तसेच उपरोक्त मालमत्ताधारकाचा थेट हितसंबंध असणाऱ्या अन्य
          मालमत्तेवर थकबाकी असल्यास हा थकबाकी नसलेचा दाखला विहित हेतुसाठी
          ग्राह्य धरणे संबंधी प्राधिकरणावर बंधनकारक असणार नाही.
          {"\n\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          सदरचा दाखला ऑनलाईन केलेल्या मागणीनुसार देण्यात येत आहे.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mt: 3,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              दाखला क्रमांक : {propertyDetails?.applicationNo || "_________"}
            </Typography>
            <Typography sx={{ fontWeight: "bold", mt: 1 }}>
              {/* दिनांक : {propertyDetails?.printDate || "_________"} */}
              दिनांक : {new Date().toLocaleDateString("en-GB")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Box
              component="img"
              src={signImage || "/signature.png"}
              alt="Signature"
              sx={{ width: "120px", height: "auto", mb: 1, marginRight: "10%" }}
            />

            <Typography sx={{ fontWeight: "bold" }}>
              सहाय्यक मंडलाधिकारी {propertyDetails?.zone || "______"}
            </Typography>
            <Typography sx={{ marginRight: "25px" }}>
              विभागीय कार्यालय
            </Typography>
            <Typography>पिंपरी चिंचवड महानगरपालिका</Typography>
          </Box>
        </Box>
      </Paper>
    </>
  );
};
export default NocPdf;
