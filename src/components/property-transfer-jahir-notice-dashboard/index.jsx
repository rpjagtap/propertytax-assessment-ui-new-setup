import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, TableSortLabel, TextField, Select, MenuItem, Pagination,
  CircularProgress, Link, Chip, Avatar, Divider, Stack, Grid,
} from "@mui/material";
import { ListAltOutlined, ReceiptLongOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getPropertyTransferJahirNoticeDashboard } from "../../services/assessment-services";

// Logo file: put it at  public/images/pcmc_3d_logo.jpg
// (Vite: use `${import.meta.env.BASE_URL}images/pcmc_3d_logo.jpg`)
const LOGO = `${process.env.PUBLIC_URL || ""}/images/pcmc_3d_logo.jpg`;

// matches routes.js -> { path: "transfer-notice", component: TransferNoticePdf }
const NOTICE_ROUTE = "/transfer-notice";

/* API response: { lstDetails: [ { applicationNo, applicantName, propertyAddress,
   trackingId, propertyCode, zoneName, noticeDate? } ] } */

const NAVY = "#12233F";
const GREEN = "#0F6E56";

const columns = [
  { id: "srNo", label: "अ.क्र.", width: 70, sortable: false },
  { id: "zoneName", label: "विभागीय कार्यालय", width: 160 },
  { id: "propertyCode", label: "मालमत्ता क्र.", width: 150 },
  { id: "applicationNo", label: "अर्ज क्र.", width: 140 },
  { id: "applicantName", label: "अर्जदाराचे नाव", width: 200 },
  { id: "propertyAddress", label: "मालमत्ता पत्ता", width: 400 },
  { id: "noticeDate", label: "जाहीर नोटीस दिनांक", width: 170 },
  { id: "notice", label: "नोटीस", width: 90, sortable: false },
];

// dd/mm/yyyy -> yyyymmdd so dates sort correctly
const sortValue = (row, id) => {
  const v = row[id] ?? "";
  if (id === "noticeDate" && v) return v.split("/").reverse().join("");
  return String(v);
};

