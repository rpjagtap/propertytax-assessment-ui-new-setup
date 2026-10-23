import React, { useEffect, useState } from "react";
import { Dialog, Box, Typography, Button, TextField, Slide } from "@mui/material";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { checkText } from "../formValidation/formValidation";

/**
 * Glossy "Reject application" dialog that asks for a reject remark.
 * Save as: src/components/common/rejectDialog/rejectDialog.jsx
 *
 * Props:
 *  open      : boolean
 *  onClose   : () => void                     (Cancel / click outside)
 *  onConfirm : (remark: string) => void|Promise  (called only when the remark is valid)
 *  title     : string (optional)
 */
const SlideUp = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
));

const RejectDialog = ({ open, onClose, onConfirm, title = "Reject application" }) => {
    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // start fresh every time the dialog opens
    useEffect(() => {
        if (open) {
            setRemark("");
            setError("");
            setBusy(false);
        }
    }, [open]);

    const handleChange = (e) => {
        setRemark(e.target.value.replace(/^\s+/, "")); // no leading spaces
        if (error) setError("");
    };

    const handleConfirm = async () => {
        const err = checkText(remark, "Reject remark", 3);
        if (err) {
            setError(err);
            return;
        }
        try {
            setBusy(true);
            await onConfirm(remark.trim());
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onClose}
            TransitionComponent={SlideUp}
            BackdropProps={{
                sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(15, 23, 42, 0.45)" },
            }}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    p: 4,
                    width: 460,
                    maxWidth: "92vw",
                    textAlign: "center",
                    overflow: "hidden",
                    position: "relative",
                    background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,240,242,0.88))",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 25px 60px rgba(244, 63, 94, 0.30), inset 0 1px 0 rgba(255,255,255,0.9)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "40%",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0))",
                        pointerEvents: "none",
                    },
                },
            }}
        >
            <Box
                sx={{
                    width: 68,
                    height: 68,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #ff6b6b, #f43f5e 55%, #be123c)",
                    boxShadow: "0 10px 25px rgba(244,63,94,0.55), inset 0 2px 4px rgba(255,255,255,0.6)",
                }}
            >
                <BlockRoundedIcon sx={{ fontSize: 38, color: "#fff" }} />
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ color: "#1e293b", position: "relative" }}>
                {title}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: 14, mt: 0.5, mb: 2, position: "relative" }}>
                Please enter the reason for rejecting this application.
            </Typography>

            <TextField
                autoFocus
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                label="Reject remark"
                value={remark}
                onChange={handleChange}
                error={Boolean(error)}
                helperText={error || " "}
                inputProps={{ maxLength: 500 }}
                sx={{ position: "relative", textAlign: "left", mb: 1 }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", position: "relative" }}>
                <Button
                    onClick={onClose}
                    disabled={busy}
                    variant="outlined"
                    sx={{
                        px: 4,
                        borderRadius: 10,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#94a3b8",
                        color: "#475569",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={busy}
                    variant="contained"
                    sx={{
                        px: 4,
                        borderRadius: 10,
                        textTransform: "none",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #f43f5e, #be123c)",
                        boxShadow: "0 8px 20px rgba(244,63,94,0.45)",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 26px rgba(244,63,94,0.6)",
                            background: "linear-gradient(135deg, #e11d48, #9f1239)",
                        },
                    }}
                >
                    {busy ? "Rejecting..." : "Reject"}
                </Button>
            </Box>
        </Dialog>
    );
};

export default RejectDialog;