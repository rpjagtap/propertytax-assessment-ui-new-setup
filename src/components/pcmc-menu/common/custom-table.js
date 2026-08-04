import React from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { labels } from "../../../lang/labels";

const CustomTable = ({ tableRows, minWidth, tableHeaders }) => {
  const lang = useSelector((state) => state.userDetails.lang);

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: minWidth }} aria-label="simple table">
        <TableHead>
          <TableRow
            sx={{
              background: "#c0defb",
              "&:last-child td, &:last-child th": { border: 1 },
              border: 1,
            }}
          >
            {tableHeaders.map((header, index) => {
              return (
                <TableCell key={index} align="center">
                  {labels[header][lang]}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((item, index) => {
            return (
              <TableRow key={index}>
                <TableCell align="center" sx={{ border: 1 }}>
                  {index + 1}
                </TableCell>
                <TableCell align="center" sx={{ border: 1 }}>
                  {item.propertyCode || "-"}
                </TableCell>
                <TableCell align="center" sx={{ border: 1 }}>
                  {item.financialYear || "-"}
                </TableCell>
                <TableCell align="center" sx={{ border: 1 }}>
                  {item.billNo || "-"}
                </TableCell>
                <TableCell align="center" sx={{ border: 1 }}>
                  {item.balanceAmount || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
CustomTable.defaultProps = {
  tableHeaders: [],
  minWidth: 650,
  tableRows: [],
};
CustomTable.propTypes = {};

export default CustomTable;
