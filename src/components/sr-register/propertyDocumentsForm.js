import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFormikContext, FieldArray } from "formik";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import AttachFileOutlined from "@mui/icons-material/AttachFileOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import SelectInput from "../form-fields/select-input";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import { getAssessmentDocuments } from "../../services/assessment-services";

// Theme tokens — same values used across the other redesigned pages.
const NAVY = "#12233F";
const NAVY_LIGHT = "#1B3A63";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

const headCellSx = {
  bgcolor: NAVY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

/**
 * `showHeader` — set to false when this form is already rendered inside a
 * card that has its own "Document details" header (e.g. the address-change
 * application page), so the title isn't shown twice.
 */
const PropertyDocumentsForm = ({ showHeader = true }) => {
  const formik = useFormikContext();
  const lang = useSelector((state) => state.userDetails?.lang);
  const { setLoading } = useApiState();
  const [documents, setDocuments] = useState([]);

  // File names are kept locally (keyed by row index) rather than in
  // Formik, so no extra field ends up inside the `documents` objects that
  // are sent to the backend as `documentVOs`.
  const [fileNames, setFileNames] = useState({});

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
        const documentRes = await getAssessmentDocuments();
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

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];

    if (!file) {
      // File picker was cancelled/cleared — drop any previously stored file.
      formik.setFieldValue(`documents[${index}].documentURLbase64`, "");
      setFileNames((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1]; // remove data-URL prefix
      formik.setFieldValue(`documents[${index}].documentURLbase64`, base64String);
      setFileNames((prev) => ({ ...prev, [index]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  // Removes a row and shifts the stored file names down so each name still
  // lines up with the right row.
  const handleRemove = (index, remove) => {
    remove(index);
    setFileNames((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        const i = Number(key);
        if (i < index) next[i] = prev[i];
        else if (i > index) next[i - 1] = prev[i];
      });
      return next;
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {showHeader && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: MINT_BG, color: MINT }}>
            <DescriptionOutlined fontSize="small" />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: NAVY }}>
              {labels?.DocumentDetails?.[lang] || "Document Details"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Choose a document type and attach the file (PDF, JPG or PNG)
            </Typography>
          </Box>
        </Stack>
      )}

      <FieldArray name="documents">
        {({ push, remove }) => (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              width: "100%",
              overflowX: "auto",
              border: "1px solid #DDE3EC",
              borderRadius: 2,
            }}
          >
            <Table sx={{ width: "100%", minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headCellSx, width: "40%" }}>
                    {labels?.DocumentDetails?.[lang] || "Document"}
                  </TableCell>
                  <TableCell sx={{ ...headCellSx, width: "40%" }}>File</TableCell>
                  <TableCell align="center" sx={{ ...headCellSx, width: "20%" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formik.values.documents.map((doc, index) => {
                  const hasFile = Boolean(doc.documentURLbase64);
                  const fileLabel = fileNames[index] || (hasFile ? "File attached" : "");

                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{ "& td": { padding: "10px 12px", verticalAlign: "middle" } }}
                    >
                      {/* Document type */}
                      <TableCell>
                        <SelectInput
                          name={`documents[${index}].documentId`}
                          options={documentOptions}
                        />
                      </TableCell>

                      {/* File upload */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadOutlined />}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              borderColor: NAVY,
                              color: NAVY,
                              "&:hover": { borderColor: NAVY_LIGHT, bgcolor: "rgba(18,35,63,0.04)" },
                            }}
                          >
                            {hasFile ? "Change file" : "Choose file"}
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, index)}
                            />
                          </Button>

                          {hasFile ? (
                            <Chip
                              size="small"
                              icon={<AttachFileOutlined sx={{ color: `${MINT} !important` }} />}
                              label={fileLabel}
                              sx={{
                                bgcolor: MINT_BG,
                                color: MINT,
                                fontWeight: 600,
                                maxWidth: 200,
                              }}
                            />
                          ) : (
                            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                              No file chosen
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Remove */}
                      <TableCell align="center">
                        {formik.values.documents.length > 1 && (
                          <Button
                            onClick={() => handleRemove(index, remove)}
                            color="error"
                            size="small"
                            startIcon={<RemoveCircleOutline />}
                            sx={{ textTransform: "none" }}
                          >
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Add More row — part of the table, like the original */}
                <TableRow>
                  <TableCell colSpan={3} sx={{ padding: "10px 12px", bgcolor: "#FAFBFD" }}>
                    <Button
                      onClick={() =>
                        push({
                          documentId: "",
                          documentURLbase64: "",
                        })
                      }
                      startIcon={<AddCircleOutline />}
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        bgcolor: NAVY,
                        "&:hover": { bgcolor: NAVY_LIGHT },
                      }}
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
    </Box>
  );
};

export default PropertyDocumentsForm;