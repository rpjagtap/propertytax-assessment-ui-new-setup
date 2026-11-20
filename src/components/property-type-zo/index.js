import React, { useEffect, useState, useCallback } from "react";
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
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  Zoom,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DashBoardContainer from "../layout/dashboard-container";
import Loader from "../../components/loader/loader";
import AlertMsg from "../common/alert";
import {
  getZoneByProfile,
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
  const [zones, setZones] = useState([]); // ZO चे zones
  const [zoneKey, setZoneKey] = useState(""); // "" = सर्व zones
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]); // propertyKey values
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // एका किंवा सर्व zones चा डेटा आणतो
  const loadData = useCallback(async (zoneList, chosenKey) => {
    try {
      setLoading(true);
      setError("");

      const keys = chosenKey
        ? [chosenKey]
        : (zoneList || []).map((z) => z.value);

      const results = await Promise.all(
        keys.map((k) => getRedZoneDataForZO(k)) // -> /property/get_redzone_data_for_zo?zoneKey=k
      );

      // merge + duplicate propertyKey काढून टाका
      const merged = results.flatMap(normalizeList);
      const unique = Array.from(
        new Map(merged.map((r) => [r.propertyKey, r])).values()
      );

      setRows(unique);
      setSelected([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load red zone properties");
    } finally {
      setLoading(false);
    }
  }, []);

  // Tab उघडल्यावर: zones आणा -> डेटा आपोआप लोड करा
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await getZoneByProfile();
        const list = res?.zoneLst || [];
        setZones(list);

        if (list.length === 1) {
          setZoneKey(list[0].value);
          await loadData(list, list[0].value);
        } else {
          await loadData(list, ""); // अनेक zones असतील तर सर्व दाखवा
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load zones");
        setLoading(false);
      }
    };
    init();
  }, [loadData]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && !allSelected;

  const handleSelectAll = (e) =>
    setSelected(e.target.checked ? rows.map((r) => r.propertyKey) : []);

  const handleSelectOne = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    try {
      setLoading(true);
      setError("");

      const count = selected.length;
      const res = await approvedPropertyType(selected); // संपूर्ण array एकदाच

      setSuccess(
        res?.message ||
          (count === 1
            ? "1 property submitted successfully"
            : `${count} properties submitted successfully`)
      );
      await loadData(zones, zoneKey); // list refresh
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to submit selected properties"
      );
      setLoading(false);
    }
  };

  return (
    <DashBoardContainer>
      {error && (
        <AlertMsg message={error} severity="error" onClose={() => setError("")} />
      )}

      {/* ---------- Fancy success dialog (sky blue) ---------- */}
      <Dialog
        open={!!success}
        onClose={() => setSuccess("")}
        TransitionComponent={Zoom}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(14,165,233,0.30)",
          },
        }}
      >
        <DialogContent sx={{ pt: 5, pb: 4, px: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2.5,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 8px #E0F2FE, 0 8px 20px rgba(14,165,233,0.35)",
            }}
          >
            <CheckRoundedIcon sx={{ color: "#fff", fontSize: 46 }} />
          </Box>

          <Typography
            sx={{ fontWeight: 700, fontSize: 22, color: "#12233F", mb: 1 }}
          >
            Success!
          </Typography>

          <Typography sx={{ color: "text.secondary", fontSize: 15, mb: 3 }}>
            {success}
          </Typography>

          <Button
            variant="contained"
            onClick={() => setSuccess("")}
            sx={{
              px: 6,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #0284C7 0%, #0EA5E9 100%)",
              },
            }}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>

      <Box p={2}>
        {loading && <Loader />}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          gap={2}
        >
          <Typography variant="h6">Red Zone Properties</Typography>

          <Box display="flex" gap={2} alignItems="center">
            {zones.length > 1 && (
              <TextField
                select
                size="small"
                label="Zone"
                value={zoneKey}
                onChange={(e) => setZoneKey(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Zones</MenuItem>
                {zones.map((z) => (
                  <MenuItem key={z.value} value={z.value}>
                    {z.label ?? z.name ?? z.value}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <Button
              variant="contained"
              onClick={() => loadData(zones, zoneKey)}
              disabled={loading}
            >
              Show
            </Button>
          </Box>
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

        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="success"
            disabled={selected.length === 0 || loading}
            onClick={handleSubmit}
          >
            Submit ({selected.length})
          </Button>
        </Box>
      </Box>
    </DashBoardContainer>
  );
};

export default PropertyTypeZO;