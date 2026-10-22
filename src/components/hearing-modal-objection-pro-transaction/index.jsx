import { Add, DeleteOutline, AccessTime, EventBusy } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { RenderTableHead } from "../common/table";
import {
  DateComponent,
  SelectComponent,
  TextComponent,
} from "../assessment-dashboard/inputs";
import {
  getObjectionHearingDetails,
  updateObjectionHearingDetails,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";

// Where the hearing letter page is routed, and the key used to hand data to it
const HEARING_LETTER_ROUTE = "/hearing-letter";
const HEARING_LETTER_KEY = "hearingLetterData";

const actionTypeOptions = [
  { label: "Send Hearing Invite", value: "Send Hearing Invite" },
  { label: "Close Hearing", value: "Close Hearing" },
];

/* ---------- design tokens ---------- */
const tone = {
  ink: "#1f2d3d",
  muted: "#6b7a8c",
  line: "#e3e9ef",
  headBg: "#eef5f8",
  headInk: "#27536b",
  accent: "#1f7a8c",
  accentSoft: "#e4f2f5",
  zebra: "#fafcfd",
  newRowBg: "#f1f9fb",
  lockedBg: "#f6f7f9",
  danger: "#c0392b",
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// Parses "10:30 AM" / "22:30" / "22:30:00" into { h: "10", m: "30", p: "AM" }
const parseTime = (v) => {
  const empty = { h: "", m: "", p: "" };
  if (!v) return empty;
  const x = String(v).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!x) return empty;
  let h = parseInt(x[1], 10);
  let p = x[3]?.toUpperCase();
  if (!p) {
    p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
  }
  return { h: String(h).padStart(2, "0"), m: x[2], p };
};

// Value sent to handleInputChange, e.g. "09:30 AM". Change here if your API needs another format.
const formatTime = ({ h, m, p }) => `${h}:${m} ${p}`;

const selectSx = (disabled) => ({
  minWidth: 64,
  borderRadius: 2,
  bgcolor: disabled ? "transparent" : "#fff",
  fontWeight: 500,
  color: tone.ink,
  fontVariantNumeric: "tabular-nums",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: disabled ? "transparent" : tone.line,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: disabled ? "transparent" : tone.accent,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: tone.accent,
    borderWidth: 2,
  },
  "& .MuiSelect-select.Mui-disabled": { WebkitTextFillColor: tone.ink },
  "&.Mui-disabled .MuiSelect-icon": { display: "none" },
});

/* 12-hour time field: hour + minute + AM/PM. Same props as the old TimePickerComponent. */
const TimeField = ({ id, name, defaultValue, isDisabled, handleInputChange }) => {
  const t = parseTime(defaultValue);

  const update = (patch) => {
    const next = {
      h: t.h || "12",
      m: t.m || "00",
      p: t.p || "AM",
      ...patch,
    };
    handleInputChange(id, name, formatTime(next));
  };

  const menuProps = { PaperProps: { sx: { maxHeight: 240, borderRadius: 2 } } };

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      <AccessTime sx={{ fontSize: 18, color: isDisabled ? "#a9b4c0" : tone.accent }} />
      <Select
        size="small"
        displayEmpty
        value={t.h}
        disabled={isDisabled}
        onChange={(e) => update({ h: e.target.value })}
        renderValue={(v) => v || "hh"}
        MenuProps={menuProps}
        inputProps={{ "aria-label": "Hour" }}
        sx={{ ...selectSx(isDisabled), "& .MuiSelect-select": { color: t.h ? tone.ink : tone.muted } }}
      >
        {HOURS.map((h) => (
          <MenuItem key={h} value={h}>{h}</MenuItem>
        ))}
      </Select>
      <Box component="span" sx={{ color: tone.muted, fontWeight: 600 }}>:</Box>
      <Select
        size="small"
        displayEmpty
        value={t.m}
        disabled={isDisabled}
        onChange={(e) => update({ m: e.target.value })}
        renderValue={(v) => v || "mm"}
        MenuProps={menuProps}
        inputProps={{ "aria-label": "Minute" }}
        sx={{ ...selectSx(isDisabled), "& .MuiSelect-select": { color: t.m ? tone.ink : tone.muted } }}
      >
        {MINUTES.map((m) => (
          <MenuItem key={m} value={m}>{m}</MenuItem>
        ))}
      </Select>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={t.p || null}
        disabled={isDisabled}
        onChange={(_, v) => v && update({ p: v })}
        aria-label="AM or PM"
        sx={{
          ml: 0.5,
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 12,
            px: 1.1,
            py: 0.7,
            color: tone.muted,
            borderColor: tone.line,
            "&:first-of-type": { borderRadius: "8px 0 0 8px" },
            "&:last-of-type": { borderRadius: "0 8px 8px 0" },
            "&.Mui-selected": {
              bgcolor: tone.accent,
              color: "#fff",
              "&:hover": { bgcolor: "#186a7a" },
            },
            "&.Mui-disabled.Mui-selected": { bgcolor: "#d5e3e8", color: tone.headInk },
            "&.Mui-disabled:not(.Mui-selected)": { display: "none" },
          },
        }}
      >
        <ToggleButton value="AM">AM</ToggleButton>
        <ToggleButton value="PM">PM</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

