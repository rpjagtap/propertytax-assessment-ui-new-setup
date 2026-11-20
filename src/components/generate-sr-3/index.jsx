import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Grid,
  Button,
} from "@mui/material";
import DashBoardContainer from "../layout/dashboard-container";
import {
  generatesr1,
  saveSr,
  ViewProTransactionDoc,
} from "../../services/assessment-services";

// ---- shared colour palette ----
const palette = {
  border: "#2b6777",
  headerBg: "#c8e6ef",
  labelBg: "#eaf6f9",
  altRowBg: "#f5fbfc",
  titleColor: "#0b4f5c",
  text: "#1f2d3d",
};

const cellSx = {
  border: `1px solid ${palette.border}`,
  textAlign: "center",
  padding: "5px 6px",
  fontSize: "13px",
  fontFamily: '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif',
  wordWrap: "break-word",
  color: palette.text,
  lineHeight: 1.2,
};

// notice's बांधकाम strip.
const mapFloorDetails = (lstFloorDetls = []) =>
  (lstFloorDetls || []).map((item) => ({
    floor: item.floor,
    area: item.areaInSQMT,
    constructionType: item.permission === "N" ? "अनधिकृत" : "अधिकृत",
  }));

// Finds a document by its exact documentName, so the display order is fixed
// regardless of the order the API returns transactionDocuments in.
const findDocumentByName = (documents, name) =>
  (documents || []).find((doc) => doc.documentName === name);

const findParamRow = (rows, keywords) =>
  rows?.find((row) =>
    keywords.some((kw) => (row?.parameter || "").includes(kw)),
  );

const buildProposalAssessmentRows = (srGenarationVO = []) => {
  const areaRow = findParamRow(srGenarationVO, ["क्षेत्रफळ"]);
  const valueRow = findParamRow(srGenarationVO, ["करयोग्य मूल्य", "मूल्य"]);
  const floorageRow = findParamRow(srGenarationVO, ["फ्लोअरेज"]);
  const dateRow = findParamRow(srGenarationVO, ["आकारणी दिनांक", "दिनांक"]);

  const categories = [
    { key: "nivasiDetail", label: "निवासी" },
    { key: "bigarNivasiDetail", label: "बिगर निवासी" },
    { key: "audyogikDetail", label: "औद्योगिक" },
    { key: "mokalijaminDetail", label: "मोकळी जमीन" },
    { key: "parkingDetail", label: "पार्किंग" },
  ];

  const rows = categories.map(({ key, label }) => ({
    label,
    area: areaRow?.[key] || "0.00",
    taxableValue: valueRow?.[key] || "0",
    floorageTax: floorageRow?.[key] || "0.00",
    assessmentDate: dateRow?.[key] || "",
  }));

  rows.push({
    label: "एकुण",
    area: areaRow?.ekunDetail || "0.00",
    taxableValue: valueRow?.ekunDetail || "0",
    floorageTax: floorageRow?.ekunDetail || "0.00",
    assessmentDate: dateRow?.ekunDetail || "",
  });

  return rows;
};

// ---- SR-3 helpers -----------------------------------------------------
// The SR-3 आदेश references the SR-1 notice number/date ("वाचले - १) ...").
// SR-1 numbers look like "SURSR1WKD2290D13"; SR-3 numbers look like
// "SURSR3WKD2290D13" - i.e. same trailing property code, "SR-1"/"SURSR1"
// swapped for "SR-3"/"SURSR3". If the API starts returning a dedicated
// sr3Number/sr3Date field, prefer that and drop this derivation.
const deriveSr3Number = (srNumber) => {
  if (!srNumber) return "";
  return srNumber.replace("SR-1", "SR-3").replace("SURSR1", "SURSR3");
};

