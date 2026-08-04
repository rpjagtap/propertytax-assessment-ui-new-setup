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
} from "@mui/material";
import DashBoardContainer from "../layout/dashboard-container";
import { generatesr1, saveSr } from "../../services/assessment-services";

const AssessmentDocument = () => {
    const pdfRef = useRef(null);
    const signatureSrc = "";
    const signatoryName = "";
    const [applicationId, setApplicationId] = useState(null);
    const [transactionTypeId, setTransactionTypeId] = useState(null);
    const [formData, setFormData] = useState(null);
    const [sr1Data, setSr1Data] = useState();

    useEffect(() => {
        const idFromStorage = localStorage.getItem("applicationId");
        const transactionTypeId = localStorage.getItem("transactionTypeId");
        if (idFromStorage) {
            setApplicationId(idFromStorage);
            setTransactionTypeId(transactionTypeId);
        }
    }, []);

    useEffect(() => {
        if (applicationId && transactionTypeId) {
            fetchData(applicationId, transactionTypeId);
        }
    }, [applicationId, transactionTypeId]);

    const fetchData = async (id, transactionTypeId) => {
        try {
            const body = { applicationId: id, transactionTypeId: transactionTypeId };

            //  console.log("REQUEST BODY:", body);
            const response = await generatesr1(body);
            setSr1Data(response);
            localStorage.removeItem("applicationId");
            localStorage.removeItem("transactionTypeId");
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Generate PDF Base64
    const generatePdfBase64 = async () => {
        const element = pdfRef.current;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = 210;
        const pageHeight = 297;

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        heightLeft -= pageHeight;

        // Additional pages
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pageHeight;
        }
        const blob = pdf.output("blob");

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64 = reader.result.split(",")[1];
                resolve(base64);
            };

            reader.onerror = reject;

            reader.readAsDataURL(blob);
        });
    };

    // Save PDF
    const savePdfToServer = async () => {
        try {
            const pdfBase64 = await generatePdfBase64();

            const body = {
                srNumber: sr1Data?.srNumber,
                transactionId: 53,
                documentURLbase64: pdfBase64,
            };

           const response = await saveSr(body);

            localStorage.removeItem("applicationId");
            localStorage.removeItem("transactionTypeId");

        } catch (error) {
            console.error("PDF Save Error", error);
        }
    };

    // AUTO SAVE AFTER 2 SECONDS
    const pdfSavedRef = useRef(false);

    useEffect(() => {
        if (!sr1Data || pdfSavedRef.current) return;

        const timer = setTimeout(async () => {
            pdfSavedRef.current = true;
            await savePdfToServer();
        }, 2000);

        return () => clearTimeout(timer);
    }, [sr1Data]);

    return (
        <DashBoardContainer>
            <Box mt={1} ml={140}>

            </Box>
            <Paper
                ref={pdfRef}
                sx={{
                    width: "794px",
                    minHeight: "1123px",
                    margin: "auto",
                    p: 5,
                    border: "1px solid black",
                    fontFamily: "serif",
                }}
                elevation={0}
            >

                <Box display="flex" justifyContent="space-between" alignItems="flex-start">

                    <Box component="img" src="/pcmclogo.jpeg" alt="PCMC Logo" sx={{ width: "12%" }}></Box>

                    <Box sx={{ width: "70%", textAlign: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            पिंपरी चिंचवड महानगरपालिका
                        </Typography>
                        <Typography sx={{ fontWeight: "bold" }}>
                            करआकारणी व करसंकलन विभाग <br />
                            मालमत्ता कर आकारणीबाबत विशेष नोटीस
                        </Typography>
                        <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
                            (महाराष्ट्र महानगरपालिका अधिनियम अनुसूची 'ड' क्र. ८ नियम २०(२) / १५(२) अन्वये)
                        </Typography>
                    </Box>

                    <Box sx={{ width: "43%", fontSize: "14px", lineHeight: 1.2 }}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container sx={{ mb: 1 }}>
                                <Grid item sx={{ width: "130px", fontWeight: "bold" }}> विभागीय कार्यालय - </Grid>
                                <Grid item xs> {sr1Data?.zoneName} </Grid>
                            </Grid>

                            <Grid container sx={{ mb: 1 }}>
                                <Grid item sx={{ width: "130px", fontWeight: "bold" }}> गट व ब्लॉक क्रमांक - </Grid>
                                <Grid item xs> {sr1Data?.gatName} / {sr1Data?.blockNo} </Grid>
                            </Grid>

                            <Grid container sx={{ mb: 1 }}>
                                <Grid item sx={{ width: "130px", fontWeight: "bold" }}> इमारत क्रमांक - </Grid>
                                <Grid item xs> {sr1Data?.blockNo} </Grid>
                            </Grid>

                            <Grid container sx={{ mb: 1 }}>
                                <Grid item sx={{ width: "130px", fontWeight: "bold" }}>
                                    मालमता क्रमांक - {sr1Data?.propertyCode}
                                </Grid>
                                <Grid item xs>
                                    {/* Empty */}
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
                <hr />
                <Box
                    sx={{
                        fontSize: "14px",
                        lineHeight: 1.6,
                        "& .MuiTypography-root": {
                            fontSize: "inherit",
                            lineHeight: "inherit",
                        },
                    }}
                >
                    <Box mt={3}>
                        <Grid container>
                            <Grid item xs={6}>
                                <Typography><b>बांधकाम:</b> अधिकृत</Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                                <Typography><b>बांधकाम प्रकार:</b> नवीन</Typography>
                            </Grid>
                        </Grid>
                        <br />
                        <b>प्रति,</b> <br />
                        <Grid container>
                            <Grid item xs={3}>
                                <Typography fontWeight="bold">मालकाचे नाव:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography>
                                    {sr1Data?.ownerName}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Grid container>
                            <Grid item xs={3}>
                                <Typography fontWeight="bold">भोगवटादाराचे नाव:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography>
                                    {sr1Data?.occupantName}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Grid container>
                            <Grid item xs={3}>
                                <Typography fontWeight="bold">मालमत्तेचा पत्ता:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography>
                                    {sr1Data?.propertyAddress}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={3}>
                        <Typography sx={{ textAlign: "justify", fontSize: "15px", lineHeight: 1.8 }}>
                            आपणास महाराष्ट्र महानगरपालिका अधिनियम, प्रकरण ८, नियम २० (२) / व १५ (२)
                            अन्वये नोटीस देण्यात येते की, आपली पिंपरी चिंचवड महानगरपालिका वाकड हद्दीतील
                            ताथवडे या ठिकाणी इमारत / जमीन असून सध्या अस्तित्वात असलेल्या कर निर्धारण
                            यादीत नवीन / वाढीव इमारतीची / जमिनीची कर निर्धारण यादी तयार केली असून
                            सदर मालमत्तेवर खालील नमूद कालावधीपासून कराची आकारणी करण्याकामी तुमचे
                            मालमत्तेचे करयोग्यमूल्य ठरविले आहे.
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            border: "1px solid black",
                            mt: 3,
                            width: "100%",
                            overflow: "hidden",
                        }}
                    >
                        <Table
                            sx={{
                                width: "100%",
                                tableLayout: "fixed",
                                borderCollapse: "collapse",
                                "& td, & th": {
                                    border: "1px solid black",
                                    textAlign: "center",
                                    padding: "4px",
                                    wordWrap: "break-word",
                                },
                            }}
                            size="small"
                        >
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#abd9e3", fontWeight: 600 }}>
                                    <TableCell>वापर प्रकार</TableCell>
                                    <TableCell>उप वापर प्रकार</TableCell>
                                    <TableCell align="center">बांधकाम प्रकार</TableCell>
                                    <TableCell align="center">आकारणी दिनांक</TableCell>
                                    <TableCell align="center">क्षेत्रफळ चौ मीटर</TableCell>
                                    <TableCell align="center">करयोग्य मूल्य</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sr1Data?.srGenarationVO?.map((item, index) => (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>{item.useName}</TableCell>
                                        <TableCell>{item.subUseName}</TableCell>
                                        <TableCell>{item.constructionName}</TableCell>
                                        <TableCell>{item.assessmentDate}</TableCell>
                                        <TableCell>{item.areaInSQMT}</TableCell>
                                        <TableCell>{item.rateableValue}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                    <Box mt={3}>
                        <Typography sx={{ textAlign: "justify", lineHeight: 1.9 }}>
                            सबब, या ठरविण्यात आलेल्या करयोग्य मूल्य रकमेबाबत अथवा कर आकारणी रजिस्टरमधील
                            इतर कोणत्याही नोंदींबाबत आपली काही हरकत अगर तक्रार असेल तर ती उक्त कायद्यातील
                            प्रकरण ८, नियम १६ ला अधीन राहून सबळ कारणांसह व पुराव्याच्या कागदपत्रांसह लेखी अर्ज
                            मा. सहायक आयुक्त (कर) / प्रशासन अधिकारी (कर) यांचे नावे महापालिकेचे विभागीय
                            कार्यालय/करसंकलन मुख्यालय या ठिकाणी दि. <b>{sr1Data?.objectionDate}</b> रोजी <b>3.00 PM</b> वा. पर्यंत
                            मिळेल अशा रीतीने पोहचवावी किंवा समक्ष दाखल करावी व पोहोच घ्यावी, दिनांक
                            <b> {sr1Data?.objectionDate}</b> रोजी <b>3.00 PM</b> नंतर आलेल्या किंवा योग्य कारणे न देता आलेल्या
                            हरकती किंवा तक्रार अर्जांचा विचार केला जाणार नाही. तसेच मुदतीत हरकत किंवा तक्रार
                            अर्ज न आल्यास करयोग्य मूल्य व इतर नोंदी आपणास मान्य आहेत असे समजून त्या कायम
                            केल्या जातील.
                        </Typography>

                        <Typography sx={{ textAlign: "justify", lineHeight: 1.9, mt: 2 }}>
                            मालमत्तेच्या करयोग्य मूल्याबाबत, मालकी हक्काबाबत किंवा मालमत्तेच्या वर्णनासह इतर
                            नोंदी बाबतचा तपशील येथील महानगरपालिकेच्या करसंकलन विभागीय कार्यालयात सुट्टीचे
                            दिवस सोडून कार्यालयीन वेळेत <b>11.00 AM</b> ते <b>3.00 PM</b> वाजेपर्यंत पाहावयास मिळेल.
                        </Typography>
                    </Box>

                    <Grid container spacing={2} mt={3} alignItems="flex-start">
                        <Grid item xs={7}>
                            <Typography sx={{ mb: 0.5 }}>
                                क्रमांक: {sr1Data?.documentName}/ <Box component="span" sx={{ fontWeight: "bold" }}>{sr1Data?.srNumber}</Box>
                            </Typography>
                            <Typography>
                                दिनांक : <Box component="span" sx={{ fontWeight: "bold" }}>{sr1Data?.srDate}</Box>
                            </Typography>
                        </Grid>


                        <Grid item xs={5}>
                            <Box sx={{ textAlign: "right" }}>
                                <Box
                                    component="img"
                                    src={signatureSrc || "/path/to/sign.png"}
                                    alt="signature"
                                    sx={{ height: 48, display: signatureSrc ? "inline-block" : "none" }}
                                />
                            </Box>

                            <Typography align="right" sx={{ mt: 0.5 }}>
                                (<Box component="span">{signatoryName || " "}</Box>)
                            </Typography>
                            <Typography align="right" sx={{ fontWeight: "bold", mt: 0.5 }}>
                                प्रशासन अधिकारी (करसंकलन)
                            </Typography>
                            <Typography align="right">{sr1Data?.zoneName} विभागीय कार्यालय</Typography>
                            <Typography align="right">पिंपरी चिंचवड महानगरपालिका</Typography>
                        </Grid>
                    </Grid>

                    <Box mt={2} mb={2} sx={{ borderBottom: "1px solid rgba(0,0,0,0.4)" }} />

                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={6}>
                            <Typography>
                                नोटीस स्वीकारणाऱ्याचे नाव : <b>{sr1Data?.ownerName}</b>
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: "right" }}>
                            <Typography>नोटीस बजावणाऱ्याचे नाव : __________________</Typography>
                            <Typography sx={{ mt: 1 }}>
                                दिनांक : <b>{sr1Data?.srDate}</b>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </DashBoardContainer>
    );
};

export default AssessmentDocument;
