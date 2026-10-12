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

// ---- SR-2 helpers -----------------------------------------------------
// The SR-2 आदेश references the SR-1 notice number/date ("वाचले - १) ...").
// SR-1 numbers look like "SR-1/SURSR1KWL848081"; SR-2 numbers look like
// "SR-2/SURSR2KWL848081" - i.e. same trailing property code, "SR-1"/"SURSR1"
// swapped for "SR-2"/"SURSR2". If the API starts returning a dedicated
// sr2Number/sr2Date field, prefer that and drop this derivation.
const deriveSr2Number = (srNumber) => {
  if (!srNumber) return "";
  return srNumber.replace("SR-1", "SR-2").replace("SURSR1", "SURSR2");
};

const GenerateSR2 = () => {
  const noticeRef = useRef(null);
  // Document 2: SR-2 करयोग्य मूल्य निश्चिती आदेश (taxable-value determination order)
  const valueOrderRef = useRef(null);

  const [applicationId, setApplicationId] = useState(null);
  const [transactionTypeId, setTransactionTypeId] = useState(null);

  const [sr1Data, setSr1Data] = useState();
  const [documentUrls, setDocumentUrls] = useState({});

  // ---- load property photos for the notice document ----
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

  // ---- single fetch feeds ALL THREE documents (same API for SR-1 notice,
  // SR-2 value order, and the पाहणी अहवाल) ----
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
     * This should NOT normally execute once the
     * Notice spacing is corrected.
     *
     * Kept only as a safety check.
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

  // ---- generate + save PDFs  ----
  const savePdfToServer = async () => {
    try {
      const [valueOrderPdfBase64] = await Promise.all([
        generatePdfBase64(valueOrderRef),
      ]);

      const payload = {
        documentName: "SR2",
        srNumber: sr1Data?.sr2Number || deriveSr2Number(sr1Data?.srNumber),
        transactionId: sr1Data?.transactionId,
        documentURLbase64: valueOrderPdfBase64,
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

  // Reusable bordered label/value table row - forced to a single line (notice document)
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

  // Reusable वापर-wise breakdown table - identical column layout is used by
  // both Document 1 (आकारणी न झालेल्या ... तपशील) and Document 2
  // (करयोग्य मूल्य निश्चिती आदेश), both driven off sr1Data.srGenarationVO.
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

  // वापर-wise breakdown used in both the notice's and the value-order's tables
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

  // ---- Document 1 (notice) photo strip - always मालमत्तेचे छायाचित्र first,
  // then इमारत छायाचित्र, regardless of the order the API returns them in ----
  const NOTICE_PHOTO_ORDER = ["मालमत्तेचे छायाचित्र", "इमारत छायाचित्र"];
  const noticePhotos = NOTICE_PHOTO_ORDER.map((name) =>
    findDocumentByName(sr1Data?.transactionDocuments, name),
  ).filter(Boolean);

  // ---- Document 2 (करयोग्य मूल्य निश्चिती आदेश) - single property photo,
  // now stretched to the full height of the registration + owner tables
  // and the आदेश paragraph. Reuses the same "मालमत्तेचे छायाचित्र" document
  // as Document 1's first photo. ----
  const valueOrderPhoto = findDocumentByName(
    sr1Data?.transactionDocuments,
    "मालमत्तेचे छायाचित्र",
  );

  // ---- Document 3 (पाहणी अहवाल) photo strip - always इमारत छायाचित्र first,
  // then मालमत्तेचा नकाशा/आराखडा, regardless of API order ----
  const PAHANI_PHOTO_ORDER = ["इमारत छायाचित्र", "मालमत्तेचा नकाशा/आराखडा"];
  const pahaniPhotos = PAHANI_PHOTO_ORDER.map((name) =>
    findDocumentByName(sr1Data?.transactionDocuments, name),
  ).filter(Boolean);

  // ---- पाहणी अहवाल (doc 3) derived data ----
  // constructionRows feeds the मजला/बांधकाम/वापर/करयोग्य मूल्य table directly
  // off sr1Data.lstDetailsVOs - each item already carries floor,
  // constructionType, useType, subUseType, areaInSQMT, builtUpAreaInSQMT,
  // billRate, rateableValue as real API fields.
  const constructionRows = sr1Data?.lstDetailsVOs || [];
  const totalValue = constructionRows
    .reduce((sum, item) => sum + (parseFloat(item.rateableValue) || 0), 0)
    .toFixed(2);
  // Signatory shown in the मालमत्ताधारक column - falls back to the
  // assistant officer's name if a dedicated signatory isn't set.
  const signatureSrc = sr1Data?.signatureSrc;
  const signatoryName = sr1Data?.signatoryName;

  const proposalAssessmentRows = buildProposalAssessmentRows(
    sr1Data?.srGenarationVO || [],
  );

  const totalRow = proposalAssessmentRows.find((row) => row.label === "एकुण");
  const totalTaxableValue = totalRow?.taxableValue || "0";

  // ---- Document 2 (SR-2) derived data ----
  // "वाचले" line references the SR-1 notice this order follows on from.
  const sr1NoticeNumber = sr1Data?.srNumber;
  const sr1NoticeDate = sr1Data?.srDate || sr1Data?.noticeDate; // TODO: confirm actual field name
  // This order's own number/date.
  const sr2Number = sr1Data?.sr2Number || deriveSr2Number(sr1Data?.srNumber); // TODO: confirm actual field name
  const sr2Date = sr1Data?.sr2Date || sr1Data?.valueOrderDate; // TODO: confirm actual field name
  const signatoryTitle =
    sr1Data?.finalUseType === "निवासी"
      ? `प्रशासन अधिकारी  ${sr1Data?.zoneName}`
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

            /*
             * ONLY SR-1 NOTICE
             *
             * Slightly reduce vertical size.
             * Width remains unchanged.
             */
            .notice-print-page {
                transform: scaleY(0.96);
                transform-origin: top center;
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
                    DOCUMENT 2 - SR-2 करयोग्य मूल्य निश्चिती आदेश
                    (Taxable value determination order)
                   ========================================================= */}
        <Paper
          className="print-page"
          ref={valueOrderRef}
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

          {/* वाचले - reference to the SR-1 notice this order follows on from */}
          <Box sx={{ fontSize: "12px", mt: 0.8, mb: 0.8 }}>
            वाचले - १) मालमत्ता कर आकारणी बाबत विशेष नोटीस क्रमांक -{" "}
            <b>SR-1/{sr1NoticeNumber}</b>
            {sr1NoticeDate ? (
              <>
                , दिनांक -<b>{sr1NoticeDate}</b>
              </>
            ) : (
              ", दिनांक -"
            )}
          </Box>

          {/* Left column: registration table + owner/occupier table + आदेश
                        paragraph, stacked. Right column: property photo, stretched
                        (via Grid's default alignItems: "stretch") to match the
                        combined height of all three left-hand blocks - same
                        pattern Document 1 uses for its photo strip. */}
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

              {/* आदेश paragraph */}
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
                  संकलन विभागीय कार्यालयाचे कार्यक्षेत्रातील {sr1Data?.gatName}{" "}
                  पैकी {sr1Data?.propertyAddress} या ठिकाणी श्री/श्रीमती{" "}
                  <b>{sr1Data?.ownerName}</b> धारक यांचे इमारत/बांधकाम/जमीन आहे.
                  त्याबाबत महाराष्ट्र महानगरपालिका अधिनियमातील तरतुदीनुसार
                  उपरोक्त वाचले क्रमांक १ अन्वये मालमत्ता कर आकारणीची विशेष
                  नोटीस दिलेली आहे. मालमत्ताधारकांनी विशेष नोटीसमधील अथवा कर
                  आकारणी रजिस्टर मधील नोंदीबाबत कोणत्याही प्रकारची हरकत अथवा
                  तक्रार नोटीस मधील मुदतीत दाखल केलेली नाही. यावरून नोटीसमधील
                  मजकूर व कर आकारणी रजिस्टरमधील नोंदीबाबत काहीही तक्रार नाही असे
                  समजण्यात येत आहे. <br />
                  सबब प्रस्तुत मालमत्ता कर आकारणी प्रकरणी खालीलप्रमाणे कर आकारणी
                  कायम करणेस या आदेशान्वये मान्यता देत आहे.
                </Typography>
              </Box>
            </Grid>

            {/* Property photo - stretches to the combined height of the
                            registration table + owner table + आदेश paragraph on the left */}
            <Grid
              item
              xs={4}
              sx={{
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  minHeight: "100%",
                  border: `1px solid ${palette.border}`,
                  borderRadius: "4px",
                  overflow: "hidden",
                  bgcolor: palette.labelBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {valueOrderPhoto ? (
                  documentUrls[valueOrderPhoto.documentId] ? (
                    <Box
                      component="img"
                      src={documentUrls[valueOrderPhoto.documentId]}
                      alt={valueOrderPhoto.documentName}
                      sx={{
                        width: "200%",
                        height: "200%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                      }}
                    >
                      Loading...
                    </Box>
                  )
                ) : null}
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
              निश्चित केलेले करयोग्य मूल्य मालमत्ता धारकास मान्य नसेल जर तर
              महाराष्ट्र महानगरपालिका अधिनियम कलम ४०६ नुसार व त्यातील तरतुदी
              नुसार योग्य त्या कोर्टात १५ दिवसांचे आत अपिल दाखल करता येईल.
              कळावे.
            </Typography>
          </Box>

          {/* Number / date + signatory */}
          <Grid container spacing={2} mt={20} alignItems="flex-start">
            <Grid item xs={7}>
              <Typography sx={{ fontSize: "12px" }}>
                क्रमांक : <b>SR-2/{sr2Number}</b>
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                दिनांक :{" "}
                <b>{sr2Date || new Date().toLocaleDateString("en-GB")}</b>
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Box sx={{ textAlign: "right" }}>
                {sr1Data?.signatureSrc && (
                  <Box
                    component="img"
                    src={sr1Data.signatureSrc}
                    alt="signature"
                    sx={{ height: 44 }}
                  />
                )}
                <Typography
                  align="right"
                  sx={{ fontWeight: "bold", fontSize: "12px", mt: 0.5 }}
                >
                  {signatoryTitle}
                </Typography>
                <Typography align="right" sx={{ fontSize: "12px" }}>
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
              १. श्री. धारक
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

export default GenerateSR2;
