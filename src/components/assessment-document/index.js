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
    Button
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
    rows?.find((row) => keywords.some((kw) => (row?.parameter || "").includes(kw)));

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


const PropertyTaxDocumentBundle = () => {
    const noticeRef = useRef(null);
    const proposalRef = useRef(null);
    const pahaniRef = useRef(null);

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
                            doc.documentURL
                        );

                        const blobUrl = URL.createObjectURL(blob);

                        urlMap[doc.documentId] = blobUrl;
                    } catch (error) {
                        console.error(
                            `Error loading document ${doc.documentId}:`,
                            error
                        );
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
        const transactionTypeIdFromStorage = localStorage.getItem("transactionTypeId");
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

    // ---- single fetch feeds ALL THREE documents ----
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
        const imgHeight =
            (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
        );

        /*
         * This should NOT normally execute once the
         * Notice spacing is corrected.
         *
         * Kept only as a safety check.
         */
        if (imgHeight > pageHeight) {
            console.warn(
                `PDF content is ${imgHeight.toFixed(2)}mm high. ` +
                `A4 height is ${pageHeight}mm.`
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

    // ---- generate + save ALL THREE PDFs (notice, प्रस्ताव, पाहणी अहवाल) ----
    const savePdfToServer = async () => {
        try {
            const [noticePdfBase64, proposalPdfBase64, pahaniPdfBase64] = await Promise.all([
                generatePdfBase64(noticeRef),
                generatePdfBase64(proposalRef),
                generatePdfBase64(pahaniRef),
            ]);

            // Save the SR-1 notice PDF
            await saveSr({
                documentName: "स्थळ पाहणी अहवाल",
                srNumber: sr1Data?.srNumber,
                transactionId: sr1Data?.transactionId,
                documentURLbase64: noticePdfBase64,
            });

            await saveSr({
                documentName: "प्रस्ताव",
                srNumber: sr1Data?.srNumber,
                transactionId: sr1Data?.transactionId,
                documentURLbase64: proposalPdfBase64,
            });

            // NOTE: separate save call for the पाहणी अहवाल PDF - swap for a
            // dedicated savePahani(...) endpoint once the backend contract is
            // confirmed, same as the saveProposal note above.
            await saveSr({
                documentName: "पाहणी अहवाल",
                srNumber: sr1Data?.srNumber,
                transactionId: sr1Data?.transactionId,
                documentURLbase64: pahaniPdfBase64,
            });

            // localStorage.removeItem("applicationId");
            // localStorage.removeItem("transactionTypeId");
            console.error("PDF Saved");
        } catch (error) {
            console.error("PDF Save Error", error);
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

    // वापर-wise breakdown used in the notice's "आकारणी न झालेल्या..." table
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
    const noticePhotos = NOTICE_PHOTO_ORDER
        .map((name) => findDocumentByName(sr1Data?.transactionDocuments, name))
        .filter(Boolean);

    // ---- Document 3 (पाहणी अहवाल) photo strip - always इमारत छायाचित्र first,
    // then मालमत्तेचा नकाशा/आराखडा, regardless of API order ----
    const PAHANI_PHOTO_ORDER = ["इमारत छायाचित्र", "मालमत्तेचा नकाशा/आराखडा"];
    const pahaniPhotos = PAHANI_PHOTO_ORDER
        .map((name) => findDocumentByName(sr1Data?.transactionDocuments, name))
        .filter(Boolean);

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
        sr1Data?.srGenarationVO || []
    );

    const totalRow = proposalAssessmentRows.find(
        (row) => row.label === "एकुण"
    );
    const totalTaxableValue = totalRow?.taxableValue || "0";

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
                    DOCUMENT 2 - प्रस्ताव (Proposal) - rendered below the notice,
                    all fields sourced from the same sr1Data
                   ========================================================= */}
                <Paper
                    className="print-page"
                    ref={proposalRef}
                    sx={{
                        width: "794px",
                        minHeight: "1123px",
                        margin: "24px auto 0",
                        p: 4,
                        border: `1.5px solid ${palette.border}`,
                        fontFamily: '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif',
                    }}
                    elevation={0}
                >
                    {/* ---------- Header block: प्रस्ताव / इमारत क्रमांक / गट क्रमांक / विषय ---------- */}
                    <Box sx={{ border: `1px solid ${palette.border}`, overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        rowSpan={2}
                                        sx={{
                                            ...cellSx,
                                            width: "16%",
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                            verticalAlign: "middle",
                                        }}
                                    >
                                        प्रस्ताव
                                    </TableCell>
                                    <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: "bold", fontSize: "13px" }}>
                                        इमारत क्रमांक - {sr1Data?.buildingNo}
                                    </TableCell>
                                    <TableCell
                                        rowSpan={2}
                                        sx={{ ...cellSx, textAlign: "left", verticalAlign: "top", width: "30%" }}
                                    >
                                        <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                                            {sr1Data?.zoneName} -विभागीय कार्यालय
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", mt: 0.5 }}>
                                            दिनांक : {new Date().toLocaleDateString("en-GB")}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px" }}>
                                            मालमत्ता क्रमांक - {sr1Data?.propertyCode}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", width: "20%" }}>
                                        गट क्रमांक - {sr1Data?.gatName}
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>
                                        विषय :
                                        {
                                            Number(sr1Data?.transactionTypeId) === 11
                                                ? " वापर प्रकार बदल"
                                                : Number(sr1Data?.transactionTypeId) === 1
                                                    ? " नवीन मालमत्ता कर आकारणी बाबत..."
                                                    : Number(sr1Data?.transactionTypeId) === 2
                                                        ? " वाढीव मालमत्ता कर आकारणी बाबत..."
                                                        : ""
                                        }

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* ---------- मा.स.सादर + numbered particulars ---------- */}
                    <Box mt={1.5} sx={{ fontSize: "12px", lineHeight: 1.8 }}>
                        <Typography sx={{ fontSize: "12px" }}>मा.स.सादर,</Typography>
                        <Typography sx={{ fontSize: "12px", textAlign: "justify" }}>
                            खालील नमूद मालमत्तेची दि. {sr1Data?.srDate} रोजी समक्ष पाहणी करणेत येवून कर आकारणीकामी प्रस्ताव सादर करणेत येत आहे.
                        </Typography>

                        <Typography sx={{ fontSize: "12px", mt: 0.5 }}>
                            1) मालकाचे नाव :- <b>{sr1Data?.ownerName}</b>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            2) भोगवटादाराचे नाव :- <b>{sr1Data?.occupantName}</b>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            3) मालमत्तेचा स्थानिक पत्ता :- <b>{sr1Data?.propertyAddress}</b>
                        </Typography>
                    </Box>

                    {/* ---------- (4) इमारत/जमीन मालमत्ता तपशील ---------- */}
                    <Box mt={1}>
                        <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
                            4) इमारत/ जमीन मालमत्ता तपशील :
                        </Typography>
                        <Box sx={{ border: `1px solid ${palette.border}`, overflow: "hidden", mt: 0.5 }}>
                            <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: palette.headerBg }}>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", width: "14%" }}>मजला</TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>
                                            करपात्र क्षेत्रफळ (लांबी X रूंदी = एकुण चौ.मी)
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>बांधकाम दर्जा / प्रकार</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {floorDetails.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>
                                                {row.floor}
                                            </TableCell>
                                            <TableCell sx={cellSx}>{row.area}</TableCell>
                                            <TableCell sx={cellSx}>{row.constructionType}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>

                    {/* ---------- (5) (6) (7) plain particulars ---------- */}
                    <Box mt={1} sx={{ fontSize: "12px", lineHeight: 1.8 }}>
                        <Typography sx={{ fontSize: "12px" }}>
                            5) बांधकाम : <b>{constructionStatus}</b>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            6) बांधकाम पूर्णत्वाची तारीख / भोगवटा सुरू झालेची तारीख : <b>{sr1Data?.srDate}</b>
                        </Typography>
                        <Typography sx={{ fontSize: "12px" }}>
                            7) बांधकाम पूर्णत्व / भोगवटा दिनांक या बाबत पुरावा व तपशील: <b>{sr1Data?.proofDetails}</b>
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>8) प्रस्तावित आकारणी तपशील :</Typography>
                    </Box>

                    {/* ---------- (8) प्रस्तावित आकारणी तपशील - pivoted from sr1Data.srGenarationVO ---------- */}
                    <Box sx={{ border: `1px solid ${palette.border}`, overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: palette.headerBg }}>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>वापर</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>करपात्र क्षेत्रफळ (चौ.मी)</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>करयोग्य मूल्य रु.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>फ्लोअरेज कर रक्कम रु.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>आकारणी दिनांक</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assessmentRows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg, textAlign: "left" }}>
                                            {row.label}
                                        </TableCell>
                                        <TableCell sx={cellSx}>{row.area}</TableCell>
                                        <TableCell sx={cellSx}>{row.taxableValue}</TableCell>
                                        <TableCell sx={cellSx}>{row.floorageTax}</TableCell>
                                        <TableCell sx={cellSx}>{row.assessmentDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* ---------- (9) summary paragraph ---------- */}
                    <Box mt={1.5}>
                        <Typography sx={{ fontSize: "12px", textAlign: "justify", lineHeight: 1.8 }}>
                            9) इमारतीमध्ये एकूण <b>{sr1Data?.totalProperties ?? 1}</b> मालमत्ता आहेत, पैकी{" "}
                            <b>{sr1Data?.assessedProperties ?? 1}</b> मालमत्तांवर करआकारणी कार्यवाही झालेली असून
                            उर्वरीत <b>{sr1Data?.remainingProperties ?? 0}</b> मालमत्तांवर आकारणी प्रस्तावित केली आहे.
                            वरील प्रमाणे मालमत्तेची माहिती बरोबर असून उपरोक्त प्रस्ताव मान्य असलेस सोबतचे विशेष नोटीसवर
                            स्वाक्षरी होणेस विनंती.
                        </Typography>
                    </Box>

                    {/* ---------- first sign-off row ---------- */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 20, px: 1 }}>
                        <Box sx={{ textAlign: "center", width: "30%" }}>
                            {sr1Data?.clerkSignatureSrc && (
                                <Box component="img" src={sr1Data.clerkSignatureSrc} alt="clerk-sign" sx={{ height: 34, mb: 0.5 }} />
                            )}
                            <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                लिपिक / मुख्यलिपिक
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center", width: "30%" }}>
                            {sr1Data?.mandalOfficerSignatureSrc && (
                                <Box component="img" src={sr1Data.mandalOfficerSignatureSrc} alt="mandal-sign" sx={{ height: 34, mb: 0.5 }} />
                            )}
                            <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                सहा.मंडलाधिकारी
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center", width: "30%" }}>
                            {(sr1Data?.deputyCommissionerSignatureSrc || sr1Data?.signatureSrc) && (
                                <Box
                                    component="img"
                                    src={sr1Data.deputyCommissionerSignatureSrc || sr1Data.signatureSrc}
                                    alt="deputy-sign"
                                    sx={{ height: 34, mb: 0.5 }}
                                />
                            )}
                            <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                {sr1Data?.finalUseType === "निवासी" ? `प्रशासन अधिकारी  ${sr1Data?.zoneName}` : "उपायुक्त (करसंकलन)"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* ---------- divider between प्रस्ताव and फेरसादर blocks ---------- */}
                    <Box sx={{ borderTop: `1.5px solid ${palette.border}`, mt: 3, pt: 1.5 }}>
                        <Typography sx={{ fontSize: "12px", textAlign: "right", mr: 20 }}>
                            दिनांक :
                        </Typography>

                        <Typography sx={{ fontSize: "12px", mt: 1 }}>मा.स.फेरसादर,</Typography>
                        <Typography sx={{ fontSize: "12px", textAlign: "justify", lineHeight: 1.8 }}>
                            कृपया वरील प्रस्ताव पहावा. मालमत्ताधारक यांना कर आकारणी विशेष नोटीस बजावली असून, त्यांनी दि. ____/____/______ रोजी अर्जान्वये विशेष नोटीस मान्य असलेले कळविले आहे.
                            / विशेष नोटीसीचे हरकतीचे अंतिम मुदतीत मालमत्ताधारक यांनी कोणत्याही प्रकारची लेखी स्वरूपात हरकत दाखल
                            केली नाही. तरी करयोग्यमूल्य निश्चिती आदेशावर स्वाक्षरी होणेस विनंती.
                        </Typography>

                        {/* ---------- second sign-off row ---------- */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 20, px: 1 }}>
                            <Box sx={{ textAlign: "center", width: "30%" }}>
                                <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                    लिपिक / मुख्यलिपिक
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "center", width: "30%" }}>
                                <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                    सहा.मंडलाधिकारी
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "center", width: "35%" }}>
                                {sr1Data?.stampImageSrc && (
                                    <Box component="img" src={sr1Data.stampImageSrc} alt="stamp" sx={{ height: 60, mb: 0.5 }} />
                                )}
                                <Typography sx={{ fontSize: "11px", borderTop: `1px solid ${palette.border}`, pt: 0.5 }}>
                                    {sr1Data?.finalUseType === "निवासी" ? `प्रशासन अधिकारी  ${sr1Data?.zoneName}` : "उपायुक्त (करसंकलन)"}
                                </Typography>
                                <Typography sx={{ fontSize: "10px" }}>करआकारणी व करसंकलन विभाग</Typography>
                                <Typography sx={{ fontSize: "10px" }}>पिंपरी चिंचवड महानगरपालिका</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>








                {/* =========================================================
                    DOCUMENT 1 - SR-1 मालमत्ता कर आकारणीबाबत विशेष नोटीस
                   ========================================================= */}
                <Paper
                    className="print-page notice-print-page"
                    ref={noticeRef}
                    sx={{
                        width: "794px",
                        minHeight: "1123px",
                        margin: "24px auto 0",
                        p: 5,
                        border: `1px solid ${palette.border}`,
                        fontFamily: '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif',
                    }}
                >
                    {/* Header */}
                    <Box display="flex" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Box component="img" src="/pcmclogo.jpeg" alt="PCMC Logo" sx={{ width: "70px", mr: 2 }} />
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                            <Typography variant="h5" sx={{ fontWeight: "bold", color: palette.titleColor }}>
                                पिंपरी चिंचवड महानगरपालिका
                            </Typography>
                            <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>कर आकारणी व करसंकलन विभाग</Typography>
                            <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>
                                विभागीय कार्यालय-{sr1Data?.zoneName}
                            </Typography>
                            <Typography sx={{ fontWeight: "bold", fontSize: "14px", mt: 0.5 }}>
                                मालमत्ता कर आकारणीबाबत विशेष नोटीस
                            </Typography>
                            <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
                                (महाराष्ट्र महानगरपालिका अधिनियम अनुसूची 'ड' प्रकरण ८ कराधान नियम २०(२) व १५(२) अन्वये)
                            </Typography>
                        </Box>
                    </Box>

                    {/* बांधकाम / मालमत्ता स्वरुप strip */}
                    <Box sx={{ border: `1px solid ${palette.border}`, display: "flex" }}>
                        <Box sx={{ flex: 1, p: 0.6, borderRight: `1px solid ${palette.border}`, fontSize: "12px" }}>
                            <b>बांधकाम:</b> {constructionStatus}
                        </Box>
                        <Box sx={{ flex: 1, p: 0.6, fontSize: "12px" }}>
                            <b>मालमत्ता स्वरुप :</b> {sr1Data?.finalUseType}
                        </Box>
                    </Box>

                    {/* Old/new registration details + address */}
                    <Box sx={{ border: `1px solid ${palette.border}`, borderTop: "none", overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg, width: "16%" }}>
                                        मनपा जुन्या नोंदणी अन्वये विवरण
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>गट क्र.</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.gatName}</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>मालमत्ता क्र.</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.propertyCode}</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>संगणकीय मालमत्ता क्र.</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.computerNo}</TableCell>
                                    <TableCell
                                        rowSpan={2}
                                        sx={{ ...cellSx, textAlign: "left", width: "22%", verticalAlign: "top" }}
                                    >
                                        <b>मालमत्तेचा स्थानिक पत्ता</b>
                                        <br />
                                        {sr1Data?.propertyAddress}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>
                                        नवीन सर्वेक्षणानुसार विवरण
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>गट क्र.</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.gatName}</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>मालमत्ता क्र.</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.surveyPropertyCode}</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>
                                        मालमत्ता सांकेतांक (UPIC ID)
                                    </TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.upicId}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Owner / occupier / property particulars + notice paragraph + तपशील table on the
                        left, property photos stretching down the full height on the right */}
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={8}>
                            {/* Owner / occupier / property particulars */}
                            <Box sx={{ border: `1px solid ${palette.border}`, borderTop: "none", overflow: "hidden" }}>
                                <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                                    <TableBody>
                                        <InfoTableRow label="मालकाचे नाव" value={sr1Data?.ownerName} labelWidth="50%" />
                                        <InfoTableRow
                                            label="भोगवटादाराचे नाव (असल्यास)"
                                            value={sr1Data?.occupantName}
                                            labelWidth="50%"
                                        />
                                        <InfoTableRow
                                            label="अपार्टमेंट/सोसायटीचे नाव (असल्यास)"
                                            value={sr1Data?.societyName}
                                            labelWidth="50%"
                                        />
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
                                                दुकान/इमारतीचे नाव (असल्यास)
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
                                            </TableCell>
                                        </TableRow>
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
                                                फ्लॅट/दुकान क्र.
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    ...cellSx,
                                                    textAlign: "left",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                title={sr1Data?.flatNo}
                                            >
                                                {sr1Data?.flatNo}
                                            </TableCell>
                                        </TableRow>
                                        <InfoTableRow label="मालमत्ता प्रकार" value={sr1Data?.finalUseType} labelWidth="42%" />
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Notice paragraph */}
                            <Box mt={1.5}>
                                <Typography sx={{ textAlign: "justify", fontSize: "11.5px", lineHeight: 1.6 }}>
                                    आपणास महाराष्ट्र महानगरपालिका अधिनियम, प्रकरण ८, नियम २० (२) व १५ (२) अन्वये नोटीस देण्यात
                                    येते की, आपली पिंपरी चिंचवड महानगरपालिका {sr1Data?.zoneName} हद्दीतील गाळा नं.-
                                    {sr1Data?.flatShopNo}
                                    {sr1Data?.propertyAddress ? `, ${sr1Data?.propertyAddress}` : ""} या ठिकाणी इमारत /
                                    जमीन असून सध्या अस्तित्वात असलेल्या कर निर्धारण यादीत नवीन / वाढीव / वापरात बदल इमारतीची / जमिनीची
                                    कर निर्धारण यादी तयार केली असून सदर मालमत्तेवर खालील नमूद कालावधीपासून कराची आकारणी
                                    करण्याकामी तुमचे मालमत्तेचे करयोग्यमूल्य ठरविले आहे.
                                </Typography>
                            </Box>

                            {/* आकारणी न झालेल्या मालमत्तेतील वाढीव भागाचा तपशील */}
                            <Box mt={1.5}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        color: "#fff",
                                        bgcolor: palette.titleColor,
                                        px: 1,
                                        py: 0.4,
                                    }}
                                >
                                    आकारणी न झालेल्या मालमत्तेतील नविन / वापराबद्दल / वाढीव भागाचा तपशील
                                </Typography>
                                <Box sx={{ border: `1px solid ${palette.border}`, borderTop: "none", overflow: "hidden" }}>
                                    <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: palette.headerBg }}>
                                                <TableCell sx={{ ...cellSx, fontWeight: "bold", textAlign: "left" }}>वापर</TableCell>
                                                {useCategories.map((c) => (
                                                    <TableCell key={c.key} sx={{ ...cellSx, fontWeight: "bold" }}>
                                                        {c.label}
                                                    </TableCell>
                                                ))}
                                                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>एकूण</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sr1Data?.srGenarationVO?.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell
                                                        sx={{
                                                            ...cellSx,
                                                            textAlign: "left",
                                                            fontWeight: "bold",
                                                            bgcolor: palette.labelBg
                                                        }}
                                                    >
                                                        {row?.parameter}
                                                    </TableCell>

                                                    <TableCell sx={cellSx}>
                                                        {row?.nivasiDetail || "0"}
                                                    </TableCell>

                                                    <TableCell sx={cellSx}>
                                                        {row?.bigarNivasiDetail || "0"}
                                                    </TableCell>

                                                    <TableCell sx={cellSx}>
                                                        {row?.audyogikDetail || "0"}
                                                    </TableCell>

                                                    <TableCell sx={cellSx}>
                                                        {row?.mokalijaminDetail || "0"}
                                                    </TableCell>

                                                    <TableCell sx={cellSx}>
                                                        {row?.parkingDetail || "0"}
                                                    </TableCell>

                                                    <TableCell
                                                        sx={{
                                                            ...cellSx,
                                                            //fontWeight: "bold"
                                                        }}
                                                    >
                                                        {row?.ekunDetail || "0"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Property photos - stretches (via Grid's default alignItems: "stretch")
                            to match the combined height of the owner table + paragraph + तपशील table
                            on the left, so everything lines up on one A4 page. Always shows
                            मालमत्तेचे छायाचित्र first, then इमारत छायाचित्र, regardless of API order. */}
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
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                {noticePhotos.map((doc) => (
                                    <Box
                                        key={doc.documentId}
                                        sx={{
                                            height: "48%",
                                            minHeight: 0,
                                            flexShrink: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 0.3,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minHeight: 0,
                                                border: `1px solid ${palette.border}`,
                                                borderRadius: "4px",
                                                overflow: "hidden",
                                                bgcolor: palette.labelBg,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {documentUrls[doc.documentId] ? (
                                                <Box
                                                    component="img"
                                                    src={documentUrls[doc.documentId]}
                                                    alt={doc.documentName}
                                                    sx={{
                                                        width: "100%",
                                                        height: "225px",
                                                        objectFit: "contain",
                                                        display: "block",
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: "225px",
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
                                        <Typography
                                            sx={{
                                                fontSize: "9px",
                                                textAlign: "center",
                                                color: palette.text,
                                            }}
                                        >
                                            {doc.documentName}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Legal boilerplate paragraphs */}
                    <Box mt={2} sx={{ textAlign: "justify", fontSize: "11.5px", lineHeight: 1.7 }}>
                        <Typography sx={{ fontSize: "11.5px" }}>
                            सबब, या ठरविण्यात आलेल्या करयोग्य मूल्यांचे रकमेबाबत अथवा कर आकारणी रजिस्टर मधील इतर कोणत्याही
                            नोंदीबाबत आपली काही हरकत अथवा तक्रार असेल तर ती उक्त कायद्यातील प्रकरण ८, नियम १६ ला अधिन राहून
                            सबळ कारणासह व पुराव्याच्या कागदपत्रांसह लेखी अर्ज मा. सहायक आयुक्त (कर) / प्रशासन अधिकारी (कर)
                            यांचे नावे महानगरपालिकेचे{" "}
                            {sr1Data?.zoneAddress}
                            विभागीय कार्यालय /करसंकलन मुख्यालय या ठिकाणी दि. <b>____/____/_______</b> रोजी दुपारी{" "}
                            <b>3.00</b> वा. पर्यंत मिळेल अशा रीतीने पोस्टाने पाठवावी किंवा समक्ष दाखल करावी व पोहोच घ्यावी,
                            दिनांक <b>____/____/_______</b> दुपारी 3.00 नंतर आलेल्या किंवा योग्य कारणे न देता आलेल्या
                            हरकती किंवा तक्रार अर्जांचा विचार केला जाणार नाही. तसेच मुदतीत हरकत किंवा तक्रार अर्ज न आल्यास
                            करयोग्य मूल्य व इतर नोंदी आपणास मान्य आहेत असे समजून त्या कायम केल्या जातील.
                        </Typography>
                        {sr1Data?.permission === "N" && (
                            <Typography sx={{ fontSize: "11.5px", mt: 1 }}>
                                महाराष्ट्र महानगरपालिका अधिनियमातील कलम २६७अ नुसार आपल्या अवैध/ अनधिकृत मालमत्तेचे किंवा
                                मालमत्तेच्या भागाचे अवैधरित्या झालेल्या बांधकामांना ते बांधकाम जोपर्यंत अवैध बांधकाम म्हणून राहील,
                                तोपर्यंत अधिनियमातील तरतुदीनुसार / शासन आदेशानुसार शास्ती भरण्यास पात्र राहील. तसेच या
                                बांधकामावर मालमत्ता कर आकारणी व अवैध बांधकाम शास्तीची आकारणी केली म्हणजे सदरचे बांधकाम विनियमित
                                झाले आहे असा अन्वयार्थ लावला जाणार नाही. अधिनियमातील कलम २६० व ३९७अ तरतुदीनुसार अवैध/ अनधिकृत
                                बांधकाम निष्कासित करण्याची संबंधित वैधानिक महामंडळ यांनी कारवाई केल्यास आपणास प्रतिबंध/ विरोध/
                                अटकाव करता येणार नाही किंवा न्यायालयात दावा दाखल करता येणार नाही, तसेच सदर अवैध/ अनधिकृत
                                मालमत्तेवर कोणत्याही स्वरुपाचा कोणत्याही वित्तीय संस्थेचा बोजा असेल व सदर मालमत्ता कलम २६० व
                                ३९७अ चे तरतुदी प्रमाणे निष्कासित केली तर, निष्कासित कार्यवाही करणारी संस्था सदर बोजास जबाबदार
                                राहणार नसुन निष्कासनाचा खर्च वसुल करणेत येईल.
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: "11.5px", mt: 1 }}>
                            मालमत्तेच्या कर योग्य मूल्याबाबत, मालकी हक्काबाबत किंवा वर्णनासह इतर नोंदी बाबतचा तपशील
                            महानगरपालिकेच्या वरील विभागीय कार्यालयात सुट्टीचे दिवस सोडून कार्यालयीन वेळेत{" "}
                            <b>स.11.00</b> ते <b>दु.3.00</b> वाजेपर्यंत पाहावयास मिळेल.
                        </Typography>
                    </Box>

                    {/* Number / date + signatory */}
                    <Grid container spacing={2} mt={2} alignItems="flex-start">
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: "12px" }}>
                                क्रमांक : <b>{sr1Data?.srNumber}</b>
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }}>
                                दिनांक :
                            </Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Box sx={{ textAlign: "right" }}>
                                {sr1Data?.signatureSrc && (
                                    <Box component="img" src={sr1Data.signatureSrc} alt="signature" sx={{ height: 44 }} />
                                )}
                                <Typography align="right" sx={{ fontWeight: "bold", fontSize: "12px", mt: 0.5 }}>
                                    {sr1Data?.finalUseType === "निवासी" ? `प्रशासन अधिकारी  ${sr1Data?.zoneName}` : "उपायुक्त (करसंकलन)"}
                                </Typography>
                                <Typography align="right" sx={{ fontSize: "12px" }}>
                                    पिंपरी चिंचवड महानगरपालिका
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Acceptance / service-of-notice block */}
                    <Box sx={{ border: `1px solid ${palette.border}`, mt: 1, overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, textAlign: "left" }} colSpan={2}>
                                        नोटीस स्वीकारणाऱ्याचे नाव : <b>{sr1Data?.acceptorName || sr1Data?.ownerName}</b>
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, textAlign: "left" }} colSpan={2}>
                                        नोटीस बजावणाऱ्याचे नाव : <b>{sr1Data?.servedByName}</b>
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: palette.altRowBg }}>
                                    <TableCell sx={{ ...cellSx, textAlign: "left", fontWeight: "bold", bgcolor: palette.labelBg }}>सही :</TableCell>
                                    <TableCell sx={cellSx}></TableCell>
                                    <TableCell sx={{ ...cellSx, textAlign: "left", fontWeight: "bold", bgcolor: palette.labelBg }}>सही :</TableCell>
                                    <TableCell sx={cellSx}></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, textAlign: "left", fontWeight: "bold", bgcolor: palette.labelBg }}>दिनांक :</TableCell>
                                    <TableCell sx={cellSx}></TableCell>
                                    <TableCell sx={cellSx} colSpan={2}></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Footer note about online payment */}
                    <Box mt={1.5} sx={{ border: `1px solid ${palette.border}`, bgcolor: palette.labelBg, p: 1 }}>
                        <Typography sx={{ fontSize: "10px", textAlign: "justify" }}>
                            टीप-1) उपरोक्त नोटीस मधील मालमत्तेचे करयोग्य मूल्य व आकारणी मान्य असल्यास QR Code Scan करुन
                            मालमत्तेचा तपशील, देय होणारी बिलाची रक्कम पाहून Online मान्यता द्यावी. आपणास तात्काळ करयोग्य
                            मूल्य निश्चिती आदेश व मालमत्ता कराचे बिल उपलब्ध होईल त्यानुसार आपण बिल भरणा करावा.
                        </Typography>
                    </Box>
                </Paper>

                {/* =========================================================
                    DOCUMENT 3 - पाहणी अहवाल (Site Inspection Report), filled
                    by the मूल्यांकन कार्यालय (valuation office). Rendered below
                    the प्रस्ताव, all fields sourced from the same sr1Data.
                   ========================================================= */}
                <Paper
                    className="print-page"
                    ref={pahaniRef}
                    sx={{
                        width: "794px",
                        minHeight: "1123px",
                        margin: "0 auto 0",
                        marginTop: 2,
                        p: 4,
                        border: `1.5px solid ${palette.border}`,
                        fontFamily: '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif',
                    }}
                    elevation={0}
                >
                    {/* ---------- Header ---------- */}
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: palette.titleColor }}>
                            {sr1Data?.zoneName}- कर संकलन विभागीय कार्यालय
                        </Typography>
                        <Typography sx={{ fontWeight: "bold", fontSize: "14px", color: palette.titleColor }}>
                            करयोग्य मूल्य निश्चितीकामी मूल्यांकन कार्यालयाने भरावयाची माहिती
                        </Typography>
                        <Typography sx={{ fontSize: "13px", mt: 0.5 }}>
                            मालमत्तेची दिनांक <b>{sr1Data?.srDate}</b> रोजी समक्ष पाहणी केली असता खालील वस्तुस्थिती
                            निदर्शनास आली
                        </Typography>
                    </Box>

                    {/* मनपा नोंदी अन्वये / नुविन सर्वेक्षणा अंतर्गत विवरण */}
                    <Box sx={{ border: `1px solid ${palette.border}`, mt: 1, width: "100%", overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <TableRow sx={{ bgcolor: palette.headerBg }}>
                                    <TableCell rowSpan={2} sx={{ ...cellSx, fontWeight: "bold", width: "15%" }}>मनपा नोंदी अन्वये</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>गट क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>संगणकीय मा.क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>मालमत्ता क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>झोनिंग विभाग क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>मालमत्ता प्रकार</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>इंडेक्स २ प्रमाणे चटई क्षेत्रफळ चौ.मी.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={cellSx}>-</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.computerNo}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.propertyCode}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.zoningNo}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.propertyType}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.index2CarpetArea}</TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: palette.headerBg }}>
                                    <TableCell rowSpan={2} sx={{ ...cellSx, fontWeight: "bold" }}>विवरण</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>गट क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>इमारत क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>मालमत्ता क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>झोनिंग विभाग क्र.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>मालमत्ता प्रकार</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>एकूण करपात्र क्षेत्रफळ चौ.मी.</TableCell>
                                </TableRow>
                                <TableRow>
                                    {/* NOTE: second "विवरण" row is static "-" placeholders in the
                                        source flow (no dedicated survey/new-registration fields
                                        wired up yet) - kept as-is rather than guessing keys. */}
                                    <TableCell sx={cellSx}>{sr1Data?.gatName}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.buildingNo}</TableCell>
                                    <TableCell sx={cellSx}>-</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.zoneName}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.finalUseType}</TableCell>
                                    <TableCell sx={cellSx}>{sr1Data?.builtUpAreaInSQMT || "0.00"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Owner / property particulars */}
                    <Box sx={{ border: `1px solid ${palette.border}`, mt: 1, width: "100%", overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <InfoTableRow label="मालकाचे नाव" value={sr1Data?.ownerName} />
                                <InfoTableRow label="भोगवटादाराचे नाव" value={sr1Data?.occupantName} />
                                <InfoTableRow label="मालमत्तेचा स्थानिक पत्ता" value={sr1Data?.propertyAddress} />
                                <InfoTableRow label="गृहनिर्माण संस्था/सोसायटीचे नाव" value={sr1Data?.societyName} />
                                <InfoTableRow
                                    label="वाणिज्य आस्थापना/इमारतीचे नाव"
                                    value={sr1Data?.buildingNo}
                                />
                                <InfoTableRow label="विंग-गाळा/सदनिका क्र." value={sr1Data?.flatNo} />
                                <InfoTableRow label="ईमेल आयडी" value={sr1Data?.ownerMail} />
                                <InfoTableRow label="दूरध्वनी क्रमांक" value={sr1Data?.ownerMobile} />
                                <InfoTableRow label="आधार क्रमांक" value={sr1Data?.ownerAdhar} />
                            </TableBody>
                        </Table>
                    </Box>

                    {/* मनपा नोंदी अन्वये मालमत्तेचा तपशील */}
                    <Box mt={2}>
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                color: "#fff",
                                bgcolor: palette.titleColor,
                                px: 1,
                                py: 0.4,
                            }}
                        >
                            मनपा नोंदी अन्वये मालमत्तेचा तपशील
                        </Typography>
                        <Box sx={{ border: `1px solid ${palette.border}`, borderTop: "none", width: "100%", overflow: "hidden" }}>
                            <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ ...cellSx, textAlign: "left", fontWeight: "bold", bgcolor: palette.labelBg, width: "30%" }}>
                                            क्षेत्रफळ (चौ.मी.)
                                        </TableCell>
                                        {/* NOTE: source flow leaves these two values as static "-" here
                                            (the real numbers appear later in the एकुण row of the
                                            construction table below) - kept as-is. */}
                                        <TableCell sx={{ ...cellSx, textAlign: "left", width: "20%" }}>{totalRow?.area || "0.00"}</TableCell>
                                        <TableCell sx={{ ...cellSx, textAlign: "left", fontWeight: "bold", bgcolor: palette.labelBg, width: "30%" }}>
                                            करयोग्य मूल्य
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, textAlign: "left" }}>{totalTaxableValue}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>

                    {/* Construction / valuation detail table */}
                    <Box sx={{ border: `1px solid ${palette.border}`, overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: palette.headerBg }}>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>मजला</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>बांधकामाचा दर्जा</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>वापर</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>वापर उपप्रकार</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>चटई क्षेत्रफळ चौ.मी.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>करपात्र एकूण क्षेत्रफळ चौ.मी. (BuiltUp)</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>वार्षिक दर रु. प्र.चौ.मी.</TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>करयोग्य मूल्य रु.</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {constructionRows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg }}>
                                            {row.floor}
                                        </TableCell>
                                        <TableCell sx={cellSx}>{row.constructionType}</TableCell>
                                        <TableCell sx={cellSx}>{row.useType}</TableCell>
                                        <TableCell sx={cellSx}>{row.subUseType}</TableCell>
                                        <TableCell sx={cellSx}>{row.areaInSQMT}</TableCell>
                                        <TableCell sx={cellSx}>{row.builtUpAreaInSQMT}</TableCell>
                                        <TableCell sx={cellSx}>{row.billRate}</TableCell>
                                        <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>{row.rateableValue}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        sx={{ ...cellSx, fontWeight: "bold", bgcolor: palette.labelBg, textAlign: "right" }}
                                    >
                                        एकूण
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>{totalValue}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Photo + floor plan - always इमारत छायाचित्र first (cover), then
                        मालमत्तेचा नकाशा/आराखडा second (contain), regardless of API order */}
                    <Grid container spacing={2} mt={2}>
                        {pahaniPhotos.map((doc, index) => (
                            <Grid item xs={6} key={doc.documentId}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "250px",
                                        border: `1px solid ${palette.border}`,
                                        overflow: "hidden",
                                    }}
                                >
                                    {documentUrls[doc.documentId] ? (
                                        <Box
                                            component="img"
                                            src={documentUrls[doc.documentId]}
                                            alt={doc.documentName}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: index === 0 ? "cover" : "contain",
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
                                                fontSize: "12px",
                                            }}
                                        >
                                            Loading...
                                        </Box>
                                    )}
                                </Box>

                                {/* Show document name below image */}
                                <Typography
                                    sx={{
                                        fontSize: "9px",
                                        textAlign: "center",
                                        mt: 0.5,
                                        color: palette.text,
                                    }}
                                >
                                    {doc.documentName}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Footnotes / legend */}
                    <Box
                        mt={2}
                        sx={{
                            fontSize: "9px",
                            lineHeight: 1.4,
                            textAlign: "justify",
                            border: `1px solid ${palette.border}`,
                            bgcolor: palette.labelBg,
                            p: 1,
                        }}
                    >


                        <Typography sx={{ fontSize: "9px", mt: 0.5 }}>
                            <b>टिप:</b> <br /> (१) कुठल्याही मानवी तसेच संगणकीय चूक दुरुस्तीचे अधिकार राखीव ठेवण्यात येत आहे. <br /> (२) सदर प्रत
                            कुठल्याही प्रकारच्या शासकीय अथवा मालकी हक्काचा दाखला म्हणून ग्राह्य होणार नाही.
                        </Typography>


                    </Box>

                    <Box
                        mt={2}
                        sx={{
                            fontSize: "9px",
                            lineHeight: 1.4,
                            textAlign: "justify",
                            border: `1px solid ${palette.border}`,
                            bgcolor: palette.labelBg,
                            p: 1,
                        }}
                    >


                        <Typography sx={{ fontSize: "9px", mt: 0.5, height: 80 }}>
                            <b> शेरांकन:- </b> <br />
                        </Typography>


                    </Box>


                    {/* Signature row */}
                    <Box sx={{ border: `1px solid ${palette.border}`, mt: 1, width: "100%", overflow: "hidden" }}>
                        <Table sx={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }} size="small">
                            <TableBody>
                                <TableRow sx={{ bgcolor: palette.headerBg }}>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", width: "30%" }}>गटप्रमुख </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold", width: "30%" }}>सहा. मंडल अधिकारी </TableCell>
                                    <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>मालमत्ताधारक</TableCell>
                                </TableRow>
                                <TableRow sx={{ height: 60 }}>
                                    <TableCell sx={cellSx}></TableCell>
                                    <TableCell sx={cellSx}></TableCell>
                                    <TableCell sx={cellSx}>
                                        <Typography sx={{ fontSize: "9px", mb: 8 }}>
                                            <b>मालमत्तेची पाहणी माझे समक्ष केली असून उपरोक्त माहिती मला मान्य आहे.</b>
                                            <hr />
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px" }}>
                                            {signatoryName || sr1Data?.assistantOfficerName}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>


            </DashBoardContainer>
        </>
    );
};

export default PropertyTaxDocumentBundle;