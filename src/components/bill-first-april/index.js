import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';
import './first-april.css';
import { GlobalStyles } from '@mui/material';

<GlobalStyles
  styles={{
    '@media print': {
      thead: {
        display: 'table-row-group !important',
      },
    },
  }}
/>

const NoMinWidthTableCell = styled(TableCell)({
  minWidth: 'unset !important',
  borderBottom: 'none',
  border: 'none',
});

const PcmcTaxBill = () => {
  const { propertyId } = useParams();
  const [consumerDetails, setConsumerDetails] = useState(null);
  const [billDetails, setBillDetails] = useState([]);

  useEffect(() => {
    if (propertyId) {
      axios.post('http://103.224.247.159:8080/propertytax-web-api-dev/bill-generation/download-april-bill-pdf', {
        propertyCode: propertyId
      })
        .then(res => {
          setConsumerDetails(res.data);
          setBillDetails(res.data.lstBillPdfDetail);
        })
        .catch(err => {
          console.error('API error:', err);
        });
    }
  }, [propertyId]);

  const printPage = () => window.print();

  if (!consumerDetails) return <Typography>Loading...</Typography>;

  const blueText = { color: '#0074cc', fontWeight: 'bold' };
  const redText = { color: '#ff0000ff', fontWeight: 'bold' };
  const backGround = { backgroundColor: '#f0f0f0be' };

  return (
    <div id="print-scale-wrapper">
      <Container maxWidth="md" sx={{ p: 2, backgroundColor: '#fff', border: '1px solid #000' }}>
        <Button
          variant="contained"
          color="error"
          onClick={printPage}
          sx={{ float: 'right', mb: 2, '@media print': { display: 'none' } }}
          startIcon={<PrintIcon />}
        >
          प्रिंट करा
        </Button>

        <Box className="header" sx={{ textAlign: 'center', mb: 2 }}>
          <Box component="img" src="/pcmclogo.jpeg" alt="PCMC Logo" sx={{ float: 'left', height: '100px' }} />
          <Typography variant="h6" color="error" sx={{ pl: '188px' }}>मालमत्ता कराचे बिल - सन 2025-2026</Typography>
          <Typography variant="h5" color="error">पिंपरी चिंचवड महानगरपालिका, पिंपरी - 411 018.</Typography>
          <Typography sx={{ pl: '130px', blueText }}>
            (महाराष्ट्र महानगरपालिका अधिनियम अनुसार 'ड' प्रकरण ८ नियम ३१ प्रमाणे)
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small" className="info-table no-border">
            <TableBody>
              <TableRow>
                <NoMinWidthTableCell sx={blueText}>झोन :</NoMinWidthTableCell><NoMinWidthTableCell>{consumerDetails.zone}</NoMinWidthTableCell>
                <NoMinWidthTableCell sx={blueText}>गट क्रमांक :</NoMinWidthTableCell><NoMinWidthTableCell>{consumerDetails.ward}</NoMinWidthTableCell>
                <NoMinWidthTableCell sx={blueText}>मालमत्ता क्रमांक :</NoMinWidthTableCell><NoMinWidthTableCell>{consumerDetails.propertyCode}</NoMinWidthTableCell>
                <NoMinWidthTableCell sx={blueText}>बिल क्रमांक :</NoMinWidthTableCell><NoMinWidthTableCell>{consumerDetails.billNumber}</NoMinWidthTableCell>
                <NoMinWidthTableCell sx={blueText}>दिनांक :</NoMinWidthTableCell><NoMinWidthTableCell>{consumerDetails.billDate}</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={blueText}>मालकाचे नाव :</NoMinWidthTableCell><NoMinWidthTableCell colSpan={8}>{consumerDetails.owner}</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={blueText}>भोगवटादाराचे नाव :</NoMinWidthTableCell>
                <NoMinWidthTableCell colSpan={8}>{consumerDetails.occupantName || consumerDetails.owner}</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={blueText}>मालमत्तेचा पत्ता :</NoMinWidthTableCell><NoMinWidthTableCell colSpan={8}>{consumerDetails.address}</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={blueText}>मालमत्ता वर्णन :</NoMinWidthTableCell><NoMinWidthTableCell colSpan={8}>{consumerDetails.description}</NoMinWidthTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small" className="bordered-table">
            <TableHead>
              <TableRow>
                <NoMinWidthTableCell rowSpan={2} sx={{ ...backGround, width: 140 }}>&nbsp;</NoMinWidthTableCell>
                <NoMinWidthTableCell rowSpan={2} sx={{ ...redText, ...backGround }} align="center">निवासी</NoMinWidthTableCell>
                <NoMinWidthTableCell colSpan={2} sx={{ ...redText, ...backGround }} align="center">बिगरनिवासी</NoMinWidthTableCell>
                <NoMinWidthTableCell rowSpan={2} sx={{ ...redText, ...backGround }} align="center">मोकळी जमीन</NoMinWidthTableCell>
                <NoMinWidthTableCell rowSpan={2} sx={{ ...redText, ...backGround }} align="center" style={{ width: 153 }}>एकूण</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, textAlign: 'center' }}>व्यावसायिक</NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, textAlign: 'center' }}>औद्योगिक</NoMinWidthTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <NoMinWidthTableCell sx={redText}>क्षेत्रफळ (चौ. मीटर)</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.areaResi}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.areaNonResi}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.areaIndustrial}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.areaMokadiZameen}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.areaTotal}</NoMinWidthTableCell>
              </TableRow>
              <TableRow>
                <NoMinWidthTableCell sx={redText}>करयोग्य मूल्य</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.rvResi}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.rvNonResi}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.rvIndustrial}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.rvMokadiZameen}</NoMinWidthTableCell>
                <NoMinWidthTableCell align="center">{consumerDetails.rvTotal}</NoMinWidthTableCell>
              </TableRow>

              <TableRow>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>कराचे नाव</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>दर %</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>मागील थकबाकी</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>पहिली सहामाही</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>दुसरी सहामाही</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell sx={{ ...redText, ...backGround, }} align="center"><strong>एकूण रक्कम</strong></NoMinWidthTableCell>
              </TableRow>

              {billDetails.map((row, idx) => (
                <TableRow key={idx}>
                  <NoMinWidthTableCell sx={redText}>{row.taxName}</NoMinWidthTableCell>
                  <NoMinWidthTableCell sx={{ textAlign: 'center' }} align="center">{row.taxRate}</NoMinWidthTableCell>
                  <NoMinWidthTableCell sx={{ textAlign: 'center' }} align="center">{row.maagilDemand}</NoMinWidthTableCell>
                  <NoMinWidthTableCell sx={{ textAlign: 'center' }} align="center">{row.chaaluDemand1}</NoMinWidthTableCell>
                  <NoMinWidthTableCell sx={{ textAlign: 'center' }} align="center">{row.chaaluDemand2}</NoMinWidthTableCell>
                  <NoMinWidthTableCell sx={{ textAlign: 'center' }} align="center">{row.totalDemand}</NoMinWidthTableCell>
                </TableRow>
              ))}
              <TableRow>
                <NoMinWidthTableCell sx={redText}><strong>एकूण</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell align="center"><strong>0</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell align="center"><strong>{consumerDetails.totalMaagil}</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell align="center"><strong>{consumerDetails.totalChaaluFirstSem}</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell align="center"><strong>{consumerDetails.totalChaaluSecondSem}</strong></NoMinWidthTableCell>
                <NoMinWidthTableCell align="center"><strong>{consumerDetails.totalDemand}</strong></NoMinWidthTableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5}>
                  <Typography component="span" sx={redText}> सर्वसाधारण सूचना :</Typography>
                  <ol style={{ marginLeft: '20px' }}>
                    <li>सर्व करांच्या रकम तारीख 1 एप्रिल व 1 ऑक्टोबर रोजी सुरु होणाऱ्या सहामाही हप्त्याने आगाऊ देय आहेत.</li>
                    <li>बिल भरण्याची मुदत – पहिली सहामाही बिल मिळाल्यापासून <b>03 महिन्यांचे आत</b> अथवा <b>30 सप्टेंबर</b> तसेच दुसरी सहामाही <b>31 डिसेंबर</b> पर्यंत.</li>
                    <li>धनादेश / डिमांड ड्राफ्ट <b>आयुक्त, पिंपरी चिंचवड महानगरपालिका, पिंपरी - 411018</b> अथवा <b>COMMISSIONER, P.C.M.C., PIMPRI - 411018</b> या नावाने काढावा.</li>
                    <li>www.pcmcindia.gov.in या संकेतस्थळावर मालमत्ता कराचा भरणा, मालमत्ता हस्तांतरण, सामान्य करातील सवलत योजना यासाठी ऑनलाइन सुविधा उपलब्ध आहे.</li>
                    <li>विहित मुदतीत बिलात मागणी केलेली रक्कम भरली नाही तर कराच्या नियम <b>41</b> नुसार दंड <b>2% शास्ती (विलंब दंड)</b> लागू होईल.</li>
                    <li>नवीन किंवा मूळ मालमत्तेसंबंधी वाढीव बांधकाम केलेल्यास तसेच जुन्या इमारत पाडलेस <b>15 दिवसांच्या आत</b> म.न.पा.स लेखी कळविणे नियमाप्रमाणे बंधनकारक आहे.</li>
                    <li>कर देणेस पात्र पात्र असलेल्या व्यक्तीच्या मालमत्तेसंबंधी मालकी हक्काचा हस्तांतरण करणे नेहमी हस्तांतरण करणाऱ्याने 03 महिन्यांचे आत तसेच कर देणेस पात्र असलेली व्यक्ती मरण पावल्यास मृत व्यक्तीची मालकी हक्काचा, वारस म्हणून किंवा अन्यथा वर्षाचे आत जरी हस्तांतरणासंबंधी लेखी कळविले नाहीतर बंधनकारक आहे.</li>
                    <li>अकारणी पुस्तकातल्या मालमत्तेसंबंधी नोंदविल्याचे मालक / उपयोगकर्त्याद्वारे नोंद, मालमत्ता मूल्य, करयोग्य मूल्य किंवा कराव्याबत तक्रार असल्यास महाराष्ट्र महानगरपालिका अधिनियमातील अनुसूची ८ नियम १६ नुसार दरवर्षी डिसेंबर महिन्यापर्यंत हस्तांकीत मागणी जातात तेव्हा मालमत्ताधारकाने लेखी अर्ज करावा.</li>
                  </ol>
                </TableCell>
                <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                  <div style={{ marginTop: '50px' }}>
                    <Box component="img" src="/ptax-comm-sign.png" alt="PTAX Comm Sign" />
                    <br />
                    <Typography sx={{ ...redText, mt: 1 }} component="div">(अविनाश शिंदे)</Typography>
                    <Typography component="div">सहाय्यक आयुक्त</Typography>
                    <Typography component="div">कर आकारणी व संकलन विभाग</Typography>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
};

export default PcmcTaxBill;