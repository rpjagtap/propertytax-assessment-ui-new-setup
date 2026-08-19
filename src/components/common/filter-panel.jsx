import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";

/**
 * FilterPanel
 * -----------
 * Standard "search / filter form" shell used across all dashboard
 * pages (Track Property Application, Transfer Dashboard, etc.).
 *
 * Replaces the old raw `<Paper elevation={4}><FormTitle .../>...</Paper>`
 * pattern with a consistent header + body + action-footer layout that
 * matches the app's navy/green theme.
 *
 * Usage:
 *   <FilterPanel title="Track Property Application" actions={<FormButtons .../>}>
 *     <GridRow>...</GridRow>
 *     <GridRow>...</GridRow>
 *   </FilterPanel>
 */
const FilterPanel = ({ title, subtitle, children, actions, sx = {} }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid #DDE3EC",
        boxShadow: "0 2px 10px rgba(18,35,63,0.06)",
        overflow: "hidden",
        marginBottom: "15px",
        ...sx,
      }}
    >
      {/* Header */}
      {title && (
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2,
            backgroundImage:
              "linear-gradient(180deg, #F6F8FB 0%, #EDF1F7 100%)",
            borderBottom: "1px solid #DDE3EC",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: "primary.main",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Body — the form fields */}
      <Box sx={{ px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 } }}>
        {children}
      </Box>

      {/* Footer — action buttons, visually separated */}
      {actions && (
        <>
          <Divider sx={{ borderColor: "#DDE3EC" }} />
          <Box
            sx={{
              px: { xs: 2.5, md: 3 },
              py: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              backgroundColor: "#FAFBFD",
            }}
          >
            {actions}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default FilterPanel;