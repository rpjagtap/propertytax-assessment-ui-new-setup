import React, { useEffect, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Checkbox } from "@mui/material";
import { sendToZoDashboard } from "../../services/assessment-services";
import { get_redzone_data_for_zo } from "../../services/assessment-services"; // make sure this API exists
import { useNavigate } from "react-router-dom";
import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Button,
} from "@mui/material";

import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import FormTitle from "../form-fields/form-title";

// 👉 Replace with your list API
import { getPropertyListForZO } from "../../services/assessment-services";

const PropertyTypeZO = () => {
    const { loading, setLoading, error, setError } = useApiState();

    const [data, setData] = useState([]);
    const [selected, setSelected] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();

    // ✅ Load list on screen open
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await get_redzone_data_for_zo(); // 🔴 replace API
            const list = res?.data || res || [];

            setData(list);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch list");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Row checkbox
    const handleCheckbox = (key) => {
        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelectAll = () => {
        let updated = {};

        if (!selectAll) {
            data.forEach((item) => {
                updated[item.propertyKey] = true;
            });
        }

        setSelected(updated);
        setSelectAll(!selectAll);
    };
   

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");
        
            const selectedRows = data.filter(
                (item) => selected[item.propertyKey]
            );

            if (selectedRows.length === 0) {
                setError("Please select at least one record");
                return;
            }

    
            for (let row of selectedRows) {
                await sendToZoDashboard(row.propertyKey, true);
            }

            alert("Submitted successfully");

   
            setSelected({});
            setSelectAll(false);

            // ✅ Redirect to first stage
            // navigate("/property-type-zo"); // change if needed

            // OR if you want full refresh:
            window.location.reload();

        } catch (err) {
            console.error("FULL ERROR:", err);

            if (err.response) {
                setError(err.response.data?.message || "Server error");
            } else {
                setError("Network / API not reachable");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashBoardContainer>
            {error && (
                <AlertMsg
                    message={error}
                    severity="error"
                    onClose={() => setError("")}
                />
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={4} sx={{ p: 3 }}>
                    <FormTitle title="Property Type ZO" />

                    {/* ✅ TABLE (same UI) */}
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#e6eaeb" }}>
                                    <TableCell align="center">Sr No</TableCell>
                                    <TableCell align="center">Property Code</TableCell>
                                    <TableCell align="center">Property Name</TableCell>
                                    <TableCell align="center">Address</TableCell>
                                    {/* <TableCell align="center">Mobile</TableCell> */}

                                    {/* ✅ Select All in header */}
                                    <TableCell align="center">
                                        Red Zone
                                        <br />
                                        <Checkbox
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={item.propertyKey}>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">
                                            {item.propertyCode || "-"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.propertyName || "-"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.propertyAddress || "-"}
                                        </TableCell>
                                        {/* <TableCell align="center">
                      {item.mobileNo || "-"}
                    </TableCell> */}

                                        {/* ✅ Row checkbox */}
                                        <TableCell align="center">
                                            <Checkbox
                                                checked={selected[item.propertyKey] || false}
                                                onChange={() =>
                                                    handleCheckbox(item.propertyKey)
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* ✅ Submit button row */}
                                <TableRow>
                                    <TableCell align="center" colSpan={6}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="success"
                                            onClick={handleSubmit}
                                        >
                                            SUBMIT
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </DashBoardContainer>
    );
};

export default React.memo(PropertyTypeZO);