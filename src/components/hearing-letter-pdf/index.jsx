import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Box, Typography, Paper, Button } from "@mui/material";
import DashBoardContainer from "../layout/dashboard-container";
import { saveHearing } from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";

const FONT = '"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif';

// Same key the hearing section writes to before opening this page
const HEARING_LETTER_KEY = "hearingLetterData";

const REQUIRED_DOCUMENTS = [
    "इमारत बांधली त्या जागेचा स.नं. / सि.स.नं. चा उतारा.",
    "भाडे पावत्या किंवा भाडे संबंधिचे करारनामे व भाडे संबंधीची इतर कागदपत्रे.",
    "बांधकामाचा मंजुर केलेला नकाशा / नूतनीकरण अर्ज / भोगवटापत्रकाची प्रत.",
    "जागेची मालकी हक्काची कागदपत्रे.",
    "इतरही काही मालकी हक्काचे कागदपत्र असतील तर ती दाखल करावीत.",
    "हरकतीच्या/अर्जाच्या अनुषंगाने कागदपत्रे सादर करावीत.",
    "इतर कागदपत्रे,",
];

// Marathi numerals for the numbered list (१) ... (७)
const toMarathiDigits = (n) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[d]);

// ---- Map the save-API response to the fields the letter shows ----
const mapLetterData = (res = {}) => ({
    letterDate: new Date().toLocaleDateString("en-GB"), // dd/mm/yyyy
    ownerName: res.propertyName,
    occupantName: res.propertyOccupantName,
    propertyAddress: res.propertyAddress,
    objectionDate: res.objectionDate,
    hearingDate: res.hearingDate,
    hearingTime: res.hearingTime,
    hearingPlace: res.zoneAddress,
    // optional extras (letter hides them when missing)
    outwardNo: res.outwardNo,
    signatureSrc: res.signatureSrc,
    signatoryTitle: res.signatoryTitle,
    // ids for the save API
    srNumber: res.srNumber,
    transactionId: res.propertyTransactionId,
});

// label : value row used for मालकाचे नाव / भोगवटादाराचे नाव / पत्ता
const PartyRow = ({ label, value }) => (
    <Box sx={{ display: "flex", fontSize: "14px", lineHeight: 1.7 }}>
        <Box sx={{ width: "150px", flexShrink: 0 }}>{label}</Box>
        <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
);

const bodyText = { fontSize: "14px", lineHeight: 1.8, textAlign: "justify" };

