import React from "react";
import { useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { labels } from "../../lang/labels";
import DashBoardContainer from "../layout/dashboard-container";
import LanguageSelector from "../form-fields/language-selector";
import { useSelector } from "react-redux";
const TransferResult = () => {
  const location = useLocation();
  const tableData = location.state?.tableData || [];
  const lang = useSelector((state) => state.userDetails.lang);

  return (
    <DashBoardContainer>
      <LanguageSelector />
      <Box sx={{ p: 3, mt: 2 }}>
        <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {labels.SNo[lang]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {" "}
                  {labels.OwnerName[lang]}
                  {/* <strong>Owner Name</strong> */}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {labels.mobileNo[lang]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {" "}
                  {labels.ApplicationNo[lang]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {" "}
                  {labels.trackingId[lang]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                >
                  {" "}
                  {labels.status[lang]}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ "& td": { border: "1px solid #ddd" } }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{row.ownerName}</TableCell>
                  <TableCell align="center">{row.mobileNo}</TableCell>
                  <TableCell align="center">{row.applicationNo}</TableCell>
                  <TableCell align="center">{row.trackingId}</TableCell>
                  <TableCell align="center">{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashBoardContainer>
  );
};
export default TransferResult;
