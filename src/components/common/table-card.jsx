import React from "react";
import { Box, Paper } from "@mui/material";

/**
 * TableCard
 * ---------
 * Standard "padded card that holds a search bar / filters / pagination
 * and a table" shell, used across all dashboard list pages.
 *
 * Table styling itself (borders, header, zebra, hover) comes from the
 * MuiTableContainer / MuiTableHead / MuiTableRow / MuiTableCell
 * overrides in theme.js — so any <Table> placed inside this wrapper
 * automatically matches the rest of the app. This component only
 * handles the outer spacing so content doesn't sit flush against the
 * card edge.
 *
 * Usage:
 *   <TableCard>
 *     <SearchAndFilters .../>
 *     <TableContainer component={Paper} elevation={0}>
 *       <Table>...</Table>
 *     </TableContainer>
 *   </TableCard>
 */
const TableCard = ({ children, elevation = 2, sx = {} }) => {
  return (
    <Paper elevation={elevation} sx={{ borderRadius: "14px", ...sx }}>
      <Box sx={{ padding: { xs: "16px", md: "20px 24px" } }}>{children}</Box>
    </Paper>
  );
};

export default TableCard;