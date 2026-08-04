import React, { useMemo, useState, useEffect } from "react";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import SelectInput from "../form-fields/select-input";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { useFormikContext, FieldArray } from "formik";
import { getAssessmentDocuments } from "../../services/assessment-services";
import { Add, RemoveCircleTwoTone } from "@mui/icons-material";
import FormTitle from "../form-fields/form-title";
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";

const PropertyDocumentsForm = () => {
  const formik = useFormikContext();
  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading } = useApiState();
  const [documents, setDocuments] = useState([]);
  const { setFieldValue } = useFormikContext();
  const [rows, setRows] = useState([
    {
      useType: "",
      subUseType: "",
      constructionType: "",
      occuapncy: "",
      specialOccupant: "",
      assessmentDate: "",
      area: "",
      rateableValue: "",
      toiletFlag: false,
      permission: false,
    },
  ]);

  useEffect(() => {
    // Every time rows change, sync to Formik
    setFieldValue("propertyTransactionDetailsVO", rows);
  }, [rows, setFieldValue]);


  const documentOptions = useMemo(
    () =>
      documents.map((item) => ({
        id: item.id,
        label: item.marDocumentName,
      })),
    [documents]
  );

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [documentRes] = await Promise.all([getAssessmentDocuments()]);
        if (!mounted) return;
        setDocuments(documentRes || []);
      } catch (err) {
        showToastError(getErrorMsg(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [setLoading]);

  return (
    <>
      {/* <b>Documents Details</b> */}
      {/* <FormTitle title={labels.DocumentDetails[lang]} /> */}

      <Box
        sx={{
          //minHeight: "100vh",
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          margin: 5,
          borderRadius: 4,
          minHeight: "auto",
          width: "100%",
          p: { xs: 1, md: 3 },
          mt: 2,
        }}
      >
        <Box sx={{ "width": "100%" }}>
          <Paper
            sx={{
              width: "100%",
              p: { xs: 2, md: 4 },
              borderRadius: 4,
            }}
          >
            {/* <Typography
              variant="h5"
              fontWeight="bolder"
              align="center"
              paddingBottom={2}
              paddingTop={2}
            >
              {labels?.DocumentDetails?.[lang] || ""}
            </Typography> */}
            <Grid alignItems="flex-start" justifyContent="flex-start">

              <FieldArray name="documents">
                {({ push, remove }) => (
                  <TableContainer
                    component={Paper}
                    sx={{
                      width: "100%",
                      overflowX: "auto",
                    }}
                  >


                    <Table
                      sx={{
                        width: "100%",
                        tableLayout: "fixed",
                        border: 1,
                        borderColor: "grey.300",
                        mt: 2,
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#abd9e3", fontWeight: 600 }}>
                          <TableCell>{labels.DocumentDetails[lang]}</TableCell>
                          <TableCell align="center">&nbsp;</TableCell>
                          <TableCell align="center">&nbsp;</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formik.values.documents.map((doc, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "& td": { border: "1px solid grey" },
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {/* Document Dropdown */}
                            <TableCell>
                              <SelectInput
                                name={`documents[${index}].documentId`}
                                options={documentOptions}
                                variant="standard"
                              />
                            </TableCell>

                            {/* File Upload */}
                            <TableCell align="center">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{
                                  width: "100%",
                                  maxWidth: "220px",
                                }}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result.split(",")[1]; // 👈 remove prefix
                                      formik.setFieldValue(
                                        `documents[${index}].documentURLbase64`,
                                        base64String
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </TableCell>

                            {/* Remove Button */}
                            <TableCell align="center">
                              {formik.values.documents.length > 1 && (
                                <Button
                                  onClick={() => remove(index)}
                                  color="error"
                                  endIcon={<RemoveCircleTwoTone />}
                                >
                                  Remove
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Add More Row */}
                        <TableRow>
                          <TableCell colSpan={3} align="left">
                            <Button
                              onClick={() =>
                                push({
                                  documentId: "",
                                  documentURLbase64: "",
                                })
                              }
                              startIcon={<Add />}
                              variant="contained"
                              color="primary"
                            >
                              Add More
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </FieldArray>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PropertyDocumentsForm;