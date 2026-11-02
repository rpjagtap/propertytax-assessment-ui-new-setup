import React, { useEffect, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { useSelector } from "react-redux";
import {
    Checkbox,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";

import {
    sendToZoDashboard,
    getredzonedataforzo,
    getZoneByProfile,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";

// zone list items look like { value: <zonekey>, label: <zone name> }
const getZoneKey = (z) => z?.value ?? z?.zonekey ?? z?.zoneKey ?? z?.id;
const getZoneName = (z) =>
    z?.label ?? z?.zonename ?? z?.zoneName ?? z?.name ?? `Zone ${getZoneKey(z)}`;

// turn any API response into an array
const toArray = (res) => {
    const raw = res?.data ?? res?.result ?? res;
    if (Array.isArray(raw)) return raw;
    return raw ? [raw] : [];
};

const PropertyTypeZO = () => {
    const { loading, setLoading, error, setError } = useApiState();
    const lang = useSelector((state) => state.userDetails.lang);

    const [zones, setZones] = useState([]);
    const [zonekey, setZonekey] = useState("");
    const [data, setData] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selected, setSelected] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    // On screen open: load zones
    useEffect(() => {
        loadZones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadZones = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await getZoneByProfile(); // no arguments, same as the dashboard
            console.log("ZONE RESPONSE:", res);

            const list = (res?.zoneLst || []).filter(
                (z) => getZoneKey(z) !== undefined
            );
            setZones(list);

            if (list.length === 0) {
                setError("No zone found for this user");
            } else if (list.length === 1) {
                setZonekey(getZoneKey(list[0])); // preselect single zone
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load zones");
        } finally {
            setLoading(false);
        }
    };

    // Show button
    const handleShow = () => {
        if (zonekey === "" || zonekey === undefined || zonekey === null) {
            setError("Please select zone");
            return;
        }
        fetchData(zonekey);
    };

    // get report data: body { zonekey: <selected zone> }
    const fetchData = async (key, showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError("");

            const res = await getredzonedataforzo(key);
            console.log("Fetched data:", res);

            setData(toArray(res));
            setSearched(true);
            setSelected({});
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to fetch list");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // Row checkbox
    const handleCheckbox = (key) => {
        const updated = { ...selected, [key]: !selected[key] };
        setSelected(updated);
        setSelectAll(
            data.length > 0 && data.every((item) => updated[item.propertyKey])
        );
    };

    // Select all
    const handleSelectAll = () => {
        const updated = {};
        if (!selectAll) {
            data.forEach((item) => {
                updated[item.propertyKey] = true;
            });
        }
        setSelected(updated);
        setSelectAll(!selectAll);
    };

    // Submit
    const handleSubmit = async () => {
        const selectedRows = data.filter((item) => selected[item.propertyKey]);

        if (selectedRows.length === 0) {
            setError("Please select at least one record");
            return;
        }

        try {
            setLoading(true);
            setError("");

            for (const row of selectedRows) {
                await sendToZoDashboard(row.propertyKey, true);
            }

            alert("Submitted successfully");

            // reload the same zone's list (no full page refresh)
            await fetchData(zonekey, false);
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

            <Paper elevation={4} sx={{ p: 3 }}>
                <FormTitle
                    title={labels?.PropertyType?.[lang] || "Red Zone Property"}
                />

                {/* zone dropdown + Show button */}
                <Box display="flex" gap={2} alignItems="center" mt={3}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                        <InputLabel id="zone-label">
                            {labels?.Zone?.[lang] || "Zone"}
                        </InputLabel>
                        <Select
                            labelId="zone-label"
                            label={labels?.Zone?.[lang] || "Zone"}
                            value={zonekey}
                            onChange={(e) => {
                                setZonekey(e.target.value);
                                setSearched(false);
                                setData([]);
                                setSelected({});
                                setSelectAll(false);
                            }}
                        >
                            {zones.map((z) => (
                                <MenuItem key={getZoneKey(z)} value={getZoneKey(z)}>
                                    {getZoneName(z)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleShow}
                        disabled={loading}
                    >
                        {labels?.Show?.[lang] || "Show"}
                    </Button>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    searched && (
                        <TableContainer component={Paper} sx={{ mt: 4 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#e6eaeb" }}>
                                        <TableCell align="center">
                                            {labels?.SrNo?.[lang] || "Sr No"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {labels?.PropertyCode?.[lang] || "Property Code"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {labels?.PropertyName?.[lang] || "Property Name"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {labels?.Address?.[lang] || "Address"}
                                        </TableCell>
                                        <TableCell align="center">
                                            Red Zone
                                            <br />
                                            <Checkbox
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                disabled={data.length === 0}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell align="center" colSpan={5}>
                                                No records found
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {data.map((item, index) => (
                                        <TableRow key={item.propertyKey ?? index}>
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
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={selected[item.propertyKey] || false}
                                                    onChange={() => handleCheckbox(item.propertyKey)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {data.length > 0 && (
                                        <TableRow>
                                            <TableCell align="center" colSpan={5}>
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
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </Paper>
        </DashBoardContainer>
    );
};

export default React.memo(PropertyTypeZO);