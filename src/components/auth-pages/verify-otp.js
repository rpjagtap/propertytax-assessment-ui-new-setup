import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import PCMCHeader from "../layout/pcmc-header";
import { validateOtp } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSession,
  getUserDetails,
  setSession,
} from "../../utils/sessionUtils";
import Loader from "../loader/loader";
import { getErrorMsg } from "../../utils/helpers";
import { errorMsg } from "../../utils/constants";
import { showToastError } from "../common/toastHelper";
import ResendOTPButton from "./resend-otp";
// Individual icon paths (not the @mui/icons-material barrel) — keeps the
// bundle lean regardless of tree-shaking config.
import CheckCircle from "@mui/icons-material/CheckCircle";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";

// Shared identity tokens — kept in sync with the login page and header.
const palette = {
  navy: "#122340",
  navyDeep: "#0B1729",
  marigold: "#E8A33D",
  teal: "#2F8F9D",
  paper: "#F7F7F5",
  ink: "#1F2430",
  inkMuted: "#6B7280",
};
const fontDisplay = "'Georgia', 'Iowan Old Style', 'Palatino Linotype', serif";
const fontBody =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userInfo = useSelector((state) => state.userDetails.userInfo);
  const [formData, setFormData] = useState({
    otp: "",
  });

  useEffect(() => {
    const userDetails = getUserDetails();
    if (!userInfo.userCode) {
      clearSession();
      navigate("/login");
    } else if (userDetails.otpverified) {
      navigate("/home");
    } else {
      setLoading(false);
    }
  }, [navigate, userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { otp } = formData;
    setLoading(true);
    // Here, you would call your API with the form data
    validateOtp(userInfo.userCode, otp)
      .then((data) => {
        setLoading(false);
        if (data?.otpverified) {
          const userDetails = getUserDetails();
          setSession({ ...userDetails, otpverified: true });
          dispatch({ type: "RESET_MENU" });
          navigate("/home");
        }
      })
      .catch((error) => {
        showToastError(getErrorMsg(error));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // if (loading) {
  //   return null; // Return null while checking user details
  // }

  const isVerifyOtpDisabled = !formData.otp;

  return (
    // Flex-column shell instead of a hardcoded "100vh - 64px" — adapts to
    // the header's actual rendered height (which varies by breakpoint),
    // which is what removes the stray scrollbar.
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {loading && <Loader message="Verifying OTP..." />}
      <PCMCHeader />

      <Box
        sx={{
          flex: 1,
          boxSizing: "border-box",
          bgcolor: palette.paper,
          backgroundImage: `radial-gradient(circle at 18% 20%, rgba(18,35,64,0.10) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(232,163,61,0.12) 0%, transparent 40%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, md: 4 },
          px: 2,
          fontFamily: fontBody,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow:
              "0 20px 60px -20px rgba(18,35,64,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Top identity strip — echoes the login page's navy panel in a
              condensed form, appropriate for a lighter single-step page. */}
          <Box
            sx={{
              backgroundImage: `linear-gradient(165deg, ${palette.navy} 0%, ${palette.navyDeep} 100%)`,
              color: "#fff",
              px: { xs: 3, md: 4 },
              py: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <ShieldOutlined sx={{ color: palette.marigold, fontSize: 28 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 500,
                  fontSize: 20,
                  lineHeight: 1.2,
                }}
              >
                Verify OTP
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.65)",
                  mt: 0.25,
                }}
              >
                One-time password sent to your registered mobile number
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                {error || errorMsg}
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  variant="outlined"
                  required
                  fullWidth
                  id="otp"
                  label="Enter OTP"
                  name="otp"
                  autoComplete="otp"
                  size="small"
                  value={formData.otp}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ShieldOutlined sx={{ color: palette.inkMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.5)",
                      "&.Mui-focused fieldset": { borderColor: palette.teal },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: palette.teal },
                  }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                gap={1.5}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isVerifyOtpDisabled}
                  endIcon={<CheckCircle />}
                  sx={{
                    bgcolor: palette.marigold,
                    color: palette.navyDeep,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 14.5,
                    borderRadius: 1.5,
                    px: 2.5,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#D8922E", boxShadow: "none" },
                    "&.Mui-disabled": { bgcolor: "#EFE3CB", color: "#A99566" },
                  }}
                >
                  Verify OTP
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    clearSession();
                    navigate("/login");
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: 14.5,
                    borderRadius: 1.5,
                    px: 2.5,
                    borderColor: "rgba(18,35,64,0.25)",
                    color: palette.ink,
                    "&:hover": {
                      borderColor: palette.navy,
                      bgcolor: "rgba(18,35,64,0.04)",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid item xs={12}>
                <ResendOTPButton />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VerifyOtp;