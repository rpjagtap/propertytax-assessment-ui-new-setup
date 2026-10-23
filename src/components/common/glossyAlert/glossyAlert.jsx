import React from "react";
import { Dialog, Box, Typography, Button, Slide } from "@mui/material";
import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorredRounded";

/**
 * Reusable glossy validation alert.
 * Save as: src/components/common/glossyAlert.jsx
 *
 * Props: open, title, messages (string[]), buttonText, onClose
 */
const SlideUp = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
));

const GlossyAlert = ({ open, title, messages = [], buttonText = "OK", onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={SlideUp}
        keepMounted
        BackdropProps={{
            sx: {
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(15, 23, 42, 0.45)",
            },
        }}
        PaperProps={{
            sx: {
                borderRadius: 5,
                p: 4,
                minWidth: 340,
                maxWidth: 460,
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                background:
                    "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(235,245,255,0.85))",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow:
                    "0 25px 60px rgba(244, 63, 94, 0.30), inset 0 1px 0 rgba(255,255,255,0.9)",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "45%",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0))",
                    pointerEvents: "none",
                },
            },
        }}
    >
        <Box
            sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #ff6b6b, #f43f5e 55%, #be123c)",
                boxShadow:
                    "0 10px 25px rgba(244,63,94,0.55), inset 0 2px 4px rgba(255,255,255,0.6)",
                animation: "pulseGlow 1.8s ease-in-out infinite",
                "@keyframes pulseGlow": {
                    "0%,100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.08)" },
                },
            }}
        >
            <ReportGmailerrorredRoundedIcon sx={{ fontSize: 44, color: "#fff" }} />
        </Box>

        <Typography variant="h6" fontWeight={800} sx={{ color: "#1e293b", position: "relative" }}>
            {title}
        </Typography>

        <Box
            sx={{
                mt: 2,
                mb: 3,
                maxHeight: 220,
                overflowY: "auto",
                textAlign: "left",
                position: "relative",
            }}
        >
            {messages.map((msg, idx) => (
                <Box
                    key={idx}
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.2,
                        mb: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: 3,
                        background: "rgba(244,63,94,0.08)",
                        border: "1px solid rgba(244,63,94,0.18)",
                    }}
                >
                    <Box
                        sx={{
                            mt: "7px",
                            width: 8,
                            height: 8,
                            flexShrink: 0,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ff6b6b, #be123c)",
                            boxShadow: "0 0 8px rgba(244,63,94,0.7)",
                        }}
                    />
                    <Typography sx={{ color: "#475569", fontSize: 14.5 }}>{msg}</Typography>
                </Box>
            ))}
        </Box>

        <Button
            onClick={onClose}
            variant="contained"
            sx={{
                px: 5,
                py: 1.1,
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: 0.5,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow: "0 8px 20px rgba(59,130,246,0.45)",
                transition: "all .25s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 26px rgba(59,130,246,0.6)",
                    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                },
            }}
        >
            {buttonText}
        </Button>
    </Dialog>
);

export default GlossyAlert;
