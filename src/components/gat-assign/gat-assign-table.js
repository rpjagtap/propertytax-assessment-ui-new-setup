/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Loader from "../loader/loader";
import { Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextareaAutosize } from "@mui/material";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { RenderTableHead } from "../common/table";
import './style.css'; // Import the custom CSS
import { ArrowBack } from "@mui/icons-material";

const GatAssignTable = ({ data, handleBackClick }) => {
    // const initialState = {};
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [pendingAppsData, setPendingAppsData] = useState({
        ...data,
        assessmentFormVOLst: data.assessmentFormVOLst.slice(0, 4)
    });

    const lang = useSelector((state) => state.userDetails.lang);
    const { loading, setLoading, error, setError, success, setSuccess } =
        useApiState();

    return (
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
            <Grid sx={{ margin: 2 }}>
                <Button variant="contained"
                    color="primary"
                    onClick={handleBackClick}
                    startIcon={<ArrowBack />}>Back</Button>
            </Grid>
            {/* <Paper sx={{ marginTop: "15px" }}> */}
            <Grid>
                <TableContainer component={Paper}>
                    <Table
                        sx={{ minWidth: 600, border: 1, borderColor: "grey.300" }}
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
                                labels.MalakName[lang],
                                labels.MalakAddress[lang],
                                labels.MobileNo[lang],
                                '',
                                '',
                            ]}
                        />
                        <TableBody>
                            {pendingAppsData.assessmentFormVOLst.map((item, index) => {
                                return (
                                    <TableRow
                                        key={item.assessmentId}
                                        sx={{
                                            "& td": { border: "1px solid grey" },
                                            padding: 0,
                                            margin: 0,
                                        }}
                                    >
                                        {" "}
                                        <TableCell align="center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.ownerName}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.propertyAddressMarathi}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.mobileNo}
                                        </TableCell>
                                        <TableCell>
                                            <Table size="small" aria-label="inner-table" sx={{ margin: "4px" }}>
                                                <RenderTableHead
                                                    thSx={{ bgcolor: "#cbd5d7", fontWeight: 600 }}
                                                    trSx={{
                                                        "& th": {
                                                            border: "1px solid black",
                                                            padding: 0,
                                                            margin: 0,
                                                        },
                                                    }}
                                                    cells={[
                                                        labels.useType[lang],
                                                        labels.secUseType[lang],
                                                        labels.constructionType[lang],
                                                        labels.aakarniDate[lang],
                                                        labels.areaInMeter[lang],
                                                        labels.taxAmount[lang],
                                                    ]} />
                                                <TableBody>
                                                    {item.assessmentFormDetailsVOLst.map((innerItem, innerIndex) => {
                                                        return (
                                                            <TableRow key={item.assessmentDetailId}>
                                                                <TableCell>
                                                                    {innerItem.usetype}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {innerItem.subusetype}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {innerItem.constructionType}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {innerItem.assessmentDate}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {innerItem.areaInSqmt}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {innerItem.ratableValue}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}

                                                </TableBody>
                                            </Table>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            {/* </Paper> */}
        </Grid>
    );
};

export default GatAssignTable;