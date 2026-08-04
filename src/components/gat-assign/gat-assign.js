/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import Loader from "../loader/loader";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import { Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
// import { useSelector } from "react-redux";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { assessmentDashSchema } from "../../utils/validation-schema";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { RenderTableHead } from "../common/table";
import { getGatAssignData, updateGatAssignData, getApplications, getZoneByProfile } from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import GatAssignTable from "./gat-assign-table";

const GatAssign = () => {
    const initialState = {
        zoneKey: "",
    };
    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError, success, setSuccess } = useApiState();
    const [gatAssignData, setGatAssignData] = useState([]);
    const [selectedValues, setSelectedValues] = useState({});
    const [applicationsData, setapplicationsData] = useState("");
    const [isShowPendingGatAssignTable, setIsShowPendingGatAssignTable] = useState(false);
    const [zoneKeys, setZoneKeys] = useState([]);

    const formik = useFormik({
        initialValues: initialState,
        // onSubmit: (values) => {
        //     alert(JSON.stringify(values, null, 2));
        // },
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [getAllAssignData, zonesRes] = await Promise.all([
                    getGatAssignData(formik.values.zoneKey ? { zoneKey: formik.values.zoneKey } : {}),
                    getZoneByProfile(),
                ]);
                setGatAssignData(getAllAssignData);
                setZoneKeys(zonesRes.zoneLst);
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.zoneKey]);

    const handleDropdownChange = (index, value) => {
        setSelectedValues((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const handleApprove = async (item, index) => {
        try {
            setLoading(true);

            // Get the selected dropdown value for this row
            const selectedValue = selectedValues[index];

            if (!selectedValue) {
                showToastError("Please select gat.");
                return;
            }

            // Prepare the data to send to the API
            const requestData = {
                completionNo: item.completionNo, // Send completionNo
                gatKey: selectedValue, // Send selected GAT key
                revertFormVO: {
                    // Include revertAction in the revertFormVO object
                    revertAction: "Accept", // Hardcoded revertAction
                },
            };
            const filterData = gatAssignData.filter((row) => row.completionNo !== item.completionNo);
            // Call the API to approve the row
            const response = await updateGatAssignData(requestData);
            setGatAssignData(filterData);
            showToastSuccess("Approved successfully");
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCountClick = async (completionNo) => {
        const body = { completionNo };
        try {
            setLoading(true);
            const res = await getApplications(body);
            setapplicationsData(res);
            setIsShowPendingGatAssignTable(true);
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };
    const handleBackClick = () => {
        setIsShowPendingGatAssignTable(false);
        setapplicationsData("");
    };

    return (
        <DashBoardContainer>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress sx={{marginTop:"65px"}} />
                </div>
            ) : (
                <>
                    <ScrollBottom />
                    <ScrollTop />
                    {isShowPendingGatAssignTable ? (
                        <GatAssignTable data={applicationsData} handleBackClick={handleBackClick} />
                    ) : (
                        <Grid>
                            <FormikProvider value={formik}>
                                <Form>
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
                                        <FormTitle title="Gat Assign Dashboard" />
                                        <GridRow>
                                            <FormLabel label="Zone" required />
                                            <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} required />} />
                                        </GridRow>
                                    </Paper>

                                    {gatAssignData && (
                                        <Paper>
                                            <Grid>
                                                <TableContainer component={Paper}>
                                                    <Table
                                                        sx={{ minWidth: 650, border: 1, borderColor: "grey.300" }}
                                                        size="small"
                                                        aria-label="a dense table"
                                                    >
                                                        <RenderTableHead
                                                            thSx={{ bgcolor: "#abd9e3", fontWeight: 600 }}
                                                            trSx={{
                                                                "& th": {
                                                                    border: "1px solid grey",
                                                                    padding: 0,
                                                                    margin: 0,
                                                                },
                                                            }}
                                                            cells={[
                                                                labels.SrNo[lang],
                                                                labels.VillageName[lang],
                                                                labels.BuildingName[lang],
                                                                labels.CompletionNumber[lang],
                                                                labels.CompletionDate[lang],
                                                                labels.FlatsCounts[lang],
                                                                labels.SelectGat[lang],
                                                                labels.Action[lang],
                                                            ]}
                                                        />
                                                        <TableBody>
                                                            {gatAssignData && gatAssignData.length ? (
                                                                <>
                                                                    {gatAssignData.map((item, index) => (
                                                                        <TableRow
                                                                            key={item.completionNo}
                                                                            sx={{
                                                                                "& td": { border: "1px solid grey" },
                                                                                padding: 0,
                                                                                margin: 0,
                                                                            }}
                                                                        >
                                                                            {" "}
                                                                            <TableCell align="center">{index + 1}</TableCell>
                                                                            <TableCell align="center">{item.zoneName}</TableCell>
                                                                            <TableCell align="center">
                                                                                {item.propertyAddress}
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                {item.completionNo}
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                {item.completionDate}
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                <Link
                                                                                    onClick={() =>
                                                                                        handleCountClick(item.completionNo)
                                                                                    }
                                                                                    component="button"
                                                                                >
                                                                                    {item.applicationCount}
                                                                                </Link>
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                <FormValue
                                                                                    component={
                                                                                        <SelectInput
                                                                                            name={`zone-${index}`}
                                                                                            options={(item.gatLst || []).map(
                                                                                                (zone) => ({
                                                                                                    label: zone.label,
                                                                                                    value: zone.value,
                                                                                                })
                                                                                            )}
                                                                                            onChange={(e) =>
                                                                                                handleDropdownChange(
                                                                                                    index,
                                                                                                    e.target.value
                                                                                                )
                                                                                            }
                                                                                            required
                                                                                            style={{ width: "150px" }}
                                                                                        />
                                                                                    }
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={() => handleApprove(item, index)}
                                                                                >
                                                                                    Approve
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell align="center" className="cellBorder" colSpan={8}>
                                                                        {labels.NoRecordFound[lang]}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Grid>
                                        </Paper>
                                    )}
                                </Form>
                            </FormikProvider>
                        </Grid>
                    )}
                </>
            )}
        </DashBoardContainer>
    );
};

export default GatAssign;
