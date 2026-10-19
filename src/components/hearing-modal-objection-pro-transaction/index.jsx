import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { RenderTableHead } from "../common/table";
import {
  DateComponent,
  SelectComponent,
  TextComponent,
  TimePickerComponent,
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

const actionTypeOptions = [
  { label: "Send Hearing Invite", value: "Send Hearing Invite" },
  { label: "Close Hearing", value: "Close Hearing" },
];



// Inline version of HearingModalObjection: same table and logic, but it renders
// as normal page content (no Modal, no close/cancel). The parent page wraps it
// in a card/section.
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
    try {
      setLoading(true);
      await updateObjectionHearingDetails(rows);
      showToastSuccess();
      // No modal to close: reload so saved rows become read-only and new ids appear
      await loadData();
    } catch (error) {
      showToastError(getErrorMsg(error));
      setLoading(false);
    }
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 900,
                border: 1,
                borderColor: "grey.300",
              }}
              size="small"
              aria-label="hearing table"
            >
              <RenderTableHead
                thSx={{
                  bgcolor: "#abd9e3",
                  fontWeight: 600,
                }}
                trSx={{
                  "& th": {
                    border: "1px solid grey",
                    padding: 0,
                    margin: 0,
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
                  rows.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "& td": {
                          border: "1px solid grey",
                        },
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{ minWidth: "10px !important" }}
                      >
                        {index + 1}
                      </TableCell>

                      <TableCell align="center">
                        <DateComponent
                          id={index}
                          name="hearingDate"
                          value={row.hearingDate}
                          isDisabled={isEditable(row.isEnable)}
                          handleInputChange={handleInputChange}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TimePickerComponent
                          id={index}
                          name="hearingTime"
                          handleInputChange={handleInputChange}
                          defaultValue={row.hearingTime}
                          isDisabled={isEditable(row.isEnable)}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextComponent
                          id={index}
                          name="inviteRemark"
                          handleInputChange={handleInputChange}
                          value={row.inviteRemark}
                          isDisabled={isEditable(row.isEnable)}
                          multiline
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextComponent
                          id={index}
                          name="hearingRemark"
                          handleInputChange={handleInputChange}
                          value={row.hearingRemark}
                          isDisabled={isEditable(row.isEnable)}
                          multiline
                        />
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          id={index}
                          name="actionType"
                          handleInputChange={handleInputChange}
                          options={actionTypeOptions}
                          value={row.actionType}
                          isDisabled={isEditable(row.isEnable)}
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{ minWidth: "10px !important" }}
                      >
                        <Button
                          disabled={!row?.isNew}
                          endIcon={<Delete />}
                          onClick={() => handleRemoveRow(index)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        padding: 3,
                        color: "text.secondary",
                        border: "1px solid grey",
                      }}
                    >
                        {labels.NoRecordsFound[lang]}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={handleAddRow}
              endIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {labels.ScheduleOrReschedule[lang]}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              sx={{ textTransform: "none", fontWeight: 600 }}
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