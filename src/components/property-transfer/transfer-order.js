import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  GlobalStyles,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { getTransferOrder } from "../../services/assessment-services";

const TransferOrderPdf = () => {
  const location = useLocation();
  const from = location.state?.from;

  const navigate = useNavigate(); // initialize navigate
  const { applicationNo, trackingId } = location.state || {};
  const [data, setData] = useState({});
  const [signImage, setSignImage] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // dd/mm/yyyy
    setCurrentDate(formattedDate);

    async function fetchData() {
      if (applicationNo && trackingId) {
        try {
          const body = { trackingId, applicationNo };
          const response = await getTransferOrder(body); // or use getTransferOrder
          setData(response || {});
          if (response?.sign) {
            setSignImage(`data:image/png;base64,${response.sign}`);
          } else {
            setSignImage(""); // clear if no sign
          }
        } catch (err) {
          console.error("Error fetching Transfer Order:", err);
        }
      }
    }
    fetchData();
  }, [applicationNo, trackingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1); // goes back to the previous page
  };

  // const handleBack = () => {
  //   if (from === "TRACK_APPLICATION_STATUS") {
  //     navigate("/track-application-status", { replace: true });
  //   } else {
  //     navigate("/applications-status", { replace: true });
  //   }
  // };

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

      {/* Print Button */}
      {/* <Box sx={{ textAlign: "right", mb: 2 }}>
        <Button
          variant="contained"
          className="print-hide"
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box> */}

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

        <Button
          variant="contained"
          color="secondary"
          className="print-hide"
          onClick={handleBack}
        >
          Back
        </Button>
      </Box>

      <Paper
        sx={{
          maxWidth: 800,
          margin: "auto",
          padding: 3,
          backgroundColor: "#fff",
          border: "1px solid #333",
        }}
      >
        {/* Header with Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 2,
            ml: 5,
          }}
        >
          <Box
            component="img"
            src="/pcmclogo.jpeg"
            alt="PCMC Logo"
            sx={{ width: 95, height: 95, mr: 4 }}
          />
          <Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: "bold", ml: 8 }}>
              पिंपरी चिंचवड महानगरपालिका, पिंपरी - ४११०१८
            </Typography>
            <Typography
              sx={{ fontSize: "1.3rem", fontWeight: "bold", mt: 0.5, ml: 16 }}
            >
              {data?.zoneName || "_________"} कर आकारणी व कर संकलन विभाग{" "}
            </Typography>
            <Typography
              sx={{ fontSize: "1.3rem", fontWeight: "bold", mt: 0.5, ml: 20 }}
            >
              मालमत्ता हस्तांतरण आदेश{" "}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#000", mb: 1, width: "100%" }} />

        {/* Application Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            fontSize: "1rem",
          }}
        >
          <Typography sx={{ ml: 5 }}>
            अर्ज क्रमांक : <b>{data?.applicationNo || "_________"}</b>
          </Typography>
          <Typography sx={{ mr: 13 }}>
            आदेश दिनांक : <b>{data?.orderDate || "_________"}</b>
          </Typography>
        </Box>

        {/* Notice Info */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ ml: 5 }}>
            वाचले :1. फेरफार नोटिस क्रमांक :{" "}
            <b>{data?.ferfarNo || "_________"}</b>
          </Typography>
          <Typography sx={{ ml: 23 }}>
            फेरफार दिनांक : <b>{data?.ferfarDate || "_________"}</b>
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#000", mb: 1, width: "100%" }} />

        {/* Paragraph */}
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
          }}
        >
          विषय - मालमत्ता क्रमांक:<b> {data?.propertyCode || "_________"}</b>{" "}
          हस्तांतर करणेबाबत.{"\n"}
          आदेश, {"\n"} पिंपरी चिंचवड महानगरपालिकेच्या&nbsp;
          <b>{data?.zoneName || "_________"}</b> विभागीय कार्यालयाच्या
          कार्यक्षेत्रातील श्री / श्रीमती / &nbsp;
          <b>{data?.ownerName || "________________"}</b> यांच्या नवे कर आकारणी
          रजिस्टरला नोंद असलेल्या मालमत्ता क्रमांक&nbsp;
          <b>{data?.propertyCode || "_________"}</b> चे प्रकरणी उपरोक्त वाचले
          क्र.1 अन्वये सदर मालमत्तेचे फेरफारसाठी हस्तांतर नोटिस प्रसिद्ध करनेत
          आली आहे. सदर नोटिसचे मुदतीत कोणीही लेखी हरकत घेतलेली नाही. यावरुन मी
          प्रशासन अधिकारी करसंकलन, पिंपरी चिंचवड महानगरपालिका, पिंपरी-१८.
          मालमत्ता क्रमांक:<b>{data?.propertyCode || "_________"}</b>
          चे पुढीलप्रमाणे हस्तांतर करणेस या आदेशान्वये मान्यता देत आहे.{"\n\n"}
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            कर आकारणी रजिस्टरमध्ये असलेल्या नोंदीचे वर्णन.
          </span>
          {"\n"}
        </Typography>

        {/* <Divider sx={{ borderColor: "#333", my: 2 }} /> */}

        {/* Table 1 (Old Details) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "16% 17% 14% 11% 12% 9% 9% 12%",
            border: "1px solid #333",
            textAlign: "center",
          }}
        >
          {/* Header Row */}
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्ता क्रमांक
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचे वर्णन
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचा पत्ता
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालकाचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            भोगवटादाराचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            क्षेत्रफळ
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            वापर
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1 }}>करयोग्य मूल्य</Box>

          {data.oldPropertyTransferDetails?.length > 0 ? (
            data.oldPropertyTransferDetails.map((data, idx) => (
              <React.Fragment key={idx}>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                  }}
                >
                  {data?.propertyCode || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.description || "_________"}
                </Box>
                <Box
                  // sx={{
                  //   p: 1,
                  //   borderTop: "1px solid #333",
                  //   borderRight: "1px solid #333",
                  // }}
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.propertyAddress || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.ownerName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.occupantName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.totalArea || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.finalUseType || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.ratableValueSum || "_________"}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: idx !== 7 ? "1px solid #333" : "none",
                  }}
                >
                  _________
                </Box>
              ))}
            </React.Fragment>
          )}
        </Box>

        {/* <Divider sx={{ borderColor: "#333", my: 2 }} /> */}

        {/* Paragraph Below First Table */}
        <Typography
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.8,
            fontWeight: 600,
            whiteSpace: "pre-line",
            mt: 2,
          }}
        >
          नविन मालकाचे नवे हस्तांतरीत झालेल्या मालमत्तेचे वर्णन
        </Typography>

        {/* <Divider sx={{ borderColor: "#333", my: 2 }} /> */}

        {/* Table 2 (New Details) */}
        <Box
          sx={{
            display: "grid",
            // gridTemplateColumns: "15% 17% 14% 10.5% 12.5% 9% 10% 12.5%",
            gridTemplateColumns: "16% 17% 14% 11% 12% 9% 9% 12%",

            border: "1px solid #333",
            textAlign: "center",
          }}
        >
          {/* Header Row */}
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्ता क्रमांक
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचे वर्णन
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचा पत्ता
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालकाचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            भोगवटादाराचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            क्षेत्रफळ
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            वापर
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1 }}>करयोग्य मूल्य</Box>

          {data.newPropertyTransferDetails?.length > 0 ? (
            data.newPropertyTransferDetails.map((item, rowIdx) => (
              <React.Fragment key={rowIdx}>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                  }}
                >
                  {item?.propertyCode || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.description || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.propertyAddress || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.ownerName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.occupantName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.totalArea || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.finalUseType || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    // borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.ratableValueSum || "_________"}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: idx !== 7 ? "1px solid #333" : "none",
                  }}
                >
                  _________
                </Box>
              ))}
            </React.Fragment>
          )}
        </Box>

        {/* <Divider sx={{ borderColor: "#333", my: 2 }} /> */}

        {/* Final Paragraph */}
        <Typography
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.8,
            fontWeight: 600,
            whiteSpace: "pre-line",
            mt: 2,
          }}
        >
          फेरफार झालेनंतर पहिल्या मालकाच्या नावे शिल्लक राहिलेल्या मालमत्तेचे
          वर्णन
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "16% 17% 14% 11% 12% 9% 9% 12%",
            border: "1px solid #333",
            textAlign: "center",
          }}
        >
          {/* Header Row */}
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्ता क्रमांक
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचे वर्णन
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्तेचा पत्ता
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालकाचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            भोगवटादाराचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            क्षेत्रफळ
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            वापर
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1 }}>करयोग्य मूल्य</Box>

          {data.propertyTransferDetails?.length > 0 ? (
            data.propertyTransferDetails.map((item, idx) => (
              <React.Fragment key={idx}>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                  }}
                >
                  {item?.propertyCode || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.description || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.propertyAddress || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.ownerName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.occupantName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.totalArea || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.finalUseType || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    // borderRight: "1px solid #333",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item?.ratableValueSum || "_________"}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: idx !== 7 ? "1px solid #333" : "none",
                  }}
                >
                  _________
                </Box>
              ))}
            </React.Fragment>
          )}
        </Box>

        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
            mt: 2,
          }}
        >
          मालमत्ता हस्तांतरण करणेकरिता अर्जदार यांनी अर्जसोबत सादर केलेल्या
          कागदपत्रांनुसार मालमत्तेचे हस्तांतरण करणेत आले असून मालमत्ता कारचे
          दायित्व निश्चित करणेकरिता सदर हस्तांतरण आदेशाची असेसमेंट रजिस्टर, तसेच
          मागणी व फेरफार रजिस्टरल नोंद घेतली आहे. मालमत्तेचे मालकी हक्काबाबत
          भविष्यात काही समस्या उद्भवल्यास योग्य त्या प्राधिकरण व मा. न्यायालयाचे
          आदेशानुसार असेसमेंट रजिस्टर योग्य ती दुरूस्ती केली जाईल याची नोंद
          घ्यावी.
        </Typography>

        {/* Signature Block */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            mt: 4,
            flexDirection: "column",
            textAlign: "right",
          }}
        >
          <Box
            component="img"
            src={signImage || "/signature-fallback.png"}
            alt="Officer Signature"
            sx={{ width: "120px", height: "auto", mb: 1, mr: 7.5 }}
          />

          <Typography
            sx={{ fontSize: "1.1rem", marginRight: "60px", fontWeight: "400" }}
          >
            प्रशासन अधिकारी
          </Typography>
          <Typography
            sx={{ fontSize: "1.1rem", marginRight: "40px", fontWeight: "400" }}
          >
            {data?.zoneName || "_________"}&nbsp;विभागीय कार्यालय
          </Typography>
        </Box>

        <Box sx={{ width: "120px", height: "auto", mb: 1, ml: 10 }} />

        <Typography
          sx={{ fontSize: "1.1rem", marginLeft: "10px", fontWeight: "400" }}
        >
          <b> प्रती</b> - १) श्री./ श्रीमती/ मे -
        </Typography>
        <Typography
          sx={{ fontSize: "1.1rem", marginLeft: "50px", fontWeight: "400" }}
        >
          २) श्री./ श्रीमती/ मे -
        </Typography>
        <Typography
          align="left"
          sx={{
            fontWeight: "normal",
            fontSize: "1rem",
            paddingLeft: "1",
            marginTop: "15px",
          }}
        >
          प्रिंट दिनांक : {currentDate}
        </Typography>
      </Paper>
    </>
  );
};

export default TransferOrderPdf;
