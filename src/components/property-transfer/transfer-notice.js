import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  GlobalStyles,
} from "@mui/material";
import { getTransferNotice } from "../../services/assessment-services";
import { useLocation, useNavigate } from "react-router-dom";

const TransferNoticePdf = () => {
  const location = useLocation();
  const from = location.state?.from;

  const navigate = useNavigate(); // initialize navigate
  const [currentDate, setCurrentDate] = useState("");

  const { applicationNo, trackingId } = location.state || {};
  const [data, setData] = useState({});
  const [signImage, setSignImage] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // dd/mm/yyyy
    setCurrentDate(formattedDate);

    async function fetchData() {
      if (applicationNo && trackingId) {
        // alert(applicationNo + "&&" + trackingId);

        try {
          const body = { trackingId, applicationNo };
          const response = await getTransferNotice(body);
          setData(response || {});

          if (response?.sign) {
            setSignImage(`data:image/png;base64,${response.sign}`);
          } else {
            setSignImage(""); // clear if no sign
          }
        } catch (err) {
          console.error("Error fetching Transfer Notice:", err);
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
          onClick={handlePrint}
          className="print-hide"
        >
          Print
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBack}
          className="print-hide"
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
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box
            component="img"
            src="/pcmclogo.jpeg"
            alt="PCMC Logo"
            sx={{ width: 90, height: 90, mr: 4, ml: 5 }}
          />
          <Box>
            <Typography sx={{ fontSize: "1.7rem", fontWeight: "bold", ml: 10 }}>
              पिंपरी चिंचवड महानगरपालिका - 411018
            </Typography>
            <Typography
              sx={{
                fontSize: "1.35rem",
                fontWeight: "bold",
                mt: 0.5,
                ml: 16,
              }}
            >
              {data?.zoneName || "_________"} कर आकारणी व कर संकलन विभाग
            </Typography>
            <Typography
              sx={{ fontSize: "1.3rem", fontWeight: "bold", mt: 0.5, ml: 24 }}
            >
              मालमत्ता हस्तांतरण नोटिस{" "}
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
            अर्ज दिनांक : <b>{data?.applicationDate || "_________"}</b>
          </Typography>
        </Box>

        {/* Notice Info */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ ml: 5 }}>
            फेरफार नोटिस क्रमांक : <b>{data?.ferfarNo || "_________"}</b>
          </Typography>
          <Typography sx={{ ml: 32 }}>
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
          पिंपरी चिंचवड महानगरपालिकेचे <b>{data?.zoneName || "_________"}</b>{" "}
          करसंकलन विभागीय कार्यालयाचे कार्यक्षेत्रातील गट क्रमांक{" "}
          <b>{data?.gatName || "____"}</b> मधील स्थानिक मालमत्ता धारकाचे
          नाव&nbsp;
          <b>{data?.ownerName || "________________"}</b> मालमत्ता क्रमांक&nbsp;
          <b>{data?.propertyCode || "_________"}</b> मध्ये फेरफार करणेसाठी&nbsp;
          <b>{data?.newOwnerName || "_________"}</b> यांनी महाराष्ट्र
          महानगरपालिका अनुसूची प्रकरण ८ चे नियम १ व २ अन्वये हक्काचे काग‌पत्रासह
          दिनांक&nbsp;
          <b>{data?.applicationDate || "_________"}</b> रोजी अर्ज केला आहे.
          {"\n\n"}
        </Typography>
        {/* Table 1 (Old Details) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "25% 25% 25% 25%",
            border: "1px solid #333",
            textAlign: "center",
          }}
        >
          {/* Header Row */}
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालकाचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            भोगवटादारचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्ता वर्णन
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1 }}>पत्ता</Box>

          {data.oldPropertyTransferDetails?.length > 0 ? (
            data.oldPropertyTransferDetails.map((item, idx) => (
              <React.Fragment key={idx}>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.ownerName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.occupantName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.description || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.propertyAddress || "_________"}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box sx={{ p: 1, borderTop: "1px solid #333" }}>_________</Box>
            </React.Fragment>
          )}
        </Box>

        {/* Paragraph Below First Table */}
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
            mt: 2,
          }}
        >
          महानगरपालिका रेकॉर्डनुसार सदर मालमत्तेची माहिती खालीलप्रमाणे.
          {"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;आणि
          ज्याअर्थी सादर मालमत्ता क्रमांक&nbsp;
          <b>{data?.propertyCode || "_________"}</b> पैकी खलील नमूद केलेली
          मालमत्ता श्री / श्रीमती / मे{" "}
          <b>{data?.newOwnerName || "_________"}</b>
          &nbsp;यांचे कडे <b>{data?.documentType || "_________"}</b> या
          कारणामुळे हस्तांतरित झाली आहे, त्याअर्थी प्रशासन अधिकारी,{" "}
          <b>{data?.zoneName || "_________"}</b> करसंकलन विभागीय कार्यालय यांनी
          मालमत्ता क्रमांक&nbsp;
          <b>{data?.propertyCode || "_________"}</b> मधील&nbsp;
          <b>{data?.ownerName || "_________"}</b> यांचे नाव कमी करून&nbsp;
          <b>{data?.newOwnerName || "_________"}</b> यांचे नवे फेरफार नोंद खाली
          नमूद केलेल्या मालमत्तेचे मधील भागावर दाखल करनेचे ठरविले आहे.
          {"\n\n"}
        </Typography>
        {/* <Divider sx={{ borderColor: "#333", my: 2 }} /> */}

        {/* Table 2 (New Details) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "25% 25% 25% 25%",
            border: "1px solid #333",
            textAlign: "center",
          }}
        >
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालकाचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            भोगवटादारचे नाव
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1, borderRight: "1px solid #333" }}>
            मालमत्ता वर्णन
          </Box>
          <Box sx={{ fontWeight: "bold", p: 1 }}>पत्ता</Box>

          {data.newPropertyTransferDetails?.length > 0 ? (
            data.newPropertyTransferDetails.map((item, idx) => (
              <React.Fragment key={idx}>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.ownerName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.occupantName || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.description || "_________"}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    // borderRight: "1px solid #333",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item?.propertyAddress || "_________"}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #333",
                  borderRight: "1px solid #333",
                }}
              >
                _________
              </Box>
            </React.Fragment>
          )}
        </Box>

        {/* Final Paragraph */}
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 500,
            whiteSpace: "pre-line",
            mt: 2,
          }}
        >
          त्या अर्थी सर्व संबंधित लोकांना या नोटिसद्वारे कळविण्यात येते की, सदर
          मालमत्ता नोंदीबाबत कोणाचीही हरकत अथवा तक्रार असल्यास या नोटिसचे
          तारखेपासून 07 दिवसाचे आत प्राशन अधिकारी,&nbsp;
          <b>{data?.zoneName || "_________"}</b> कर संकलन विभागीय कार्यालय येथे
          समक्ष योग्य त्या कागदपत्रासह लेखी दाखल करावी. मुदतीत हरकत अथवा तक्रार
          न आल्यास वरील नमूदप्रमाणे मालमत्ता हस्तांतरबाबत कार्यवाही केली जाईल,
          याची सर्वांनी नोंद घ्यावी.
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
            src={signImage || "/signature-fallback.png"} // fallback if no sign
            sx={{ width: "120px", height: "auto", mb: 1, mr: 4 }}
          />

          <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
            प्रशासन अधिकारी ( करसंकलन )
          </Typography>
          <Typography
            sx={{ fontSize: "1rem", fontWeight: "bold", marginRight: "20px" }}
          >
            {data?.zoneName || "_________"}&nbsp;विभागीय कार्यालय
          </Typography>

          <Typography
            align="left"
            sx={{
              fontWeight: "normal",
              fontSize: "1rem",
              marginRight: "79%",
              marginTop: "15px",
            }}
          >
            प्रिंट दिनांक : {currentDate}
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default TransferNoticePdf;
