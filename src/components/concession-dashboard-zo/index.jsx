import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, DescriptionOutlined, Search, VisibilityOutlined } from "@mui/icons-material";
import DashBoardContainer from "../layout/dashboard-container";
import {
  getConcessionApplicationsForZo,
  getGatByZonekey,
  getZoneByProfile,
  reviewConcessionApplication,
  ViewProTransactionDoc,
} from "../../services/assessment-services";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";

const field = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== "") || "-";
const getFinancialYearStartDate = () => {
  const today = new Date();
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `01/04/${year}`;
};
const unwrapList = (response) => {
  const data = response?.data || response;
  if (Array.isArray(data)) return data;
  return data?.lstPropertyConcessionVO || data?.concessionApplicationVO || data?.applicationVOs || data?.applicationList || data?.data || [];
};

export default function ConcessionDashboardZo() {
  const [applications, setApplications] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [fromDate, setFromDate] = useState(getFinancialYearStartDate());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [zones, setZones] = useState([]);
  const [gats, setGats] = useState([]);
  const [zoneKey, setZoneKey] = useState("");
  const [gatKey, setGatKey] = useState("");
  const [reviewAction, setReviewAction] = useState("");
  const [reviewRemark, setReviewRemark] = useState("");

  const loadApplications = useCallback(async () => {
    if (!zoneKey || !fromDate || !toDate) {
      setError("Select a zone and date range before loading applications.");
      return;
    }
    setHasSearched(true);
    setLoading(true);
    setError("");
    try {
      const response = await getConcessionApplicationsForZo({
        fromDate,
        toDate,
        zoneKey: Number(zoneKey),
        gatKey: gatKey ? Number(gatKey) : null,
      });
      const rows = unwrapList(response);
      setApplications(rows);
      setSelected((current) => current ? rows.find((row) => String(field(row, "trnPropertyConceesionId", "appId", "applicationId", "applicationNo", "applicationNumber")) === String(field(current, "trnPropertyConceesionId", "appId", "applicationId", "applicationNo", "applicationNumber"))) || null : null);
    } catch (loadError) {
      setError(getErrorMsg(loadError));
    } finally {
      setLoading(false);
    }
  }, [fromDate, gatKey, toDate, zoneKey]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await getZoneByProfile();
        const availableZones = response?.zoneLst || [];
        setZones(availableZones);
        if (availableZones.length === 1) setZoneKey(String(availableZones[0].value));
      } catch (loadError) {
        setError(getErrorMsg(loadError));
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    setGatKey("");
    setGats([]);
    if (!zoneKey) return;
    getGatByZonekey({ zoneKey: Number(zoneKey) })
      .then((response) => {
        setGats(response?.gatLst || []);
      })
      .catch((loadError) => setError(getErrorMsg(loadError)));
  }, [zoneKey]);

  const categories = useMemo(() => ["All categories", ...new Set(applications.map((row) => field(row, "concessionName", "concessionType")).filter((name) => name !== "-"))], [applications]);
  const filtered = useMemo(() => applications.filter((row) => {
    const id = field(row, "appId", "trnPropertyConceesionId", "applicationId", "applicationNo", "applicationNumber");
    const property = field(row, "propertyCode", "upicId", "UPICId");
    const applicant = field(row, "applicantName", "propertyName", "ownerName");
    const matchesQuery = `${id} ${property} ${applicant}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = category === "All categories" || field(row, "concessionName", "concessionType") === category;
    return matchesQuery && matchesCategory;
  }), [applications, category, query]);

  const openApplication = (row) => {
    setSelected(row);
    setReviewAction("");
    setReviewRemark("");
  };

  const submitReview = async () => {
    const remark = reviewRemark.trim();
    if (!reviewAction || !remark) return;
    const concessionId = selected?.trnPropertyConceesionId
      ?? selected?.trnPropertyConcessionId
      ?? selected?.propertyConcessionId
      ?? selected?.propertyConcessionKey
      ?? selected?.concessionId;
    if (concessionId === undefined || concessionId === null || concessionId === "") {
      showToastError("This application is missing its concession transaction ID. Reload the application list and try again.");
      return;
    }
    if (!Number.isFinite(Number(concessionId))) {
      showToastError("The concession transaction ID is invalid. Reload the application list and try again.");
      return;
    }
    setSaving(true);
    try {
      const response = await reviewConcessionApplication({
        trnPropertyConceesionId: Number(concessionId),
        propertyCode: field(selected, "propertyCode", "upicId", "UPICId"),
        concessionName: field(selected, "concessionName", "concessionType"),
        financialyearkey: Number(field(selected, "financialyearkey", "financialYearKey")),
        action: reviewAction,
        remark,
        ...(reviewAction === "Reject" ? { rejectReason: remark } : {}),
      });
      const result = response?.data ?? response;
      const responseMessage = typeof result === "string"
        ? result
        : result?.message || result?.responseMessage || response?.message;
      const responseStatus = String(result?.status ?? result?.statusMessage ?? "").toLowerCase();
      const responseCode = Number(result?.code ?? result?.responseCode);
      const failed = result?.success === false
        || result?.error === true
        || responseStatus === "failed"
        || responseStatus === "failure"
        || responseStatus === "error"
        || (Number.isFinite(responseCode) && responseCode >= 4000);

      if (failed) {
        showToastError(responseMessage || "The concession review could not be submitted.");
        return;
      }

      showToastSuccess(responseMessage || (reviewAction === "Accept" ? "Concession application accepted successfully." : "Concession application rejected successfully."));
      setSelected(null);
      await loadApplications();
    } catch (submitError) {
      showToastError(getErrorMsg(submitError));
    } finally {
      setSaving(false);
    }
  };

  const docs = selected?.lstDocVOs || selected?.documentVOs || selected?.documents || [];
  const applicationId = selected && field(selected, "appId", "trnPropertyConceesionId", "applicationId", "applicationNo", "applicationNumber");
  const hasDocumentPaths = docs.length > 0 && docs.every((doc) => Boolean(doc?.documentURLbase64 || doc?.documentUrl || doc?.documentURL || doc?.fileUrl));
  return (
    <DashBoardContainer>
      <Box sx={{ maxWidth: 1500, mx: "auto", p: { xs: 1, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={750} color="#12364a">Property Concession Review</Typography>
            <Typography color="text.secondary">Review citizen documents, record your Shera, and decide each application.</Typography>
          </Box>
          <Chip color="warning" label={`${applications.length} pending`} />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={loadApplications}>Retry</Button>}>{error}</Alert>}

        {!selected && <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Application filters</Typography>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth size="small" label="From date" placeholder="DD/MM/YYYY" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth size="small" label="To date" placeholder="DD/MM/YYYY" value={toDate} onChange={(event) => setToDate(event.target.value)} /></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth select size="small" label="Zone" value={zoneKey} onChange={(event) => setZoneKey(event.target.value)}>{zones.map((zone) => <MenuItem key={zone.value} value={zone.value}>{zone.label || zone.name || zone.zoneName}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth select size="small" label="GAT (optional)" value={gatKey} onChange={(event) => setGatKey(event.target.value)} disabled={!zoneKey}><MenuItem value="">All GATs</MenuItem>{gats.map((gat) => <MenuItem key={gat.value} value={gat.value}>{gat.label || gat.name || gat.gatName}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadApplications} disabled={loading} sx={{ py: 1.1, bgcolor: "#116d73" }}>{loading ? "Loadingâ€¦" : "Load applications"}</Button></Grid>
            </Grid>
          </CardContent>
        </Card>}

        {selected ? (
          <>
            <Button onClick={() => setSelected(null)} sx={{ mb: 2 }}>â† Back to applications</Button>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Application</Typography>
                    <Typography variant="h6" fontWeight={700}>{applicationId}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.3}>
                      <Info label="Concession" value={field(selected, "concessionName", "concessionType")} />
                      <Info label="Applicant" value={field(selected, "applicantName", "propertyName", "ownerName")} />
                      <Info label="Property code" value={field(selected, "propertyCode", "upicId", "UPICId")} />
                      <Info label="UPIC ID" value={field(selected, "upicId", "UPICId")} />
                      <Info label="Property address" value={field(selected, "propertyAddress")} />
                      <Info label="Use type" value={field(selected, "finalUseType")} />
                      <Info label="Financial year key" value={field(selected, "financialyearkey", "financialYearKey")} />
                      <Info label="Mobile number" value={field(selected, "mobileNumber", "applicantMobile", "propertyMobileNo")} />
                      <Info label="Submitted" value={field(selected, "submittedDate", "applicationDate", "createdDate")} />
                    </Stack>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Decision</Typography>
                    <TextField fullWidth select size="small" label="Action" value={reviewAction} onChange={(event) => setReviewAction(event.target.value)}>
                      <MenuItem value="Accept">Accept</MenuItem>
                      <MenuItem value="Reject">Reject</MenuItem>
                    </TextField>
                    <TextField fullWidth multiline minRows={3} label="Remark" value={reviewRemark} onChange={(event) => setReviewRemark(event.target.value)} inputProps={{ maxLength: 1000 }} helperText={`${reviewRemark.length}/1000 characters`} sx={{ mt: 2 }} />
                    <Button fullWidth variant="contained" startIcon={<CheckCircleOutline />} disabled={saving || !reviewAction || !reviewRemark.trim()} onClick={submitReview} sx={{ mt: 2, bgcolor: reviewAction === "Reject" ? "#b3261e" : "#147d62", py: 1.2, fontWeight: 700, "&:hover": { bgcolor: reviewAction === "Reject" ? "#8c1d18" : "#0e624c" } }}>
                      {saving ? "Submitting…" : "Submit"}
                    </Button></CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Box><Typography variant="subtitle1" fontWeight={700}>Uploaded documents</Typography><Typography variant="body2" color="text.secondary">Open and check each document before approving.</Typography></Box>
                      <Chip label={`${docs.length} files`} variant="outlined" />
                    </Stack>
                    {docs.length ? docs.map((doc, index) => {
                      const name = field(doc, "documentName", "fileName", "name", "documentId");
                      return <Paper key={`${name}-${index}`} variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><DescriptionOutlined color="action" /><Typography fontWeight={600}>{name}</Typography><Chip size="small" variant="outlined" color={doc.reuploaded ? "info" : "default"} label={doc.reuploaded ? "Reuploaded" : "Original upload"} /></Stack>
                        <ConcessionDocumentPreview document={doc} name={name} />
                      </Paper>;
                    }) : <Alert severity="warning">No uploaded documents were returned for this application.</Alert>}
                    <Alert severity="info" sx={{ mt: 1 }}>Review the uploaded documents above, select an action, and enter a remark before submitting.</Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField size="small" fullWidth placeholder="Search application, property, applicant" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }} />
                <TextField select size="small" label="Concession category" value={category} onChange={(event) => setCategory(event.target.value)} sx={{ minWidth: { md: 220 } }}>{categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              </Stack>
              {loading ? <Box sx={{ py: 8, display: "grid", placeItems: "center" }}><CircularProgress /></Box> : filtered.length ? <Box sx={{ display: "grid", gap: 1.2 }}>
                {filtered.map((row, index) => {
                  const id = field(row, "appId", "trnPropertyConceesionId", "applicationId", "applicationNo", "applicationNumber");
                  return <Paper key={`${id}-${index}`} variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ minWidth: 150, flex: 1 }}><Typography variant="caption" color="text.secondary">APPLICATION</Typography><Typography fontWeight={700}>{id}</Typography></Box>
                    <Box sx={{ minWidth: 150, flex: 1 }}><Typography variant="caption" color="text.secondary">APPLICANT / PROPERTY</Typography><Typography>{field(row, "applicantName", "propertyName", "ownerName")}</Typography><Typography variant="caption" color="text.secondary">{field(row, "propertyCode", "upicId", "UPICId")}</Typography></Box>
                    <Box sx={{ minWidth: 130, flex: 1 }}><Typography variant="caption" color="text.secondary">CONCESSION</Typography><Typography>{field(row, "concessionName", "concessionType")}</Typography></Box>
                    <Chip size="small" color="warning" label={field(row, "status", "applicationStatus") === "-" ? "Pending review" : field(row, "status", "applicationStatus")} />
                    <Button variant="contained" onClick={() => openApplication(row)} sx={{ bgcolor: "#116d73" }}>Review</Button>
                  </Paper>;
                })}
              </Box> : <Box sx={{ py: 7, textAlign: "center" }}><DescriptionOutlined sx={{ fontSize: 42, color: "text.disabled", mb: 1 }} /><Typography fontWeight={700}>{hasSearched ? "No applications found for these filters" : "Set filters to view concession applications"}</Typography><Typography color="text.secondary" variant="body2">{hasSearched ? "Try a wider date range or check the selected zone and GAT." : "Choose a date range, zone, and GAT, then load applications."}</Typography></Box>}
            </CardContent>
          </Card>
        )}
      </Box>
    </DashBoardContainer>
  );
}

function Info({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>{value}</Typography></Box>;
}

function ConcessionDocumentPreview({ document, name }) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl;
    let active = true;
    const loadDocument = async () => {
      const path = document?.documentURLbase64 || document?.documentUrl || document?.documentURL || document?.fileUrl;
      if (!path) {
        setError("Document path was not returned.");
        setLoading(false);
        return;
      }
      try {
        const file = await ViewProTransactionDoc(name, path);
        if (!active) return;
        objectUrl = window.URL.createObjectURL(new Blob([file], { type: file.type || "application/pdf" }));
        setSource(objectUrl);
      } catch (loadError) {
        if (active) setError(getErrorMsg(loadError) || "Could not load this document.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDocument();
    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [document, name]);

  if (loading) return <Box sx={{ py: 4, display: "grid", placeItems: "center" }}><CircularProgress size={26} /></Box>;
  if (error) return <Alert severity="warning">{error}</Alert>;
  return <>
    <Button size="small" startIcon={<VisibilityOutlined />} component="a" href={source} target="_blank" rel="noreferrer" sx={{ mb: 1 }}>Open document</Button>
    <Box component="iframe" title={name} src={`${source}#toolbar=1`} sx={{ width: "100%", height: { xs: 360, md: 560 }, border: 0, bgcolor: "#f4f7f8", borderRadius: 1 }} />
  </>;
}
