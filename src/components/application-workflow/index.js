import React, { useEffect, useState } from "react";
import {
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Typography,
    Box,
    Grid,
    Tooltip,
    IconButton,
    Modal,
    CircularProgress,
    Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import useApiState from "../common/useApiState";
import { getApplicationFlow } from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { Close, HourglassTopRounded, More } from "@mui/icons-material";

const ApplicationWorkflow = ({ setOpenWorkflowModalId, assessmentId }) => {
    const { loading, setLoading } = useApiState();
    const [open, setOpen] = useState(true);
    const [workflowSteps, setWorkflowSteps] = useState([]);
    const handleClose = () => {
        setOpen(false);
        setOpenWorkflowModalId(false);
    };
    const truncatedRemark = (remark) => {
        return remark.substring(0, 20) + "...";
    };

    const getStepIcon = (action) => {
        switch (action) {
            case "Accept":
                return (
                    <Tooltip title="ACCEPTED">
                        <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    </Tooltip>
                );
            case "Reject":
                return (
                    <Tooltip title="REJECTED / OBJECTION">
                        <CancelIcon sx={{ color: "#f44336" }} />
                    </Tooltip>
                );
            case "Pending":
                return (
                    <Tooltip title="PENDING">
                        <HourglassTopRounded sx={{ color: "orange" }} />
                    </Tooltip>
                );
            default:
                break;
        }
        // return action === "Accept" ? <CheckCircleIcon sx={{ color: "#4caf50" }} /> : <CancelIcon sx={{ color: "#f44336" }} />;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await getApplicationFlow(assessmentId);
                setWorkflowSteps(res);
            } catch (error) {
                showToastError(getErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="application-workflow" aria-describedby="application-workflow">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 800,
                    bgcolor: "background.paper",
                    // border: "1px solid #000",
                    // boxShadow: 24,
                    p: 1,
                    maxHeight: "80vh", // Ensure the modal doesn't overflow the viewport
                    overflow: "auto", // Enable scrolling for overflow content
                }}
            >
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
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
                            <Typography variant="h6" component="h5">
                                Application Workflow
                            </Typography>
                        </Grid>
                        <Divider />
                        <Grid sx={{ display: "flex", justifyContent: "center" }}>
                            <Grid>
                                <Stepper orientation="vertical">
                                    {workflowSteps.map((step, index) => (
                                        <Step key={index} active>
                                            <StepLabel StepIconComponent={() => getStepIcon(step.applicationAction)}>
                                                <Typography variant="body1">{step.flowName}</Typography>
                                            </StepLabel>
                                            <StepContent>
                                                {step.remark !== "-" && (
                                                    <>
                                                        {step.remark.length > 40 ? (
                                                            <Typography variant="body1">
                                                                {truncatedRemark(step.remark)}
                                                                <Tooltip
                                                                    title={step.remark}
                                                                    sx={{
                                                                        "& .css-ja5taz-MuiTooltip-tooltip": {
                                                                            backgroundColor: "white", // Adjust background color as needed
                                                                            color: "grey", // Adjust text color as needed
                                                                            fontSize: "16px",
                                                                            borderRadius: "8px",
                                                                        },
                                                                    }}
                                                                >
                                                                    <IconButton>
                                                                        <More />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="body2">{step.remark}</Typography>
                                                        )}
                                                    </>
                                                )}
                                                {/* <Typography variant="body1">{step.remark}</Typography> */}
                                                <Typography variant="caption" color="textSecondary">
                                                    {step.updatedDate}
                                                </Typography>
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Modal>
    );
};
export default ApplicationWorkflow;
