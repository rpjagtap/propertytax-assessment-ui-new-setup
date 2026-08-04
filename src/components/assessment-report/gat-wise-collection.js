import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Button
} from "@mui/material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import Loader from "../loader/loader";
import { ArrowBack } from "@mui/icons-material";
import { RenderTableHead } from "../common/table";

const ShowGatWiseCollection = ({ data, handleBackClick }) => {
    //console.log(data);

    const formatDateDMY = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const { loading, setLoading, error, setError } = useApiState();
    const lang = useSelector((state) => state.userDetails.lang);
    const [formattedDate, SetformattedDate] = useState(formatDateDMY(new Date()));
    const [formattedTime, setFormattedTime] = useState(
        new Date().toLocaleTimeString()
    );
    const [tableLoading, setTableLoading] = useState(false);

    return (
        <>
            <Grid>
                {loading && <Loader />}
                {error && (
                    <AlertMsg
                        message={error}
                        severity="error"
                        onClose={() => {
                            setError("");
                        }}
                    />
                )}
                <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                    <FormTitle
                         title={`${data.lstAssessmentReportVO[0].zoneName} - ${labels.ZoneWiseBuildingPermission[lang]} : ${formattedDate}  ${formattedTime} `}
                    />
                </Paper>
                <Grid sx={{ margin: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleBackClick} startIcon={<ArrowBack />}>
                        Back
                    </Button>
                </Grid>

                <Grid>
                    <TableContainer component={Paper}>
                        <Table
                            sx={{
                                minWidth: 650,
                                border: 1,
                                borderColor: "grey.300",
                            }}
                            size="small"
                            aria-label="a dense table"
                        >
                            <RenderTableHead
                                thSx={{
                                    bgcolor: "#abd9e3",
                                    fontWeight: 600,
                                }}
                                trSx={{
                                    "& th": {
                                        border: "1px solid grey",
                                        padding: 0,
                                        margin: 0,
                                    },
                                }}
                                cells={[
                                    labels.SrNo[lang],
                                    labels.Gat[lang],
                                    labels.Total[lang],
                                    labels.sr2generated[lang],
                                    labels.sr3generated[lang],
                                    labels.CitizenConsent[lang],
                                    labels.PrashasanAdhikariHearing[lang],
                                    labels.PrashasanAdhikariHOHearing[lang],
                                    labels.AssistantCommissionerHearing[lang],
                                    labels.HODHearing[lang],
                                    labels.AdditionalCommissionerHearing[lang],
                                    labels.GatpramukhSR3[lang],
                                    labels.ZonalOfficerSR3[lang],
                                    labels.PrashasanAdhikariSR3[lang],
                                    labels.PrashasanAdhikariHOSR3[lang],
                                    labels.AssistantCommissionerSR3[lang],
                                    labels.HODSR3[lang],
                                    labels.AdditionalCommissionerSR3[lang],
                                    
                                ]}
                            />
                            {tableLoading ? (
                                <>Please wait loading data...</>
                            ) : (
                                <TableBody>
                                    {data.lstAssessmentReportVO ? (
                                        <>
                                            {data.lstAssessmentReportVO.map((item, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{
                                                        "& td": {
                                                            border: "1px solid grey",
                                                        },
                                                        padding: 0,
                                                        margin: 0,
                                                    }}
                                                >
                                                    <TableCell align="center">{index + 1}</TableCell>
                                                    <TableCell align="center">{item.gatName}</TableCell>
                                                    <TableCell align="center">{item.totalApplications}</TableCell>
                                                    <TableCell align="center">{item.sr2_generated}</TableCell>
                                                    <TableCell align="center">{item.sr3_generated}</TableCell>
                                                    <TableCell align="center">{item.citizenConsent}</TableCell>
                                                    <TableCell align="center">{item.prashasanAdhikariHearing}</TableCell>
                                                    <TableCell align="center">{item.prashasanAdhikariHOHearing}</TableCell>
                                                    <TableCell align="center">{item.assistantCommissionerHearing}</TableCell>
                                                    <TableCell align="center">{item.hodHearing}</TableCell>
                                                    <TableCell align="center">{item.additionalCommissionerHearing}</TableCell>
                                                    <TableCell align="center">{item.gatpramukhSR3}</TableCell>
                                                    <TableCell align="center">{item.zonalOfficerSR3}</TableCell>
                                                    <TableCell align="center">{item.prashasanAdhikariSR3}</TableCell>
                                                    <TableCell align="center">{item.prashasanAdhikariHOSR3}</TableCell>
                                                    <TableCell align="center">{item.assistantCommissionerSR3}</TableCell>
                                                    <TableCell align="center">{item.hodSR3}</TableCell>
                                                    <TableCell align="center">{item.additionalCommissionerSR3}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{
                                                "& td": { border: "1px solid grey" },
                                                padding: 0,
                                                margin: 0,
                                            }}>
                                                <TableCell align="center">{ }</TableCell>
                                                <TableCell align="center">
                                                    <b>Total</b>
                                                </TableCell>
                                                <TableCell align="center"><b>{data.totalApplicationsTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.sr2_generatedTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.sr3_generatedTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.citizenConsentTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.prashasanAdhikariHearingTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.prashasanAdhikariHOHearingTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.assistantCommissionerHearingTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.hodHearingTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.additionalCommissionerHearingTOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.gatpramukhSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.zonalOfficerSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.prashasanAdhikariSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.prashasanAdhikariHOSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.assistantCommissionerSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.hodSR3TOT}</b></TableCell>
                                                <TableCell align="center"><b>{data.additionalCommissionerSR3TOT}</b></TableCell>
                                            </TableRow>
                                        </>
                                    ) : (
                                        <>{labels.NoRecordFound[lang]}</>
                                    )}
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    )
};

export default ShowGatWiseCollection;