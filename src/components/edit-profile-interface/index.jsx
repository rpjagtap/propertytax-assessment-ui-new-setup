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
import FormButtons from "../common/buttons";
import { RenderTableHead } from "../common/table";
import { labels } from "../../lang/labels";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import useApiState from "../common/useApiState";

import {
  getAllProfile,
  editProfileInterface,
  saveProfileInterface
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
  const [profiles, setProfiles] = useState([]);
  const [interfaceOptions, setInterfaceOptions] = useState([]);
  const [interfacesLoading, setInterfacesLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const initialState = {
    profileId: "",
    interfaceIds: [],
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
        profileId: Number(profileId),
        interfaceId: item.interfaceId,
        formName: item.formName,
        enDisplayName: item.enDisplayName,
        mrDisplayName: item.mrDisplayName,
        isSelect: !!item.isSelect,
        menuDetailsRO: item.menuDetailsRO || [],
        valid: item.valid ?? false,
        otpverified: item.otpverified ?? false,
        label: item.enDisplayName,
        value: item.interfaceId,
      }));

      setInterfaceOptions(formatted);

      const selectedIds = formatted
        .filter((item) => item.isSelect)
        .map((item) => String(item.interfaceId));

      formik.setFieldValue("interfaceIds", selectedIds);
    } catch (err) {
      showToastError(getErrorMsg(err));
      setInterfaceOptions([]);
      formik.setFieldValue("interfaceIds", []);
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
      const selectedIds = (values.interfaceIds || []).map(String);
      const interfaceList = (interfaceOptions || []).map((item) => ({
        profileId: Number(values.profileId),
        interfaceId: item.interfaceId,
        formName: item.formName,
        enDisplayName: item.enDisplayName,
        mrDisplayName: item.mrDisplayName,
        isSelect: selectedIds.includes(String(item.interfaceId)),
        menuDetailsRO: [],
        valid: item.valid ?? false,
        otpverified: item.otpverified ?? false,
      }));

      const body = {
        lst: interfaceList,
        menuDetailsRO: [],
        valid: false,
        otpverified: false,
      };
      await saveProfileInterface(body);
      showToastSuccess("Saved Successfully!");
      resetForm();
      setInterfaceOptions([]);
    } catch (err) {
      console.error("Save Error:", err);
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
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, height: "100%" }}
                >
                  <CardHeader
                    avatar={
                      <Person4Outlined sx={{ color: "text.secondary" }} />
                    }
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
                                <em
                                  style={{
                                    color: "#9aa5b1",
                                    fontStyle: "normal",
                                  }}
                                >
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
                      {interfaceOptions.map((item) => {
                        const checked = (
                          formik.values.interfaceIds || []
                        ).includes(String(item.interfaceId));

                        return (
                          <FormControlLabel
                            key={item.interfaceId}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;

                                  const currentIds =
                                    formik.values.interfaceIds || [];

                                  let updatedIds;

                                  if (isChecked) {
                                    updatedIds = [
                                      ...currentIds,
                                      String(item.interfaceId),
                                    ];
                                  } else {
                                    updatedIds = currentIds.filter(
                                      (id) =>
                                        String(id) !== String(item.interfaceId),
                                    );
                                  }

                                  formik.setFieldValue(
                                    "interfaceIds",
                                    updatedIds,
                                  );
                                }}
                              />
                            }
                            label={item.enDisplayName}
                          />
                        );
                      })}
                    </FormGroup>

                    {!formik.values.profileId && (
                      <Typography
                        sx={{ fontSize: 13, color: "text.secondary", mt: 1 }}
                      >
                        Interface options will appear here once a profile is
                        selected.
                      </Typography>
                    )}

                    {!!selectedInterfaces.length && (
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ mt: 2, rowGap: 1 }}
                      >
                        {selectedInterfaces.map((opt) => (
                          <Chip
                            key={opt.value}
                            size="small"
                            icon={
                              <VerifiedUserOutlined sx={{ fontSize: 16 }} />
                            }
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
          sx={{
            width: "60%",
            margin: "0 auto",
            borderRadius: 3,
            overflow: "hidden",
          }}
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
                      sx={{ "& td": { padding: "8px 12px", fontSize: "13px" } }}
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