const HearingSectionObjection = ({
  propertyTransactionId,
  onHearingsChange, // called with the saved hearings every time they are loaded from the API
}) => {
  const [rows, setRows] = useState([]);
  const { loading, setLoading, error, setError } = useApiState();
  const lang = useSelector((state) => state.userDetails.lang);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getObjectionHearingDetails(propertyTransactionId);
      const list = res || [];
      setRows(list);
      if (onHearingsChange) onHearingsChange(list);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyTransactionId) return;
    loadData();
    // eslint-disable-next-line
  }, [propertyTransactionId]);

  const handleAddRow = () => {
    const data = rows.map((item) => {
      if (item.actionType === "Send Hearing Invite") {
        return {
          ...item,
          actionType: "Close Hearing",
          hearingRemark: "Rescheduled",
        };
      }
      return item;
    });

    setRows([
      ...data,
      {
        propertyTransactionId: propertyTransactionId,
        hearingDate: "",
        hearingTime: "",
        inviteRemark: "",
        hearingRemark: "",
        actionType: "",
        isEnable: "Y",
        isNew: true,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const isEditable = (edit) => {
    return edit === "N";
  };

  const handleInputChange = (id, field, value) => {
    const newData = rows.map((row, index) => {
      if (index === id) {
        const { isNew, ...rest } = row;
        return {
          ...rest,
          [field]: value,
        };
      }
      return row;
    });
    setRows(newData);
  };

  const handleSubmit = async () => {
    // Letter is needed only when the LAST row is "Send Hearing Invite".
    // The tab is opened now (inside the click) so the browser doesn't block it as a popup.
    const lastRow = rows[rows.length - 1];
    const shouldOpenLetter = lastRow?.actionType === "Send Hearing Invite";
    const letterWindow = shouldOpenLetter ? window.open("", "_blank") : null;

    try {
      setLoading(true);
      const res = await updateObjectionHearingDetails(rows);
      showToastSuccess();

      const letterData = Array.isArray(res) ? res[0] : res?.data?.[0] || res;
      if (shouldOpenLetter && letterData?.hearingDate) {
        localStorage.setItem(
          HEARING_LETTER_KEY,
          JSON.stringify({
            ...letterData,
            propertyTransactionId: lastRow.propertyTransactionId,
          })
        );
        if (letterWindow) letterWindow.location.href = HEARING_LETTER_ROUTE;
      } else if (letterWindow) {
        letterWindow.close();
      }

      await loadData();
    } catch (error) {
      if (letterWindow) letterWindow.close();
      showToastError(getErrorMsg(error));
      setLoading(false);
    }
  };

  const bodyCellSx = {
    borderBottom: `1px solid ${tone.line}`,
    py: 1.25,
    px: 1.5,
    verticalAlign: "middle",
  };

  return (
    <Box>
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} sx={{ color: tone.accent }} />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              overflowX: "auto",
              border: `1px solid ${tone.line}`,
              borderRadius: 3,
            }}
          >
            <Table sx={{ minWidth: 960 }} size="small" aria-label="hearing table">
              <RenderTableHead
                thSx={{
                  bgcolor: tone.headBg,
                  color: tone.headInk,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2,
                }}
                trSx={{
                  "& th": {
                    bgcolor: tone.headBg,
                    color: tone.headInk,
                    fontWeight: 600,
                    fontSize: 13,
                    border: 0,
                    borderBottom: `2px solid ${tone.accent}`,
                    py: 1.5,
                    px: 1.5,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  },
                }}
                cells={[
                  `${labels.SNo[lang]}`,
                  `${labels.HearingDate[lang]}`,
                  `${labels.HearingTime[lang]}`,
                  `${labels.InviteRemark[lang]}`,
                  `${labels.HearingRemark[lang]}`,
                  `${labels.HearingAction[lang]}`,
                  `${labels.Delete[lang]}`,
                ]}
              />
              <TableBody>
                {rows && rows.length > 0 ? (
                  rows.map((row, index) => {
                    const locked = isEditable(row.isEnable);
                    return (
                      <TableRow
                        key={index}
                        hover={!locked}
                        sx={{
                          bgcolor: row.isNew
                            ? tone.newRowBg
                            : locked
                            ? tone.lockedBg
                            : index % 2
                            ? tone.zebra
                            : "#fff",
                          "& td:first-of-type": {
                            borderLeft: `3px solid ${
                              row.isNew ? tone.accent : "transparent"
                            }`,
                          },
                          "&:last-child td": { borderBottom: 0 },
                          "&.MuiTableRow-hover:hover": { bgcolor: tone.accentSoft },
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            ...bodyCellSx,
                            width: 56,
                            color: tone.muted,
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </TableCell>

                        <TableCell align="center" sx={bodyCellSx}>
                          <DateComponent
                            id={index}
                            name="hearingDate"
                            value={row.hearingDate}
                            isDisabled={locked}
                            handleInputChange={handleInputChange}
                          />
                        </TableCell>

                        <TableCell align="center" sx={bodyCellSx}>
                          <TimeField
                            id={index}
                            name="hearingTime"
                            handleInputChange={handleInputChange}
                            defaultValue={row.hearingTime}
                            isDisabled={locked}
                          />
                        </TableCell>

                        <TableCell align="center" sx={bodyCellSx}>
                          <TextComponent
                            id={index}
                            name="inviteRemark"
                            handleInputChange={handleInputChange}
                            value={row.inviteRemark}
                            isDisabled={locked}
                            multiline
                          />
                        </TableCell>

                        <TableCell align="center" sx={bodyCellSx}>
                          <TextComponent
                            id={index}
                            name="hearingRemark"
                            handleInputChange={handleInputChange}
                            value={row.hearingRemark}
                            isDisabled={locked}
                            multiline
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ ...bodyCellSx, minWidth: 190 }}>
                          <SelectComponent
                            id={index}
                            name="actionType"
                            handleInputChange={handleInputChange}
                            options={actionTypeOptions}
                            value={row.actionType}
                            isDisabled={locked}
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ ...bodyCellSx, width: 64 }}>
                          {row?.isNew ? (
                            <Tooltip title="Remove row">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveRow(index)}
                                aria-label="Remove row"
                                sx={{
                                  color: tone.danger,
                                  "&:hover": { bgcolor: "#fdecea" },
                                }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Chip
                              label="Saved"
                              size="small"
                              sx={{
                                bgcolor: "#e8eef3",
                                color: tone.muted,
                                fontWeight: 500,
                                height: 22,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, border: 0 }}>
                      <EventBusy sx={{ fontSize: 36, color: "#b8c4d0", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: tone.muted }}>
                        {labels.NoRecordFound[lang]}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleAddRow}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                color: tone.accent,
                borderColor: tone.accent,
                "&:hover": { bgcolor: tone.accentSoft, borderColor: tone.accent },
              }}
            >
              {labels.ScheduleOrReschedule[lang]}
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                bgcolor: tone.accent,
                "&:hover": { bgcolor: "#186a7a" },
              }}
            >
              {labels.SaveHearing[lang]}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default HearingSectionObjection;