import React from "react";
import { Box, Link, Typography } from "@mui/material";

// Change these two values to your company name and website
const COMPANY_NAME = "tech9services";
const COMPANY_URL = "http://tech9services.com/";

const PoweredByFooter = () => (
  <Box
    component="footer"
    sx={{
      mt: "auto", // pushes the footer to the bottom on short pages
      py: 1.5,
      px: 2,
      textAlign: "center",
      borderTop: "1px solid #DDE3EC",
      bgcolor: "#FAFBFD",
      "@media print": { display: "none" }, // keep it out of printed letters / PDFs
    }}
  >
    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
      
      <Link
        href={COMPANY_URL}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{ fontWeight: 600, color: "#12233F" }}
      >
        :: Powered by{" "} {COMPANY_NAME} ::
      </Link>
    </Typography>
  </Box>
);

export default PoweredByFooter;