export default function JahirNoticeDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1); // 1-based (MUI Pagination)
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [logoFailed, setLogoFailed] = useState(false);

  // Loads automatically when the tab / screen opens
  useEffect(() => {
    (async () => {
      try {
        const res = await getPropertyTransferJahirNoticeDashboard();
        // works whether the service returns the array, { lstDetails }, or the full axios response
        const list = Array.isArray(res) ? res : res?.lstDetails || res?.data?.lstDetails || [];
        setRows(list);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = q
      ? rows.filter((r) =>
          [r.zoneName, r.propertyCode, r.applicationNo, r.applicantName, r.propertyAddress, r.noticeDate]
            .join(" ").toLowerCase().includes(q))
      : [...rows];
    if (orderBy) {
      data.sort((a, b) => {
        const c = sortValue(a, orderBy).localeCompare(sortValue(b, orderBy), "mr", { numeric: true });
        return order === "asc" ? c : -c;
      });
    }
    return data;
  }, [rows, search, orderBy, order]);

  const pageRows = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const handleSort = (id) => {
    setOrder(orderBy === id && order === "asc" ? "desc" : "asc");
    setOrderBy(id);
  };

  // Opens the TransferNoticePdf page (it fetches the notice itself via getTransferNotice)
  const handleNotice = (row) =>
    navigate(NOTICE_ROUTE, {
      state: { applicationNo: row.applicationNo, trackingId: row.trackingId, from: "JAHIR_NOTICE_DASHBOARD" },
    });

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh", p: { xs: 1, md: 2 } }}>
      {/* ---------- Header band (no logo: the website header already shows it) ---------- */}
      <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(90deg, #12233F 0%, #1B3A63 100%)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {!logoFailed ? (
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={LOGO}
                alt="PCMC"
                onError={() => {
                  console.error("Logo not found at:", LOGO);
                  setLogoFailed(true);
                }}
                sx={{ height: 90, width: 90, objectFit: "contain", display: "block" }}
              />
            </Box>
          ) : (
            <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.12)", color: "#5DCAA5" }}>
              <ReceiptLongOutlined />
            </Avatar>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: 18, md: 24 }, lineHeight: 1.3 }}>
              पिंपरी चिंचवड महानगरपालिका पिंपरी -४११०१८
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: { xs: 14, md: 18 } }}>
              कर आकारणी व कर संकलन विभाग
            </Typography>
            <Typography sx={{ color: "#5DCAA5", fontWeight: 600, fontSize: { xs: 14, md: 17 } }}>
              मालमत्ता हस्तांतरण जाहीर नोटीस डॅशबोर्ड
            </Typography>
          </Box>

          {!!rows.length && (
            <Chip
              icon={<ListAltOutlined sx={{ color: `${GREEN} !important` }} />}
              label={`${rows.length} records`}
              sx={{ bgcolor: "#E1F5EE", color: GREEN, fontWeight: 600 }}
            />
          )}
        </Box>
      </Card>

      {/* ---------- Results ---------- */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#E1F5EE", color: GREEN }}>
              <ListAltOutlined fontSize="small" />
            </Avatar>
            <Typography sx={{ fontWeight: 600, fontSize: 15, color: NAVY }}>
              मालमत्ता हस्तांतरण जाहीर नोटीस डॅशबोर्ड
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontSize: 14 }}>Show</Typography>
            <Select
              size="small"
              value={pageSize}
              onChange={(e) => { setPageSize(e.target.value); setPage(1); }}
            >
              {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
            <Typography sx={{ fontSize: 14 }}>entries</Typography>
          </Stack>
        </Box>

        <Divider />

        <Grid container justifyContent="flex-end" spacing={1} p={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              variant="outlined"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 1100, borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow sx={{ "& th": { padding: "10px 12px" } }}>
                {columns.map((c) => (
                  <TableCell
                    key={c.id}
                    align="center"
                    sx={{ width: c.width, bgcolor: NAVY, color: "#fff", fontWeight: 600, fontSize: "13px" }}
                  >
                    {c.sortable === false ? c.label : (
                      <TableSortLabel
                        active={orderBy === c.id}
                        direction={orderBy === c.id ? order : "asc"}
                        onClick={() => handleSort(c.id)}
                        sx={{
                          color: "#fff !important",
                          "& .MuiTableSortLabel-icon": { color: "#5DCAA5 !important" },
                        }}
                      >
                        {c.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} sx={{ color: NAVY }} />
                  </TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No data available</TableCell>
                </TableRow>
              ) : pageRows.map((r, i) => (
                <TableRow
                  key={r.trackingId ?? i}
                  hover
                  sx={{ "& td": { padding: "8px 12px", fontSize: "13px" } }}
                >
                  <TableCell align="center">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell>{r.zoneName}</TableCell>
                  <TableCell align="center">{r.propertyCode}</TableCell>
                  <TableCell align="center">{r.applicationNo}</TableCell>
                  <TableCell>{r.applicantName}</TableCell>
                  <TableCell>{r.propertyAddress}</TableCell>
                  <TableCell align="center">{r.noticeDate || "-"}</TableCell>
                  <TableCell align="center">
                    {r.noticeDate ? (
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() => handleNotice(r)}
                        sx={{ color: GREEN, fontWeight: 600, fontSize: 13 }}
                      >
                        Notice
                      </Link>
                    ) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer: count + pagination */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {filtered.length === 0
              ? "Showing 0 entries"
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
          </Typography>
          <Pagination
            count={Math.max(1, Math.ceil(filtered.length / pageSize))}
            page={page}
            onChange={(_, p) => setPage(p)}
          />
        </Box>
      </Paper>
    </Box>
  );
}
