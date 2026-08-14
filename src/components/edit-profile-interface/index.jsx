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
  FormControl,
  Select,
  MenuItem,
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
// TODO: confirm the exact exported name/signature of the "edit profile
// interface" service in your services file — adjust the import and the
// call inside loadInterfacesForProfile() below if it differs.
import {
  getAllProfile,
  createassignInterface,
  editProfileInterface,
} from "../../services/assessment-services";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const EditProfileInterface = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading } = useApiState();
  const [profiles, setProfiles] = useState([]); // dropdown options (from getAllProfile)
  const [interfaceOptions, setInterfaceOptions] = useState([]); // checkbox options (from editProfileInterface)
  const [interfacesLoading, setInterfacesLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const initialState = {
    profileId: "", // selected profile from the dropdown
    interfaceIds: [], // selected interface checkboxes for that profile
    isActive: true,
  };

  const formik = useFormik({
    initialValues: initialState,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {},
  });

  const selectedInterfaces = interfaceOptions.filter((opt) =>
    (formik.values.interfaceIds || []).map(String).includes(String(opt.value)),
  );

  const toggleInterface = (value) => {
    const current = (formik.values.interfaceIds || []).map(String);
    const asStr = String(value);
    const next = current.includes(asStr)
      ? current.filter((v) => v !== asStr)
      : [...current, asStr];
    formik.setFieldValue("interfaceIds", next);
  };

  const resetForm = () => {
    formik.resetForm();
    setInterfaceOptions([]);
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

  const loadInterfacesForProfile = async (profileId) => {
    if (!profileId) {
      setInterfaceOptions([]);
      formik.setFieldValue("interfaceIds", []);
      return;
    }
    try {
      setInterfacesLoading(true);
      const res = await editProfileInterface({ profileId });

      const list = Array.isArray(res) ? res : res?.lst || res?.data || [];
      const formatted = list.map((item) => ({
        label: item.label ?? item.nameEnglish ?? item.mrDisplayName,
        value: item.value ?? item.mrDisplayName,
        isSelect: !!item.isSelect,
      }));

      setInterfaceOptions(formatted);
      formik.setFieldValue(
        "interfaceIds",
        formatted.filter((item) => item.isSelect).map((item) => String(item.value)),
      );
    } catch (err) {
      showToastError(getErrorMsg(err));
      setInterfaceOptions([]);
    } finally {
      setInterfacesLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("profileId", value);
    loadInterfacesForProfile(value);
  };

  const isSubmitDisabled =
    !formik.values.profileId || !(formik.values.interfaceIds || []).length;

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = formik.values;
      const body = {
        profileId: values.profileId,
        leafNode: values.isActive ? "Y" : "N",
        // TODO: confirm the expected payload shape for saving the
        // profile -> interface assignment against the live endpoint.
        interfaceDetailsRO: (values.interfaceIds || []).map((interfaceId) => ({
          interfaceId,
        })),
      };

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
              <Dns />
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                Edit Profile Interface
              </Typography>

              <Typography
                sx={{
                  color: "#B8C4D6",
                  fontSize: 13,
                }}
              >
                Select a profile, then choose which interfaces it can access.
              </Typography>
            </Box>

            <Chip
              icon={
                formik.values.isActive ? (
                  <CheckCircle sx={{ color: "#0F6E56 !important" }} />
                ) : (
                  <Cancel sx={{ color: "#993C1D !important" }} />
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

          <CardContent sx={{ px: 3, py: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                  <CardHeader
                    avatar={<Person4Outlined sx={{ color: "text.secondary" }} />}
                    title="Profile access"
                    titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                    subheader={
                      !formik.values.profileId
                        ? "Select a profile to see and edit its interface access"
                        : interfacesLoading
                        ? "Loading interfaces…"
                        : "Tick every interface this profile should be able to use"
                    }
                    sx={{ pb: 0 }}
                  />

                  <CardContent>
                    <GridRow>
                      <FormLabel label="Profile" required />
                      <FormValue
                        component={
                          <FormControl fullWidth size="small">
                            <Select
                              displayEmpty
                              value={formik.values.profileId || ""}
                              onChange={handleProfileChange}
                            >
                              <MenuItem value="">
                                <em style={{ color: "#9aa5b1", fontStyle: "normal" }}>
                                  Select profile
                                </em>
                              </MenuItem>
                              {profiles.map((p) => (
                                <MenuItem key={p.value} value={p.value}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        }
                      />
                    </GridRow>

                    <Divider sx={{ my: 2 }} />

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
                      {interfaceOptions.map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              size="small"
                              checked={(formik.values.interfaceIds || [])
                                .map(String)
                                .includes(String(opt.value))}
                              onChange={() => toggleInterface(opt.value)}
                            />
                          }
                          label={<Typography sx={{ fontSize: 14 }}>{opt.label}</Typography>}
                        />
                      ))}
                    </FormGroup>

                    {!formik.values.profileId && (
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1 }}>
                        Interface options will appear here once a profile is selected.
                      </Typography>
                    )}

                    {!!selectedInterfaces.length && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, rowGap: 1 }}>
                        {selectedInterfaces.map((opt) => (
                          <Chip
                            key={opt.value}
                            size="small"
                            icon={<VerifiedUserOutlined sx={{ fontSize: 16 }} />}
                            label={opt.label}
                            onDelete={() => toggleInterface(opt.value)}
                            sx={{ bgcolor: "#E1F5EE", color: "#0F6E56" }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

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
          sx={{ width: "60%", margin: "0 auto", borderRadius: 3, overflow: "hidden" }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 500 }} size="small">
              <RenderTableHead
                thSx={{
                  bgcolor: "#12233F",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
                trSx={{ "& th": { padding: "10px 12px" } }}
                cells={["Interface Id", "Name (English)", labels.Edit?.[lang] || "Edit"]}
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
                      sx={{ "& td": { padding: "8px 12px", fontSize: "13px" } }}
                    >
                      <TableCell align="left">
                        <Stack direction="row" spacing={1.2} alignItems="center">
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
                          <IconButton size="small" sx={{ color: "#12233F" }}>
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

export default EditProfileInterface;