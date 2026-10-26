import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFormikContext, FieldArray } from "formik";
import {
  Avatar,
  Box,
  Button,
  Link,
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
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import SelectInput from "../form-fields/select-input";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import {
  getAssessmentDocuments,
  ViewProTransactionDoc,
} from "../../services/assessment-services";

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

const mimeFromName = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/pdf";
};

const base64ToBlob = (b64, type) => {
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type });
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

  // File names of files picked in THIS session (keyed by row index). Kept locally so
  // no extra field ends up inside the `documents` objects sent as `documentVOs`.
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

  // ---- Edit mode: preselect the dropdown for saved documents.
  // 1) if the row already has an id, make sure its type matches the option ids
  //    (e.g. "5" vs 5), otherwise the select shows blank
  // 2) if it has no id, match by name (ignoring case, spaces and file extension)
  useEffect(() => {
    if (!documents.length) return;
    const current = formik.values.documents || [];
    let changed = false;

    const clean = (v) =>
      String(v ?? "")
        .replace(/\.(pdf|jpe?g|png)$/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const next = current.map((doc) => {
      // 1) id already matches an option (same type or "5" vs 5): nothing to match by name
      if (doc.documentId !== "" && doc.documentId != null) {
        if (documents.some((d) => d.id === doc.documentId)) return doc;
        const loose = documents.find((d) => String(d.id) === String(doc.documentId));
        if (loose) {
          changed = true;
          return { ...doc, documentId: loose.id };
        }
        // otherwise the saved id is a transaction-document id (e.g. 634), not a
        // document-type id, so fall through and match by name
      }

      // 2) match by name
      if (!doc.documentName) return doc;
      const target = clean(doc.documentName);
      const match = documents.find(
        (d) =>
          clean(d.marDocumentName) === target ||
          clean(d.engDocumentName) === target ||
          clean(d.documentName) === target
      );
      if (!match) return doc;
      changed = true;
      return { ...doc, documentId: match.id };
    });

    if (changed) formik.setFieldValue("documents", next);
    // eslint-disable-next-line
  }, [documents, formik.values.documents]);

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const row = formik.values.documents?.[index] || {};
    const isSavedDoc = Boolean(row.transactionDocumentId); // came from the server

    if (!file) {
      // Picker cancelled. Never wipe a saved document because of that.
      if (isSavedDoc) return;
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
      // Saved document replaced with a new file -> tell the backend.
      // Rows that are not re-uploaded keep reuploaded = false and are sent as they are.
      if (isSavedDoc) {
        formik.setFieldValue(`documents[${index}].reuploaded`, true);
      }
      setFileNames((prev) => ({ ...prev, [index]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  // Opens the document in a new tab.
  // - file picked in this session: the base64 is in memory, so open it directly
  // - saved document: ask the server for it, same call the view page uses
  const handleView = async (doc, index) => {
    const win = window.open("", "_blank"); // opened inside the click so it isn't blocked
    try {
      let blob;
      if (fileNames[index]) {
        blob = base64ToBlob(doc.documentURLbase64, mimeFromName(fileNames[index]));
      } else {
        const response = await ViewProTransactionDoc(
          doc.documentName,
          doc.documentURLbase64
        );
        blob = new Blob([response], { type: response?.type || "application/pdf" });
      }
      const url = window.URL.createObjectURL(blob);
      if (win) win.location.href = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (win) win.close();
      showToastError(getErrorMsg(err));
    }
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
              {labels?.ChooseDocTypeAndAttach?.[lang] ||
                "Choose a document type and attach the file (PDF, JPG or PNG)"}
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
                  <TableCell sx={{ ...headCellSx, width: "38%" }}>
                    {labels?.DocumentDetails?.[lang] || "Document"}
                  </TableCell>
                  <TableCell sx={{ ...headCellSx, width: "38%" }}>File</TableCell>
                  <TableCell align="center" sx={{ ...headCellSx, width: "24%" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formik.values.documents.map((doc, index) => {
                  const hasFile = Boolean(doc.documentURLbase64);
                  // new file name, else the saved document's name, else a generic label
                  const fileLabel =
                    fileNames[index] || doc.documentName || (hasFile ? "File attached" : "");

                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{ "& td": { padding: "10px 12px", verticalAlign: "middle" } }}
                    >
                      {/* Document type */}
                      <TableCell>
                        {documents.length > 0 &&
                        doc.documentName &&
                        !documentOptions.some((o) => o.id === doc.documentId) ? (
                          // saved document whose name is not in the dropdown list
                          // (e.g. SR1, स्थळ पाहणी अहवाल): show it as read-only text
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
                            {doc.documentName}
                          </Typography>
                        ) : (
                          <SelectInput
                            name={`documents[${index}].documentId`}
                            options={documentOptions}
                          />
                        )}
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
                            <Link
                              component="button"
                              type="button"
                              underline="hover"
                              onClick={() => handleView(doc, index)}
                              title={fileLabel}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: 13,
                                fontWeight: 600,
                                color: MINT,
                              }}
                            >
                              <VisibilityOutlined sx={{ fontSize: 18 }} />
                              View document
                            </Link>
                          ) : (
                            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                              No file chosen
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* View / Remove */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
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
                        </Stack>
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