const GenerateSR3 = () => {
  // SR-3 करयोग्य मूल्य निश्चिती आदेश (taxable-value determination order,
  // issued after the objection + hearing)
  const sr3Ref = useRef(null);

  const [applicationId, setApplicationId] = useState(null);
  const [transactionTypeId, setTransactionTypeId] = useState(null);

  const [sr1Data, setSr1Data] = useState();
  const [documentUrls, setDocumentUrls] = useState({});

  // ---- load property photos for the document ----
  useEffect(() => {
    const loadDocuments = async () => {
      const documents = sr1Data?.transactionDocuments;

      if (!documents?.length) {
        return;
      }

      try {
        const urlMap = {};

        for (const doc of documents) {
          try {
            const blob = await ViewProTransactionDoc(
              doc.documentName,
              doc.documentURL,
            );

            const blobUrl = URL.createObjectURL(blob);

            urlMap[doc.documentId] = blobUrl;
          } catch (error) {
            console.error(`Error loading document ${doc.documentId}:`, error);
          }
        }

        setDocumentUrls(urlMap);
      } catch (error) {
        console.error("Error loading transaction documents:", error);
      }
    };

    loadDocuments();
  }, [sr1Data]);

  useEffect(() => {
    const idFromStorage = localStorage.getItem("applicationId");
    const transactionTypeIdFromStorage =
      localStorage.getItem("transactionTypeId");
    if (idFromStorage) {
      setApplicationId(idFromStorage);
      setTransactionTypeId(transactionTypeIdFromStorage);
    }
  }, []);

  useEffect(() => {
    if (applicationId && transactionTypeId) {
      fetchData(applicationId, transactionTypeId);
    }
  }, [applicationId, transactionTypeId]);

  // ---- single fetch feeds every SR document (same API for SR-1, SR-2, SR-3) ----
  const fetchData = async (id, transactionTypeId) => {
    try {
      const body = { applicationId: id, transactionTypeId: transactionTypeId };
      const response = await generatesr1(body);
      setSr1Data(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ---- generic: rasterise any print-area ref into a PDF base64 string ----
  const generatePdfBase64 = async (ref) => {
    const element = ref.current;

    if (!element) {
      throw new Error("PDF element not found");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    /*
     * Keep the complete document width.
     * DO NOT shrink width based on height.
     */
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");

    /*
     * Safety check only - should not normally execute.
     */
    if (imgHeight > pageHeight) {
      console.warn(
        `PDF content is ${imgHeight.toFixed(2)}mm high. ` +
          `A4 height is ${pageHeight}mm.`,
      );
    }

    const blob = pdf.output("blob");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  // ---- generate + save PDF  ----
  const savePdfToServer = async () => {
    try {
      const [sr3PdfBase64] = await Promise.all([generatePdfBase64(sr3Ref)]);

      const payload = {
        documentName: "SR3",
        srNumber: sr1Data?.sr3Number || deriveSr3Number(sr1Data?.srNumber),
        transactionId: sr1Data?.transactionId,
        documentURLbase64: sr3PdfBase64,
      };

      const response = await saveSr(payload);
    } catch (error) {
      console.error("PDF Save Error:", error);
    }
  };

  const pdfSavedRef = useRef(false);
  useEffect(() => {
    if (!sr1Data || pdfSavedRef.current) return;
    const timer = setTimeout(async () => {
      pdfSavedRef.current = true;
      await savePdfToServer();
    }, 2000);
    return () => clearTimeout(timer);
  }, [sr1Data]);

  // Reusable bordered label/value table row - forced to a single line
  const InfoTableRow = ({ label, value, labelWidth = "38%" }) => (
    <TableRow>
      <TableCell
        sx={{
          ...cellSx,
          textAlign: "left",
          fontWeight: "bold",
          bgcolor: palette.labelBg,
          width: labelWidth,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </TableCell>
      <TableCell
        sx={{
          ...cellSx,
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={value}
      >
        {value}
      </TableCell>
    </TableRow>
  );

  // Reusable वापर-wise breakdown table, driven off sr1Data.srGenarationVO
  const UsageBreakdownTable = ({ rows }) => (
    <Table
      sx={{
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
      }}
      size="small"
    >
      <TableHead>
        <TableRow sx={{ bgcolor: palette.headerBg }}>
          <TableCell sx={{ ...cellSx, fontWeight: "bold", textAlign: "left" }}>
            वापर
          </TableCell>
          {useCategories.map((c) => (
            <TableCell key={c.key} sx={{ ...cellSx, fontWeight: "bold" }}>
              {c.label}
            </TableCell>
          ))}
          <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>एकूण</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows?.map((row, index) => (
          <TableRow key={index}>
            <TableCell
              sx={{
                ...cellSx,
                textAlign: "left",
                fontWeight: "bold",
                bgcolor: palette.labelBg,
              }}
            >
              {row?.parameter}
            </TableCell>
            <TableCell sx={cellSx}>{row?.nivasiDetail || "0"}</TableCell>
            <TableCell sx={cellSx}>{row?.bigarNivasiDetail || "0"}</TableCell>
            <TableCell sx={cellSx}>{row?.audyogikDetail || "0"}</TableCell>
            <TableCell sx={cellSx}>{row?.mokalijaminDetail || "0"}</TableCell>
            <TableCell sx={cellSx}>{row?.parkingDetail || "0"}</TableCell>
            <TableCell sx={cellSx}>{row?.ekunDetail || "0"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const useCategories = [
    { key: "residential", label: "निवासी" },
    { key: "nonResidential", label: "बिगर निवासी" },
    { key: "industrial", label: "औद्योगिक" },
    { key: "vacantLand", label: "मोकळी जमीन" },
    { key: "parking", label: "पार्किंग" },
  ];

  const floorDetails = mapFloorDetails(sr1Data?.lstFloorDetls);
  const assessmentRows = buildProposalAssessmentRows(sr1Data?.srGenarationVO);
  const constructionStatus = sr1Data?.permission === "N" ? "अनधिकृत" : "अधिकृत";

  // ---- SR-3 photo column - always मालमत्तेचे छायाचित्र first, then
  // इमारत छायाचित्र, regardless of the order the API returns them in ----
  const SR3_PHOTO_ORDER = ["मालमत्तेचे छायाचित्र", "इमारत छायाचित्र"];
  const sr3Photos = SR3_PHOTO_ORDER.map((name) =>
    findDocumentByName(sr1Data?.transactionDocuments, name),
  ).filter(Boolean);

  const constructionRows = sr1Data?.lstDetailsVOs || [];
  const totalValue = constructionRows
    .reduce((sum, item) => sum + (parseFloat(item.rateableValue) || 0), 0)
    .toFixed(2);

  const proposalAssessmentRows = buildProposalAssessmentRows(
    sr1Data?.srGenarationVO || [],
  );

  const totalRow = proposalAssessmentRows.find((row) => row.label === "एकुण");
  const totalTaxableValue = totalRow?.taxableValue || "0";

  // ---- SR-3 derived data ----
  // "वाचले" lines: १) SR-1 notice, २) objection application, ३) hearing.
  const sr1NoticeNumber = sr1Data?.srNumber;
  const sr1NoticeDate = sr1Data?.srDate || sr1Data?.noticeDate; // TODO: confirm actual field name
  const objectionDate = sr1Data?.objectionDate; // TODO: confirm actual field name (हरकत अर्ज दिनांक)
  const hearingDate = sr1Data?.hearingDate; // TODO: confirm actual field name (सुनावणी दिनांक)

  // This order's own number/date.
  const sr3Number = sr1Data?.sr3Number || deriveSr3Number(sr1Data?.srNumber); // TODO: confirm actual field name
  const sr3Date = sr1Data?.sr3Date || sr1Data?.valueOrderDate; // TODO: confirm actual field name

  // Signatory block (per sample SR-3): residential properties are signed by
  // प्रशासन अधिकारी (करसंकलन) with the zone office line; others by उपायुक्त.
  const isResidential = sr1Data?.finalUseType === "निवासी";
  const signatoryTitle = isResidential
    ? "प्रशासन अधिकारी (करसंकलन)"
    : "उपायुक्त (करसंकलन)";

  return (
    <>
      <style>
        {`
        @media print {

            @page {
                size: A4 portrait;
                margin: 0;
            }

            html,
            body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
            }

            body * {
                visibility: hidden;
            }

            .print-page,
            .print-page * {
                visibility: visible;
            }

            .print-page {
                width: 794px !important;
                min-height: 1123px !important;

                box-sizing: border-box !important;

                margin: 0 auto !important;

                border: none !important;
                box-shadow: none !important;

                page-break-after: always !important;
                break-after: page !important;

                font-family:
                    "Noto Sans Devanagari",
                    "Nirmala UI",
                    Arial,
                    sans-serif !important;
            }

            .print-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }

            .no-print {
                display: none !important;
            }
        }
    `}
      </style>
      <DashBoardContainer>
        <Button
          variant="contained"
          onClick={() => window.print()}
          className="no-print"
          sx={{
            mb: 1,
            "@media print": {
              display: "none",
            },
          }}
        >
          Print
        </Button>

        {/* =========================================================
                    SR-3 करयोग्य मूल्य निश्चिती आदेश
                    (Taxable value determination order - after objection & hearing)
                   ========================================================= */}
        <Paper
          className="print-page"
          ref={sr3Ref}
          sx={{
            width: "794px",
            minHeight: "1123px",
            margin: "24px auto 0",
            p: 5,
            border: `1px solid ${palette.border}`,
            fontFamily:
              '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif',
          }}
        >
          {/* Header */}
          <Box display="flex" alignItems="flex-start" sx={{ mb: 1 }}>
            <Box
              component="img"
              src="/pcmclogo.jpeg"
              alt="PCMC Logo"
              sx={{ width: "70px", mr: 2 }}
            />
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: palette.titleColor }}
              >
                पिंपरी चिंचवड महानगरपालिका
              </Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>
                कर आकारणी व करसंकलन विभाग
              </Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>
                विभागीय कार्यालय-{sr1Data?.zoneName}
              </Typography>
              <Typography
                sx={{ fontWeight: "bold", fontSize: "14px", mt: 0.5 }}
              >
                करयोग्य मूल्य निश्चिती आदेश
              </Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
                ( महाराष्ट्र महानगरपालिका अधिनियम अनुसूची 'ड' प्रकरण ८ नियम ७
                अन्वये)
              </Typography>
            </Box>
          </Box>

          {/* विषय strip */}
          <Box
            sx={{
              border: `1px solid ${palette.border}`,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "13px",
              py: 0.5,
            }}
          >
            विषय - करयोग्य मूल्य निश्चिती बाबत
          </Box>

          {/* वाचले - SR-1 notice, objection application, hearing */}
          <Box sx={{ fontSize: "12px", mt: 0.8, mb: 0.8, lineHeight: 1.7 }}>
            <Box>
              वाचले - १) मालमत्ता कर आकारणी बाबत विशेष नोटीस क्रमांक -{" "}
              <b>SR-1/{sr1NoticeNumber}</b>
              {sr1NoticeDate ? (
                <>
                  , दिनांक - <b>{sr1NoticeDate}</b>
                </>
              ) : (
                ", दिनांक -"
              )}
            </Box>
            <Box sx={{ pl: "46px" }}>
              २) मालमत्ताधारक यांचा दिनांक <b>{objectionDate}</b> रोजीचा हरकत
              अर्ज
            </Box>
            <Box sx={{ pl: "46px" }}>
              ३) मालमत्ताधारक यांचे दिनांक <b>{hearingDate}</b> रोजीची सुनावणी
            </Box>
          </Box>

          {/* Left column: registration table + owner/occupier table + आदेश
                        paragraph, stacked. Right column: the two property photos
                        (मालमत्तेचे छायाचित्र, इमारत छायाचित्र), stretched (via Grid's
                        default alignItems: "stretch") to match the combined height of
                        all three left-hand blocks. */}
          <Grid container spacing={1.5}>
            <Grid item xs={8}>
              {/* Old/new registration details + address */}
              <Box
                sx={{
                  border: `1px solid ${palette.border}`,
                  overflow: "hidden",
                }}
              >
                <Table
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "collapse",
                  }}
                  size="small"
                >
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                          width: "22%",
                        }}
                      >
                        मनपा जुन्या नोंदणी अन्वये विवरण
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        गट क्र.
                      </TableCell>
                      <TableCell sx={cellSx}>{sr1Data?.gatName}</TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        मालमत्ता क्र.
                      </TableCell>
                      <TableCell sx={cellSx}>{sr1Data?.propertyCode}</TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        संगणकीय मालमत्ता क्र.
                      </TableCell>
                      <TableCell sx={cellSx}>{sr1Data?.computerNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        नवीन सर्वेक्षणानुसार विवरण
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        गट क्र.
                      </TableCell>
                      <TableCell sx={cellSx}>{sr1Data?.gatName}</TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        मालमत्ता क्र.
                      </TableCell>
                      <TableCell sx={cellSx}>{sr1Data?.propertyCode}</TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        मालमत्ता सांकेतांक (UPIC ID)
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {sr1Data?.applicationId}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          ...cellSx,
                          textAlign: "left",
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                        }}
                      >
                        मालमत्तेचा स्थानिक पत्ता
                      </TableCell>
                      <TableCell
                        sx={{ ...cellSx, textAlign: "left" }}
                        colSpan={6}
                      >
                        {sr1Data?.propertyAddress}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Owner / occupier / property particulars */}
              <Box
                sx={{
                  border: `1px solid ${palette.border}`,
                  borderTop: "none",
                  overflow: "hidden",
                }}
              >
                <Table
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "collapse",
                  }}
                  size="small"
                >
                  <TableBody>
                    <InfoTableRow
                      label="मालकाचे नाव धारक श्री/श्रीमती/मे:"
                      value={sr1Data?.ownerName}
                      labelWidth="42%"
                    />
                    <InfoTableRow
                      label={
                        <>
                          भोगवटादाराचे नाव <br />
                          (Occupier) ( असल्यास)
                        </>
                      }
                      value={sr1Data?.occupantName}
                      labelWidth="42%"
                    />
                    <InfoTableRow
                      label="अपार्टमेंट/सोसायटीचे नाव (असल्यास)"
                      value={sr1Data?.societyName}
                      labelWidth="42%"
                    />
                    <TableRow sx={{ bgcolor: palette.altRowBg }}>
                      <TableCell
                        sx={{
                          ...cellSx,
                          textAlign: "left",
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                          whiteSpace: "nowrap",
                        }}
                      >
                        दुकान / इमारतीचे नाव (असल्यास):
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={sr1Data?.buildingNo}
                      >
                        {sr1Data?.buildingNo}
                        {" | "}
                        फ्लॅट/दुकान क्र. - {sr1Data?.flatNo || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          ...cellSx,
                          textAlign: "left",
                          fontWeight: "bold",
                          bgcolor: palette.labelBg,
                          whiteSpace: "nowrap",
                        }}
                      >
                        मालमत्ता प्रकार
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        {sr1Data?.finalUseType}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* आदेश paragraph (SR-3 wording: refers to the objection
                  application (वाचले २) and the hearing (वाचले ३)) */}
              <Box mt={1.5}>
                <Typography
                  sx={{
                    textAlign: "justify",
                    fontSize: "11.5px",
                    lineHeight: 1.6,
                  }}
                >
                  <b>आदेश,</b>
                  <br />
                  पिंपरी चिंचवड महानगरपालिका हद्दीतील {sr1Data?.zoneName} कर
                  संकलन विभागीय कार्यालयाचे कार्यक्षेत्रातील{" "}
                  {sr1Data?.propertyAddress} या ठिकाणी मे/श्री./श्रीमती.{" "}
                  <b>{sr1Data?.ownerName}</b> यांचे इमारत बांधकाम / जमिन आहे.
                  त्यावर महाराष्ट्र महानगरपालिका अधिनियमामधील तरतुदीनुसार
                  उपरोक्त वाचले क्रमांक 1 अन्वये मालमत्ता कर आकारणीची विशेष
                  नोटीस दिलेली आहे. मालमत्ताधारक यांचा विशेष नोटीसवरील वाचले
                  क्रमांक 2 अन्वयेचा हरकत अर्ज व वाचले क्रमांक 3 अन्वये
                  सुनावणीतील मुद्दे व हरकतीचे अनुषंगाने पुराव्याची कागदपत्रे
                  विचारात घेऊन प्रस्तुत मालमत्ता कर आकारणी प्रकरणी
                  खालीलप्रमाणे कर आकारणी कायम करणेस या आदेशान्वये मान्यता देत
                  आहे.
                </Typography>
              </Box>
            </Grid>

            {/* Property photos - two stacked frames that together fill the
                combined height of the left column. Images are absolutely
                positioned so they never push the column taller. */}
            <Grid
              item
              xs={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {sr3Photos.map((doc) => (
                  <Box
                    key={doc.documentId}
                    sx={{
                      position: "relative",
                      flex: 1,
                      minHeight: 0,
                      border: `1px solid ${palette.border}`,
                      borderRadius: "4px",
                      overflow: "hidden",
                      bgcolor: palette.labelBg,
                    }}
                  >
                    {documentUrls[doc.documentId] ? (
                      <Box
                        component="img"
                        src={documentUrls[doc.documentId]}
                        alt={doc.documentName}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        Loading...
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* वापर-wise करयोग्य मूल्य table */}
          <Box
            mt={1.5}
            sx={{
              border: `1px solid ${palette.border}`,
              overflow: "hidden",
            }}
          >
            <UsageBreakdownTable rows={sr1Data?.srGenarationVO} />
          </Box>

          {/* Appeal note */}
          <Box
            mt={1.5}
            sx={{
              border: `1px solid ${palette.border}`,
              p: 1,
            }}
          >
            <Typography sx={{ fontSize: "11.5px", textAlign: "justify" }}>
              निश्चित केलेले करयोग्य मूल्य मालमत्ता धारकास मान्य नसलेस जरूर तर
              महाराष्ट्र महानगरपालिका अधिनियम कलम ४०६ नुसार व त्यातील तरतुदी
              नुसार योग्य त्या कोर्टात 15 दिवसांचे आत अपिल दाखल करता येईल.
              कळावे,
            </Typography>
          </Box>

          {/* Number / date + signatory */}
          <Grid container spacing={2} mt={20} alignItems="flex-start">
            <Grid item xs={7}>
              <Typography sx={{ fontSize: "12px" }}>
                क्रमांक : <b>SR-3/{sr3Number}</b>
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                दिनांक :{" "}
                <b>{sr3Date || new Date().toLocaleDateString("en-GB")}</b>
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Box sx={{ textAlign: "center" }}>
                {sr1Data?.signatureSrc && (
                  <Box
                    component="img"
                    src={sr1Data.signatureSrc}
                    alt="signature"
                    sx={{ height: 44 }}
                  />
                )}
                <Typography
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "12px", mt: 0.5 }}
                >
                  {signatoryTitle}
                </Typography>
                {isResidential && (
                  <Typography align="center" sx={{ fontSize: "12px" }}>
                    {sr1Data?.zoneName} विभागीय कार्यालय
                  </Typography>
                )}
                <Typography align="center" sx={{ fontSize: "12px" }}>
                  पिंपरी चिंचवड महानगरपालिका
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <hr />

          {/* प्रति / प्रत addressee block */}
          <Box mt={2} sx={{ fontSize: "12px" }}>
            <Typography sx={{ fontSize: "12px" }}>प्रति,</Typography>
            <Typography sx={{ fontSize: "12px", pl: 2 }}>
              १. श्री. {sr1Data?.ownerName}
            </Typography>
            <Typography sx={{ fontSize: "12px", pl: 2 }}>
              पत्ता &nbsp; {sr1Data?.propertyAddress}
            </Typography>

            <hr />

            <Typography sx={{ fontSize: "12px", mt: 1 }}>प्रत,</Typography>
            <Typography sx={{ fontSize: "12px", pl: 2 }}>
              १. सहायक मंडळाधिकारी
            </Typography>
            <Typography sx={{ fontSize: "12px", pl: 2 }}>
              २. आदेशाचे नोंदी घेणेकरिता व पुढील कार्यवाही करिता
            </Typography>
          </Box>
        </Paper>
      </DashBoardContainer>
    </>
  );
};

export default GenerateSR3;