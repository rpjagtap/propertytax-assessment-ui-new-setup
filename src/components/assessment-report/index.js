import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import {
    CircularProgress,
    Grid,
    Link,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { propertyTransactionDashboardSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { RenderTableHead } from "../common/table";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError } from "../common/toastHelper";
import {
    getGatWiseCollectionDetails,
    getZoneWiseCollectionDetails,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";
import { useNavigate } from "react-router-dom";
import ShowGatWiseCollection from "./gat-wise-collection";

const BuildingPermissionReport = () => {
    const initialState = {
        fromDate: getCurrentDate(),
        toDate: getCurrentDate(),
        transactionTypeKey: "",
        zoneKey: "",
        gatKey: "",
    };

    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError } = useApiState();
    const [pendingAppCountData, setPendingAppCountData] = useState([]);
    const [pendingAppsData, setPendingAppsData] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [allTrsactions, setAllTrsactions] = useState([]);
    const [zoneCollectionDetails, setZoneCollectionDetails] = useState("");
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(30);
    const formatDateDMY = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const [formattedDate, setFormattedDate] = useState(formatDateDMY(new Date()));
    const [formattedTime, setFormattedTime] = useState(
        new Date().toLocaleTimeString()
    );
    const [isShowGatWiseCollection, setIsShowGatWiseCollection] = useState(false);
    const [gatWiseCollectionDetails, setGatWiseCollectionDetails] = useState("");
    // Countdown state
    const formik = useFormik({
        initialValues: initialState,
        validationSchema: propertyTransactionDashboardSchema,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    useEffect(() => {
        setPendingAppsData("");
        setPendingAppCountData("");
    }, [formik.values.formStatus]);

    const fetchData = async () => {
        const loadData = async () => {
            try {
                setLoading(true);
                const zoneCollectionDetails = await getZoneWiseCollectionDetails();
                setZoneCollectionDetails(zoneCollectionDetails);
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        loadData();
     };

      useEffect(() => {
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 30000); // Fetch data every 30 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      useEffect(() => {
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => (prev > 0 ? prev - 1 : 30)); // Decrement countdown or reset
        }, 1000);
    
        return () => clearInterval(countdownInterval); // Cleanup on component unmount
      }, []);

    const handleCountClick = async (zoneName) => {
        const body = { zoneName: zoneName };
        try {
            setLoading(true);
            const res = await getGatWiseCollectionDetails(body);
            setGatWiseCollectionDetails(res);
            setIsShowGatWiseCollection(true);
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };
    const handleBackClick = () => {
        setIsShowGatWiseCollection(false);
        setGatWiseCollectionDetails("");
    }

    return (
        <DashBoardContainer>
            {error && (
                <AlertMsg
                    message={error}
                    severity="error"
                    onClose={() => {
                        setError("");
                    }}
                />
            )}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress sx={{ marginTop: "65px" }} />
                </div>
            ) : (
                <>
                    <ScrollBottom />
                    <ScrollTop />
                    {isShowGatWiseCollection ? (
                        <ShowGatWiseCollection
                            data={gatWiseCollectionDetails}
                            handleBackClick={handleBackClick}
                        />
                    ) : (
                        <Grid>
                            <FormikProvider value={formik}>
                                <Form>
                                    <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                                        <FormTitle
                                            title={`${labels.ZoneWiseBuildingPermission[lang]} : ${formattedDate}  ${formattedTime} (Update in ${countdown} seconds)`}
                                        />
                                    </Paper>
                                </Form>
                            </FormikProvider>

                            <Paper>
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
                                                    labels.Zone[lang],
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
                                                    {zoneCollectionDetails.lstAssessmentReportVO ? (
                                                        <>
                                                            {zoneCollectionDetails.lstAssessmentReportVO.map((item, index) => (
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
                                                                    <TableCell align="center">
                                                                        <Link onClick={() => handleCountClick(item.zoneName)} component="button">
                                                                            {item.zoneName}
                                                                        </Link>
                                                                    </TableCell>

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
                                                                <TableCell align="center"><b>{zoneCollectionDetails.totalApplicationsTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.sr2_generatedTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.sr3_generatedTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.citizenConsentTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.prashasanAdhikariHearingTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.prashasanAdhikariHOHearingTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.assistantCommissionerHearingTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.hodHearingTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.additionalCommissionerHearingTOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.gatpramukhSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.zonalOfficerSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.prashasanAdhikariSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.prashasanAdhikariHOSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.assistantCommissionerSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.hodSR3TOT}</b></TableCell>
                                                                <TableCell align="center"><b>{zoneCollectionDetails.additionalCommissionerSR3TOT}</b></TableCell>
                                                                

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
                            </Paper>

                        </Grid>
                    )}

                </>
            )}
        </DashBoardContainer >
    );
};

export default React.memo(BuildingPermissionReport);
