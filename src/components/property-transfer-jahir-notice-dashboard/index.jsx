import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TableSortLabel, TextField, Select, MenuItem, TablePagination,
  CircularProgress, Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPropertyTransferJahirNoticeDashboard } from "../../services/assessment-services";

// TODO: put your logo path
const LOGO = "/images/pcmc 3d logo.jpg";

// matches routes.js -> { path: "transfer-notice", component: TransferNoticePdf }
const NOTICE_ROUTE = "/transfer-notice";

/* API response: { lstDetails: [ { applicationNo, applicantName, propertyAddress,
   trackingId, propertyCode, zoneName, noticeDate? } ] } */

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
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");

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

  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

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
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 6, px: 4, py: 2, bgcolor: "#fff", borderBottom: "1px solid #eee" }}>
          <Box component="img" src={LOGO} alt="PCMC" onError={(e) => { e.currentTarget.style.display = "none"; }} sx={{ height: 120 }} />
          <Box>
            <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}>पिंपरी चिंचवड महानगरपालिका पिंपरी -४११०१८</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>कर आकारणी व कर संकलन विभाग</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>मालमत्ता हस्तांतरण जाहीर नोटीसा</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Show</Typography>
            <Select size="small" value={pageSize} onChange={(e) => { setPageSize(e.target.value); setPage(0); }}>
              {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
            <Typography>entries</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Search:</Typography>
            <TextField size="small" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </Box>
        </Box>

        <Box sx={{ px: 2, overflowX: "auto" }}>
          <Table size="small" sx={{ border: "1px solid #e0e0e0", minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                {columns.map((c) => (
                  <TableCell key={c.id} align="center" sx={{ width: c.width, fontWeight: 700, fontSize: 16, borderRight: "1px solid #e0e0e0" }}>
                    {c.sortable === false ? c.label : (
                      <TableSortLabel active={orderBy === c.id} direction={orderBy === c.id ? order : "asc"} onClick={() => handleSort(c.id)}>
                        {c.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">No data available</TableCell></TableRow>
              ) : pageRows.map((r, i) => (
                <TableRow key={r.trackingId ?? i} hover>
                  <TableCell align="center">{page * pageSize + i + 1}</TableCell>
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
                        sx={{ color: "#00b074", fontWeight: 700, fontSize: 16 }}
                      >
                        Notice
                      </Link>
                    ) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[]}
          onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to, count }) => `Showing ${from} to ${to} of ${count} entries`}
        />
      </Paper>
    </Box>
  );
}
