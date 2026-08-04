import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PCMCHeader from "../layout/pcmc-header";
import { validateUser } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserDetails, setSession } from "../../utils/sessionUtils";
import Loader from "../loader/loader";
import { getErrorMsg } from "../../utils/helpers";
import { errorMsg } from "../../utils/constants";
import { showToastError, showToastSuccess } from "../common/toastHelper";
// Individual icon paths instead of the @mui/icons-material barrel — keeps the
// bundle from pulling in the whole icon package regardless of tree-shaking config.
import LoginOutlined from "@mui/icons-material/LoginOutlined";
import Replay from "@mui/icons-material/Replay";

// ---- Visual tokens (civic identity: navy + marigold + teal) ----
const palette = {
  navy: "#122340",
  navyDeep: "#0B1729",
  marigold: "#E8A33D",
  teal: "#2F8F9D",
  paper: "#F7F7F5",
  ink: "#1F2430",
  inkMuted: "#6B7280",
  line: "rgba(255,255,255,0.14)",
};

// System font stacks — zero network requests, no FOUT/FOIT, renders instantly.
// Serif stack approximates the Fraunces feel for the heading; sans stack is
// the standard fast UI stack for everything else.
const fontDisplay =
  "'Georgia', 'Iowan Old Style', 'Palatino Linotype', serif";
const fontBody =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Abstracted skyline / infrastructure line motif — the page's signature element
const SkylineMark = () => (
  <svg
    width="100%"
    height="120"
    viewBox="0 0 400 120"
    preserveAspectRatio="none"
    style={{ display: "block" }}
  >
    <polyline
      points="0,120 0,70 30,70 30,40 60,40 60,85 95,85 95,20 130,20 130,60 165,60 165,45 200,45 200,90 235,90 235,30 270,30 270,65 305,65 305,50 340,50 340,95 375,95 375,10 400,10 400,120"
      fill="none"
      stroke={palette.marigold}
      strokeWidth="1.5"
      opacity="0.85"
    />
    <polyline
      points="0,120 0,95 40,95 40,105 80,105 80,75 120,75 120,100 160,100 160,88 200,88 200,110 240,110 240,80 280,80 280,102 320,102 320,92 360,92 360,120"
      fill="none"
      stroke={palette.teal}
      strokeWidth="1.5"
      opacity="0.6"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // useEffect(() => {
  //   dispatch({ type: "RESET" });
  // }, [dispatch]);

  useEffect(() => {
    const userDetails = getUserDetails();
    if (userDetails?.otpverified) {
      setInitialLoad(false);
      navigate("/home");
    } else {
      setInitialLoad(false);
      setLoading(false);
    }
  }, [navigate]);

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
    const { username, password } = formData;
    setLoading(true);
    // Here, you would call your API with the form data
    validateUser(username, password)
      .then((data) => {
        // if (data?.valid) {
        showToastSuccess();
        dispatch({
          type: "SET_USER_INFO",
          payload: data,
        });

        const {
          userId,
          userCode,
          userName,
          zoneKey,
          gatKey,
          counterKey,
          emailAddress,
          mobileNumber,
          profileId,
          profileName,
          prabhag,
        } = data;
        const sessionData = {
          userId,
          userCode,
          userName,
          zoneKey,
          gatKey,
          counterKey,
          emailAddress,
          mobileNumber,
          profileId,
          profileName,
          prabhag,
        };
        setSession(sessionData);
        navigate("/verify-otp");
        // }
      })
      .catch((error) => {
        // setError(getErrorMsg(error));
        showToastError(getErrorMsg(error));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (initialLoad) {
    return null; // Return null while checking user details
  }

  const isSignInDisabled = !formData.username || !formData.password;

  return (
    // Flex-column shell instead of a hardcoded "100vh - 64px" — the content
    // box below fills exactly whatever space is left after the header,
    // whatever the header's real rendered height turns out to be (it varies
    // by breakpoint since the header text wraps on mobile). This is what
    // avoids the stray scrollbar.
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <PCMCHeader />
      {loading && <Loader message="Verifying User..." />}

      <Box
        sx={{
          flex: 1,
          boxSizing: "border-box",
          bgcolor: palette.paper,
          // Soft CSS-only glow (no image requests) so the glass card has
          // something diffuse to catch behind it.
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
            maxWidth: 920,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            // Frosted-glass shell: translucent surface + backdrop blur lets the
            // page glow show through the edges; border/shadow give it depth
            // instead of a flat drop shadow.
            bgcolor: "rgba(255,255,255,0.62)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow:
              "0 20px 60px -20px rgba(18,35,64,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Left identity panel */}
          <Box
            sx={{
              flexBasis: { md: "42%" },
              // Glass over navy: semi-transparent gradient + blur so the panel
              // reads as frosted rather than a flat opaque fill.
              backgroundImage: `linear-gradient(165deg, rgba(18,35,64,0.88) 0%, rgba(11,23,41,0.92) 100%)`,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#fff",
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: 160, md: 480 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: fontBody,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: palette.marigold,
                  textTransform: "uppercase",
                }}
              >
                PCMC Staff Portal
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 600,
                  fontSize: { xs: 26, md: 32 },
                  lineHeight: 1.15,
                  mt: 1.5,
                  maxWidth: 280,
                }}
              >
                Sign in to manage civic operations
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.65)",
                  mt: 1.5,
                  maxWidth: 280,
                  display: { xs: "none", md: "block" },
                }}
              >
                Authorized personnel access for zone, gat and counter
                administration.
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "block" },
                borderTop: `1px solid ${palette.line}`,
                pt: 2,
              }}
            >
              <SkylineMark />
            </Box>
          </Box>

          {/* Right form panel */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: 24,
                color: palette.ink,
              }}
            >
              Login
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: palette.inkMuted, mt: 0.5, mb: 3 }}>
              Enter your credentials to continue.
            </Typography>

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
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: palette.inkMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      "&.Mui-focused fieldset": { borderColor: palette.teal },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: palette.teal },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  value={formData.password}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: palette.inkMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20, color: palette.inkMuted }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20, color: palette.inkMuted }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      "&.Mui-focused fieldset": { borderColor: palette.teal },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: palette.teal },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSignInDisabled}
                  endIcon={<LoginOutlined />}
                  sx={{
                    bgcolor: palette.marigold,
                    color: palette.navyDeep,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 15,
                    borderRadius: 1.5,
                    py: 1.1,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#D8922E",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#EFE3CB",
                      color: "#A99566",
                    },
                  }}
                >
                  Sign In
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="reset"
                  fullWidth
                  variant="outlined"
                  endIcon={<Replay />}
                  onClick={() => {
                    setFormData({ username: "", password: "" });
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: 15,
                    borderRadius: 1.5,
                    py: 1.1,
                    borderColor: "rgba(18,35,64,0.25)",
                    color: palette.ink,
                    "&:hover": {
                      borderColor: palette.navy,
                      bgcolor: "rgba(18,35,64,0.04)",
                    },
                  }}
                >
                  Reset
                </Button>
              </Grid>

              {/* <Grid item xs={12}>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Grid> */}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;