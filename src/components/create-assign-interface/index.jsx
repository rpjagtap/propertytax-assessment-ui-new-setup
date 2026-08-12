import React, { useState, useEffect } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";

import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  Box,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

import {
  Dns,
  Person4Outlined,
  CheckCircle,
  Cancel,
  EditOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import FormButtons from "../common/buttons";
import { RenderTableHead } from "../common/table";
import { labels } from "../../lang/labels";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import useApiState from "../common/useApiState";

// Using the same live services as CreateAssignInterface.
import {
  getAllProfile,
  createassignInterface,
} from "../../services/assessment-services";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const CreateInterfaceMaster = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading } = useApiState();
  const [profiles, setProfiles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const initialState = {
    interfaceId: "",
    nameEnglish: "",
    nameMarathi: "",
    fromName: "",
    profileIds: [],
    isActive: true,
  };

  const formik = useFormik({
    initialValues: initialState,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {},
  });

  const selectedProfiles = profiles.filter((p) =>
    (formik.values.profileIds || []).map(String).includes(String(p.value)),
  );

  const toggleProfile = (value) => {
    const current = (formik.values.profileIds || []).map(String);
    const asStr = String(value);
    const next = current.includes(asStr)
      ? current.filter((v) => v !== asStr)
      : [...current, asStr];
    formik.setFieldValue("profileIds", next);
  };

  const resetForm = () => {
    formik.resetForm();
    setFilteredData([]);
    setIsEditMode(false);
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await getAllProfile();

        const formatted = (res || []).map((item) => ({
          label: item.label,
          value: item.value,
        }));

        setProfiles(formatted);
      } catch (err) {
        console.error("Error loading profiles:", err);
      }
    };
    loadProfiles();
  }, []);

  const isSubmitDisabled =
    !formik.values.interfaceId?.trim() ||
    !formik.values.nameEnglish?.trim() ||
    !formik.values.nameMarathi?.trim() ||
    !(formik.values.profileIds || []).length;

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = formik.values;
      const body = {
        interfaceId: values.interfaceId,
        enDisplayName: values.nameEnglish,
        mrDisplayName: values.nameMarathi,
        formName: values.fromName,
        leafNode: values.isActive ? "Y" : "N",
        profileDetailsRO: (values.profileIds || []).map((profileId) => ({
          profileId: Number(profileId),
        })),
      };

      //console.log("API Request Body:", body);
      await createassignInterface(body);
      showToastSuccess("Saved Successfully!");
      resetForm();
    } catch (err) {
      showToastError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashBoardContainer>
      <ScrollBottom />
      <ScrollTop />

      <FormikProvider value={formik}>
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            mt: 2,
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(90deg, #12233F 0%, #1B3A63 100%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#5DCAA5",
                fontWeight: 600,
              }}
            >
              {initials(formik.values.nameEnglish) || <Dns />}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                Create / Assign Interface
              </Typography>

              <Typography
                sx={{
                  color: "#B8C4D6",
                  fontSize: 13,
                }}
              >
                {isEditMode
                  ? "Update interface names or profile access below."
                  : "Enter the interface details and select which profiles can access it."}
              </Typography>
            </Box>

            <Chip
              icon={
                formik.values.isActive ? (
                  <CheckCircle
                    sx={{
                      color: "#0F6E56 !important",
                    }}
                  />
                ) : (
                  <Cancel
                    sx={{
                      color: "#993C1D !important",
                    }}
                  />
                )
              }
              label={formik.values.isActive ? "Active" : "Inactive"}
              sx={{
                bgcolor: formik.values.isActive ? "#E1F5EE" : "#FAECE7",

                color: formik.values.isActive ? "#0F6E56" : "#993C1D",

                fontWeight: 600,
              }}
            />
          </Box>

          <CardContent
            sx={{
              px: 3,
              py: 3,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardHeader
                    avatar={
                      <Dns
                        sx={{
                          color: "text.secondary",
                        }}
                      />
                    }
                    title="Interface details"
                    titleTypographyProps={{
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                    sx={{
                      pb: 0,
                    }}
                  />

                  <CardContent>
                    <GridRow>
                      <FormLabel label="Interface Id" required />
                      <FormValue component={<TextInput name="interfaceId" />} />
                      <FormLabel label="From Name" required />
                      <FormValue component={<TextInput name="fromName" />} />
                    </GridRow>

                    <GridRow>
                      <FormLabel label="Name (English)" required />
                      <FormValue component={<TextInput name="nameEnglish" />} />
                      <FormLabel label="Name (Marathi)" required />
                      <FormValue component={<TextInput name="nameMarathi" />} />
                    </GridRow>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardHeader
                    avatar={
                      <Person4Outlined
                        sx={{
                          color: "text.secondary",
                        }}
                      />
                    }
                    title="Profile access"
                    titleTypographyProps={{
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                    subheader={
                      profiles.length
                        ? "Select every profile that should be able to use this interface"
                        : "Loading profiles…"
                    }
                    sx={{
                      pb: 0,
                    }}
                  />

                  <CardContent>
                    <FormGroup
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "1fr 1fr 1fr",
                        },
                        columnGap: 2,
                        rowGap: 0.5,
                      }}
                    >
                      {profiles.map((p) => (
                        <FormControlLabel
                          key={p.value}
                          control={
                            <Checkbox
                              size="small"
                              checked={(formik.values.profileIds || [])
                                .map(String)
                                .includes(String(p.value))}
                              onChange={() => toggleProfile(p.value)}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontSize: 14,
                              }}
                            >
                              {p.label}
                            </Typography>
                          }
                        />
                      ))}
                    </FormGroup>

                    {/* Selected Profiles */}

                    {!!selectedProfiles.length && (
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{
                          mt: 2,
                          rowGap: 1,
                        }}
                      >
                        {selectedProfiles.map((p) => (
                          <Chip
                            key={p.value}
                            size="small"
                            icon={
                              <VerifiedUserOutlined
                                sx={{
                                  fontSize: 16,
                                }}
                              />
                            }
                            label={p.label}
                            onDelete={() => toggleProfile(p.value)}
                            sx={{
                              bgcolor: "#E1F5EE",
                              color: "#0F6E56",
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider
              sx={{
                my: 3,
              }}
            />

            <Grid container justifyContent="center">
              <Grid item md={4} p={0}>
                <FormButtons
                  isValid={isSubmitDisabled}
                  handleSubmitButtonClick={handleSave}
                  resetForm={resetForm}
                  submitBtnLabel={isEditMode ? "Update" : "Save"}
                  isSubmitIcon={false}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </FormikProvider>

      {showTable && (
        <Paper
          elevation={3}
          sx={{
            width: "60%",
            margin: "0 auto",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table
              sx={{
                minWidth: 500,
              }}
              size="small"
            >
              <RenderTableHead
                thSx={{
                  bgcolor: "#12233F",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
                trSx={{
                  "& th": {
                    padding: "10px 12px",
                  },
                }}
                cells={[
                  "Interface Id",
                  "Name (English)",
                  labels.Edit?.[lang] || "Edit",
                ]}
              />

              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length ? (
                  filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        "& td": {
                          padding: "8px 12px",
                          fontSize: "13px",
                        },
                      }}
                    >
                      <TableCell align="left">
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              bgcolor: "#E1F5EE",
                              color: "#0F6E56",
                            }}
                          >
                            {initials(item.userName)}
                          </Avatar>

                          <span>{item.userCode}</span>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">{item.userName}</TableCell>

                      <TableCell align="center">
                        <Tooltip title="Edit interface">
                          <IconButton
                            size="small"
                            //onClick={() => handleEdit(item)}
                            sx={{
                              color: "#12233F",
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(CreateInterfaceMaster);
