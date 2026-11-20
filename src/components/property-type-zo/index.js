import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Button,
  Typography,
  Box,
} from "@mui/material";
import Loader from "../../components/loader/loader";
import { getUserDetails } from "../../utils/sessionUtils";
import {
  getRedZoneDataForZO,
  approvedPropertyType,
} from "../../services/assessment-services";

// Handles: plain array, single object, or list wrapped in a key
const normalizeList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.propertyKey !== undefined) return [res];
  const firstArray = Object.values(res).find((v) => Array.isArray(v));
  return firstArray || [];
};

const PropertyTypeZO = () => {
  const sessionData = getUserDetails();
  console.log("sessionData:", sessionData);

  // Try common field names; adjust once you see the console output
  const zoneKey =
    sessionData?.zoneKey ??
    sessionData?.zoneId ??
    sessionData?.zone ??
    sessionData?.zoneCode;

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]); // propertyKey values
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    console.log("loadData called with zoneKey:", zoneKey);
    try {
      setLoading(true);
      setError(null);
      const res = await getRedZoneDataForZO(zoneKey);
      console.log("RAW RESPONSE:", res);
      const list = normalizeList(res);
      console.log("ROWS:", list);
      setRows(list);
      setSelected([]);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zoneKey) {
      loadData();
    } else {
      console.warn("zoneKey not found in session");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneKey]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && !allSelected;

  const handleSelectAll = (e) =>
    setSelected(e.target.checked ? rows.map((r) => r.propertyKey) : []);

  const handleSelectOne = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleApprove = async () => {
    if (selected.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selected.map((key) => approvedPropertyType(key, true)));
      await loadData(); // refresh list after approval
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error: {error.message}</Typography>
        <Button sx={{ mt: 1 }} variant="outlined" onClick={loadData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {loading && <Loader />}

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Red Zone Properties</Typography>
        <Button
          variant="contained"
          onClick={loadData}
          disabled={!zoneKey || loading}
        >
          Show
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Property Code</TableCell>
            <TableCell>Property Name</TableCell>
            <TableCell>Property Address</TableCell>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
                disabled={rows.length === 0}
              />
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography>No records found</Typography>
              </TableCell>
            </TableRow>
          )}

          {rows.map((r, i) => (
            <TableRow
              key={r.propertyKey ?? i}
              hover
              selected={selected.includes(r.propertyKey)}
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell>{r.propertyCode}</TableCell>
              <TableCell>{r.propertyName}</TableCell>
              <TableCell>{r.propertyAddress}</TableCell>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.includes(r.propertyKey)}
                  onChange={() => handleSelectOne(r.propertyKey)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="contained"
        color="success"
        disabled={selected.length === 0 || loading}
        onClick={handleApprove}
        sx={{ mt: 2 }}
      >
        Approve ({selected.length})
      </Button>
    </Box>
  );
};

export default PropertyTypeZO;