const HearingLetterPage = () => {
    const letterRef = useRef(null);
    const pdfSavedRef = useRef(false);
    const [letter, setLetter] = useState(null);
    const [noData, setNoData] = useState(false);

    // ---- read the data the hearing section stored just before opening this tab ----
    useEffect(() => {
        try {
            const raw = localStorage.getItem(HEARING_LETTER_KEY);
            if (!raw) {
                setNoData(true);
                return;
            }
            setLetter(mapLetterData(JSON.parse(raw)));
        } catch (error) {
            console.error("Error reading hearing letter data:", error);
            setNoData(true);
        }
    }, []);

    // ---- rasterise the letter into a PDF base64 string ----
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
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const pageWidth = 210;
        const pageHeight = 297;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");

        if (imgHeight > pageHeight) {
            console.warn(
                `PDF content is ${imgHeight.toFixed(2)}mm high. A4 height is ${pageHeight}mm.`
            );
        }

        const blob = pdf.output("blob");
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // ---- the ONE save function: generate the PDF and send it to the server ----
    const savePdfToServer = async () => {
        try {
            const pdfBase64 = await generatePdfBase64(letterRef);
            await saveHearing({
                documentName: "सुनावणी नोटीस",
                transactionId: letter?.transactionId,
                documentURLbase64: pdfBase64,
            });

            showToastSuccess("Hearing letter saved successfully");
        } catch (error) {
            console.error("PDF Save Error", error);
            showToastError("Failed to save hearing letter");
        }
    };

    // ---- auto-save once, after the letter has rendered ----
    useEffect(() => {
        if (!letter || pdfSavedRef.current) return;
        const timer = setTimeout(async () => {
            pdfSavedRef.current = true;
            await savePdfToServer();
        }, 2000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, [letter]);

    return (
        <>
            <style>
                {`
        @media print {
            @page { size: A4 portrait; margin: 0; }
            html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
            body * { visibility: hidden; }
            .print-page, .print-page * { visibility: visible; }
            .print-page {
                width: 794px !important;
                min-height: 1123px !important;
                box-sizing: border-box !important;
                margin: 0 auto !important;
                border: none !important;
                box-shadow: none !important;
                font-family: "Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif !important;
            }
            .no-print { display: none !important; }
        }
    `}
            </style>

            <DashBoardContainer>
                <Button
                    variant="contained"
                    onClick={() => window.print()}
                    className="no-print"
                    disabled={!letter}
                    sx={{ mb: 1, "@media print": { display: "none" } }}
                >
                    Print
                </Button>

                {noData && (
                    <Typography className="no-print" sx={{ color: "text.secondary", mt: 2 }}>
                        No hearing letter data found. Please save the hearing with "Send
                        Hearing Invite" again.
                    </Typography>
                )}

                {/* =========================================================
                    सुनावणी पत्र (Hearing Letter)
                   ========================================================= */}
                {letter && (
                    <Paper
                        className="print-page"
                        ref={letterRef}
                        elevation={0}
                        sx={{
                            width: "794px",
                            minHeight: "1123px",
                            margin: "24px auto 0",
                            p: 4,
                            boxSizing: "border-box",
                            border: "1px solid #ccc",
                            color: "#000",
                            fontFamily: FONT,
                        }}
                    >
                        {/* ---------- Header ---------- */}
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <Box
                                component="img"
                                src="/pcmclogo.jpeg"
                                alt="PCMC Logo"
                                sx={{ width: "110px", flexShrink: 0 }}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    sx={{ fontSize: "26px", fontFamily: FONT, lineHeight: 1.3 }}
                                >
                                    पिंपरी चिंचवड महानगरपालिका, पिंपरी, पुणे - ४११ ०१८.
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "18px",
                                        fontFamily: FONT,
                                        textAlign: "center",
                                        maxWidth: "520px",
                                    }}
                                >
                                    करआकारणी व करसंकलन विभाग
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        maxWidth: "540px",
                                        fontSize: "11px",
                                        mt: 0.3,
                                        ml: 2,
                                    }}
                                >
                                    <Box>
                                        <div>दुरध्वनी क्रमांक : 020-67331504</div>
                                        <div style={{ marginLeft: "64px" }}>020-67331506</div>
                                    </Box>
                                    <Box>
                                        <div>E-mail : ptax@pcmcindia.gov.in</div>
                                        <div>Website : www.pcmcindia.gov.in</div>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ borderTop: "1.5px dashed #000", mt: 1 }} />

                        {/* ---------- जावक क्रमांक / दिनांक ---------- */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: letter.outwardNo ? "space-between" : "flex-end",
                                fontSize: "13px",
                                mt: 1,
                            }}
                        >
                            {letter.outwardNo && <Box>जावक क्रमांक : {letter.outwardNo}</Box>}
                            <Box>दिनांक : {letter.letterDate}</Box>
                        </Box>

                        {/* ---------- Title ---------- */}
                        <Typography
                            sx={{
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "16px",
                                mt: 3,
                                mb: 0.5,
                                fontFamily: FONT,
                            }}
                        >
                            सुनावणी पत्र
                        </Typography>

                        {/* ---------- प्रति / owner / occupant / address ---------- */}
                        <Typography sx={{ fontWeight: "bold", fontSize: "14px", fontFamily: FONT }}>
                            प्रति,
                        </Typography>
                        <PartyRow label="मालकाचे नाव :" value={letter.ownerName} />
                        <PartyRow label="भोगवटादाराचे नाव :" value={letter.occupantName} />
                        <PartyRow label="पत्ता :" value={`${letter.propertyAddress || ""}`} />

                        {/* ---------- विषय / संदर्भ ---------- */}
                        <Box sx={{ ml: "250px", mt: 1.5 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: "15px", fontFamily: FONT }}>
                                विषय : मिळकतकर आकारणीबाबत
                            </Typography>
                            <Typography sx={{ fontWeight: "bold", fontSize: "15px", fontFamily: FONT }}>
                                संदर्भ : आपला दि. {letter.objectionDate} रोजीचा हरकत अर्ज
                            </Typography>
                        </Box>

                        {/* ---------- Intro paragraph ----------
                            zone / gat are not in the API response, so the paragraph refers
                            to the property address above instead. */}
                        <Typography sx={{ ...bodyText, mt: 2, textIndent: "24px" }}>
                            पिंपरी चिंचवड महानगरपालिका हद्दीतील आपल्या वर नमूद मिळकतीचे कर आकारणी
                            संदर्भात हरकत अर्जाची सुनावणी खालील प्रमाणे होणार आहे.
                        </Typography>

                        {/* ---------- Hearing date / time / place ---------- */}
                        <Box sx={{ ml: 3, mt: 2 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: "16px", fontFamily: FONT }}>
                                सुनावणी तारीख : {letter.hearingDate}
                                <span style={{ marginLeft: "20px" }}>वेळ : {letter.hearingTime}</span>
                            </Typography>
                            <Typography sx={{ fontWeight: "bold",fontSize: "16px", fontFamily: FONT, lineHeight: 1.6 }}>
                                सुनावणीचे ठिकाण : {letter.hearingPlace}
                            </Typography>
                        </Box>

                        <Typography sx={{ ...bodyText, mt: 1, textIndent: "24px" }}>
                            सुनावणीस आपल्या वतीने कोणत्याही व्यक्तीस अधिकारपत्र दाखल करून हजर राहता येईल. मात्र
                            आपण अगर आपले प्रतिनिधी गैरहजर राहिल्यास आपली काहीही तक्रार नाही असे समजून केस
                            निकालात काढली जाईल.
                        </Typography>

                        {/* ---------- सूचना + document list ---------- */}
                        <Typography sx={{ ...bodyText, mt: 1.5 }}>
                            सूचना : सुनावणीस येताना खालीलप्रमाणे पुराव्याची कागदपत्रे व हे पत्र बरोबर घेऊन यावे.
                        </Typography>

                        <Box sx={{ mt: 2.5, ml: 2 }}>
                            {REQUIRED_DOCUMENTS.map((text, idx) => (
                                <Typography
                                    key={idx}
                                    sx={{ fontSize: "14px", lineHeight: 1.9, fontFamily: FONT }}
                                >
                                    {toMarathiDigits(idx + 1)}) {text}
                                </Typography>
                            ))}
                        </Box>

                        {/* ---------- Legal paragraphs ---------- */}
                        <Typography sx={{ ...bodyText, mt: 3, textIndent: "24px" }}>
                            महाराष्ट्र महानगरपालिका अधिनियम प्रकरण ८ (कराधान नियम) नियम ८ प्रमाणे कर
                            आकारणीसाठी अचूक माहिती सादर करणे हे बंधनकारक असून माहिती सादर न केल्यास अथवा
                            चुकीची सादर केल्यास उक्त नियमातील तरतुदीनुसार मिळकतीवर एकतर्फी कर आकारणी करण्यात
                            येईल व त्यानुसार मिळकतकराचे बिल बजावण्यात येईल, तसेच केलेल्या कर आकारणीस आक्षेप
                            घेण्यास प्रतिबंध करण्यात येईल.
                        </Typography>
                        <Typography sx={{ ...bodyText, textIndent: "24px" }}>
                            मागणी केलेली कागदपत्रे सादर न करणे किंवा योग्य माहिती सादर न करणे उक्त अधिनियमातील
                            कलम ३९३ प्रमाणे तसेच भारतीय दंड संहितेच्या यथास्थिती कलम १७६ व १७७ अन्वये शिक्षापात्र
                            अपराध केला आहे असे मानले जाईल, याची नोंद घ्यावी.
                        </Typography>

                        <Typography sx={{ ...bodyText, mt: 2, ml: 3 }}>
                            सबब उपरोक्त प्रमाणे प्रमाणित केलेली कागदपत्रे सुनावणीचे वेळी सादर करावीत.
                        </Typography>

                        {/* ---------- Optional signature (shown only if available) ---------- */}
                        {(letter.signatureSrc || letter.signatoryTitle) && (
                            <Box sx={{ textAlign: "right", mt: 6, pr: 2 }}>
                                {letter.signatureSrc && (
                                    <Box
                                        component="img"
                                        src={letter.signatureSrc}
                                        alt="signature"
                                        sx={{ height: 44 }}
                                    />
                                )}
                                {letter.signatoryTitle && (
                                    <Typography sx={{ fontWeight: "bold", fontSize: "13px", fontFamily: FONT }}>
                                        {letter.signatoryTitle}
                                    </Typography>
                                )}
                                <Typography sx={{ fontSize: "13px", fontFamily: FONT }}>
                                    पिंपरी चिंचवड महानगरपालिका
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                )}
            </DashBoardContainer>
        </>
    );
};

export default HearingLetterPage;