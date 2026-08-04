import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import LanguageSelector from "../form-fields/language-selector";
import { getUserDetails } from "../../utils/sessionUtils";

// Shared identity tokens — keep these in sync with the login page palette.
const palette = {
  navy: "#122340",
  navyDeep: "#0B1729",
  marigold: "#E8A33D",
};

const PCMCHeader = () => {
  const userDetails = getUserDetails();

  return (
    <Box
      sx={{
        // Flat two-stop navy instead of the three-stop blue gradient —
        // matches the login page identity panel, no blur/effects here
        // to keep the header cheap to render on every page.
        background: `linear-gradient(90deg, ${palette.navy} 0%, ${palette.navyDeep} 100%)`,
        borderBottom: `3px solid ${palette.marigold}`,
      }}
    >
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{
          padding: { xs: "10px 16px", md: "8px 24px" },
        }}
      >
        <Grid
          item
          xs={2}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <a href="/home">
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 1.5,
                p: 0.5,
                display: "inline-flex",
                lineHeight: 0,
              }}
            >
              <Box
                component="img"
                sx={{
                  width: { md: "78px", xs: "56px" },
                  height: { md: "58px", xs: "40px" },
                  display: "block",
                  objectFit: "contain",
                }}
                alt="PCMC"
                src="/pcmclogo.jpeg"
              />
            </Box>
          </a>
        </Grid>

        <Grid
          item
          xs={8}
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { md: "17px", sm: "15px", xs: "12.5px" },
              color: "#fff",
              lineHeight: { xs: 1.3, md: 1.5 },
            }}
          >
            पिंपरी चिंचवड महानगरपालिका, पिंपरी - ४११०१८
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: { md: "14px", sm: "13px", xs: "11px" },
              color: palette.marigold,
              lineHeight: { xs: 1.3, md: 1.5 },
              mt: 0.25,
            }}
          >
            कर संकलन विभाग
          </Typography>
        </Grid>

        <Grid
          item
          xs={2}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          {userDetails.userCode && userDetails.userName && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <LanguageSelector />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PCMCHeader;