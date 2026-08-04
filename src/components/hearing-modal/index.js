import { Add, Close, Delete } from "@mui/icons-material";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
// import { labels } from "../../lang/labels";
import { RenderTableHead } from "../common/table";
import { DateComponent, SelectComponent, TextComponent, TimePickerComponent } from "../assessment-dashboard/inputs";
import { getHearingDetails, updateHearingDetails } from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";

const actionTypeOptions = [
    { label: "Send Hearing Invite", value: "Send Hearing Invite" },
    { label: "Close Hearing", value: "Close Hearing" },
];
const HearingModal = ({ setOpenHearingModalId, assessmentId }) => {
    const [open, setOpen] = useState(true);
    // const handleOpen = () => setOpen(true);
    const [rows, setRows] = useState([]);

    const { loading, setLoading, error, setError } = useApiState();

    const handleClose = () => {
        setOpen(false);
        setOpenHearingModalId(false);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await getHearingDetails(assessmentId);
                setRows(res);
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line
    }, []);

    const handleAddRow = () => {
        const data = rows.map((item)=>{
            if(item.actionType === "Send Hearing Invite"){
                return {
                    ...item,
                    actionType:"Close Hearing",
                    hearingRemark:"Rescheduled"
                }
            }
            return item;
        })

        setRows([...data,{
            assessmentId: assessmentId,
            hearingDate: "",
            hearingTime: "",
            inviteRemark: "",
            hearingRemark: "",
            actionType:"",
            isEnable: "Y",
            isNew: true,
        }]);
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
                const newObject = rest;
                return {
                    ...newObject,
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
            await updateHearingDetails(rows);
            showToastSuccess();
            setTimeout(() => {
                setOpenHearingModalId("");
            }, 2000);
        } catch (error) {
            showToastError(getErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                handleClose();
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 1150,
                    bgcolor: "background.paper",
                    border: "1px solid #000",
                    boxShadow: 24,
                    p: 2,
                }}
            >
                {error && (
                    <AlertMsg
                        message={error}
                        severity="error"
                        onClose={() => {
                            setError("");
                        }}
                    />
                )}
                <IconButton
                    aria-label="close"
                    onClick={() => {
                        handleClose();
                    }}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
                <Grid sx={{ display: "flex", justifyContent: "left", marginBottom: "10px" }}>
                    <Typography variant="h5" component="h5">
                        Send Invite or Close Hearing
                    </Typography>
                </Grid>
                <Divider />
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <CircularProgress sx={{ marginTop: "65px" }} />
                    </div>
                ) : (
                    <>
                        <Grid container>
                            <Grid item xs={12}>
                                <TableContainer component={Paper}>
                                    <Table
                                        sx={{
                                            minWidth: 650,
                                            border: 1,
                                            borderColor: "grey.300",
                                            marginTop: "10px",
                                        }}
                                        size="small"
                                        aria-label="a dense table"
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
                                                "Sr.No.",
                                                "Hearing Date",
                                                "Hearing Time",
                                                "Invite Remark",
                                                "Hearing Remark",
                                                "Hearing Action",
                                                "Delete",
                                            ]}
                                            // handleSelectAll={handleSelectAll}
                                            // isSelectAll={isSelectAll}
                                        />
                                        <TableBody>
                                            {rows.map((row, index) => (
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
                                                    {/* ... table cells */}
                                                    <TableCell align="center" sx={{ minWidth: "10px !important" }}>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <DateComponent
                                                            id={index}
                                                            name={`hearingDate`}
                                                            value={row.hearingDate}
                                                            isDisabled={isEditable(row.isEnable)}
                                                            handleInputChange={handleInputChange}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TimePickerComponent
                                                            id={index}
                                                            name={`hearingTime`}
                                                            handleInputChange={handleInputChange}
                                                            // defaultValue={row.hearingTime.replace(/:(?=[^:]*$)/, " ")}
                                                            defaultValue={row.hearingTime}
                                                            isDisabled={isEditable(row.isEnable)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextComponent
                                                            id={index}
                                                            name={`inviteRemark`}
                                                            handleInputChange={handleInputChange}
                                                            value={row.inviteRemark}
                                                            isDisabled={isEditable(row.isEnable)}
                                                            multiline
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextComponent
                                                            id={index}
                                                            name={`hearingRemark`}
                                                            handleInputChange={handleInputChange}
                                                            value={row.hearingRemark}
                                                            isDisabled={isEditable(row.isEnable)}
                                                            multiline
                                                        />
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <SelectComponent
                                                            id={index}
                                                            name={`actionType`}
                                                            handleInputChange={handleInputChange}
                                                            options={actionTypeOptions}
                                                            value={row.actionType}
                                                            isDisabled={isEditable(row.isEnable)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ minWidth: "10px !important" }}>
                                                        <Button
                                                            disabled={!row?.isNew}
                                                            endIcon={<Delete />}
                                                            onClick={() => handleRemoveRow(index)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button
                                        sx={{
                                            marginTop: "10px",
                                            marginBottom: "5px",
                                        }}
                                        variant="contained"
                                        onClick={handleAddRow}
                                        endIcon={<Add />}
                                    >
                                        Schedule or Reschedule
                                    </Button>
                                </TableContainer>
                            </Grid>
                        </Grid>
                        {/* Action Buttons */}
                        <Grid sx={{ display: "flex", justifyContent: "center" }} mt={1}>
                            <Button variant="contained" sx={{ marginRight: "25px" }} color="success" onClick={handleSubmit}>
                                Submit
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setOpenHearingModalId();
                                }}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default HearingModal;
