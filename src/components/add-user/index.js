import React, { useState, useEffect } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import SelectInput from "../form-fields/select-input";
import { MenuItem, TextField } from "@mui/material";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  Button,
  Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import FormTitle from "../form-fields/form-title";
import DateInput from "../form-fields/date-picker";
import TextInput from "../form-fields/text-input";
import FormButtons from "../common/buttons";
import { RenderTableHead } from "../common/table";
import { labels } from "../../lang/labels";
import { getCurrentDate, getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import {
  getAllProfile,
  getAllZone,
  getAllGatByZoneKey,
  getAddUser,
  validateUserApi,
  editUserApi,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import { trackApplicationSchema } from "../../utils/validation-schema";
const AddUser = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading } = useApiState();
  const [profiles, setProfiles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [editProfile, seteditProfile] = useState({});

  const initialState = {
    userCode: "",
    userName: "",
    employeeId: "",
    password: "",
    profileId: "",
    zoneKey: "",
    gatKey: "",
    emailAddress: "",
    mobileNumber: "",
    isActive: false,
  };

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: trackApplicationSchema, // Keep your validation
    enableReinitialize: true, // Important to avoid stiffness
    onSubmit: async (values, { resetForm }) => {},
  });

  const loadZones = async () => {
    try {
      const data = await getAllZone(); // API returns an array

      const formatted = data.map((z) => ({
        label: z.label, // Marathi zone name
        value: z.value, // zone key
      }));

      setZoneKeys(formatted);
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  const loadGatByZone = async (zoneKey) => {
    try {
      const res = await getAllGatByZoneKey({ zoneKey });

      const formatted =
        res?.gatLst?.map((item) => ({
          label: item.label,
          value: item.value,
        })) || [];

      setGatKeys(formatted);

      // Set the gatKey only after options are loaded
      if (editProfile?.gatKey) {
        formik.setFieldValue("gatKey", editProfile.gatKey);
      } else if (formatted.length === 1) {
        formik.setFieldValue("gatKey", formatted[0].value);
      }
    } catch (err) {
      console.error("Error loading gat keys:", err);
      setGatKeys([]);
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setFilteredData([]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Correct way to access formik values
      const values = formik.values;

      const body = {
        userName: values.userName,
        employeeId: values.employeeId,
        userCode: values.userCode,
        password: values.password,
        isActive: values.isActive ? "Y" : "N", // API expects Y/N
        zoneKey: values.zoneKey,
        gatKey: values.gatKey,
        profileId: values.profileId,
        emailAddress: values.emailAddress,
        mobileNumber: values.mobileNumber,
      };

      console.log("FINAL API BODY:", body);

      //  API CALL
      const res = await getAddUser(body);

      showToastSuccess("Saved Successfully!");

      // Reset form
      formik.resetForm();
    } catch (err) {
      showToastError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };
  const handleValidateUser = async () => {
    try {
      setLoading(true);

      const body = {
        userCode: formik.values.userCode, // Or any input field you are using
      };

      const res = await validateUserApi(body);

      // Response structure:
      // { lst: [{ userCode, userName, valid, otpverified }], valid, otpverified }

      setFilteredData(Array.isArray(res?.lst) ? res.lst : []);
      setShowTable(true);
    } catch (err) {
      showToastError(getErrorMsg(err));
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item) => {
    try {
      setLoading(true);

      const body = { userCode: item.userCode };
      const res = await editUserApi(body);
      seteditProfile(res);
      console.log("EDIT API RES:", res);
      await loadGatByZone(res.zoneKey);
      // Fill Formik values EXACTLY as per response

      const maskedPassword = "*".repeat(res.password?.length || 0);

      formik.setValues({
        userName: res.userName || "",
        employeeId: res.employeeId || "",
        userCode: res.userCode || "",
        password: maskedPassword,
        isActive: res.isActive === "Y" ? true : false,
        zoneKey: String(res.zoneKey) || "",
        gatKey: String(res.gatKey) || "",
        profileId: String(res.profileId) || "",
        emailAddress: res.emailAddress || "",
        mobileNumber: res.mobileNumber || "",
      });

      showToastSuccess("User data loaded for editing!");
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await getAllProfile();

        // API returns list → convert into label/value format
        const formatted = res?.map((item) => ({
          label: item.label, // what you want to display
          value: item.value, // id or key
        }));

        setProfiles(formatted);
      } catch (err) {
        console.error("Error loading profiles:", err);
      }
    };

    loadProfiles();
    loadZones();
  }, []);

  useEffect(() => {
    formik.setFieldValue("gatKey", "");
    setGatKeys([]);

    const loadGatData = async () => {
      try {
        setLoading(true);
        const res = await getAllGatByZoneKey({
          zoneKey: formik.values.zoneKey,
        });

        if (Array.isArray(res)) {
          setGatKeys(res);

          // Set the gatKey only after options are loaded
          if (editProfile?.gatKey) {
            formik.setFieldValue("gatKey", editProfile.gatKey);
          } else if (res.length === 1) {
            formik.setFieldValue("gatKey", res[0].value);
          }
        } else {
          console.error("Unexpected API:", res);
          setGatKeys([]);
        }
      } catch (error) {
        console.error(error);
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };

    if (formik.values.zoneKey) {
      loadGatData();
    }
  }, [formik.values.zoneKey]);

  return (
    <DashBoardContainer>
      <ScrollBottom />
      <ScrollTop />

      <FormikProvider value={formik}>
        <Paper
          elevation={4}
          sx={{
            marginBottom: "15px",
            paddingBottom: 2,
            marginTop: "10px",
          }}
        >
          <FormTitle title="Add User Form" sx={{ textAlign: "center" }} />

          <GridRow>
            <FormLabel label={labels.userCode[lang]} />
            <FormValue component={<TextInput name="userCode" />} />
            <div style={{ marginTop: "3px", textAlign: "center" }}>
              <button
                style={{
                  padding: "6px 15px",
                  marginRight: "10px",
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleValidateUser}
              >
                Validate
              </button>
            </div>
          </GridRow>

          <GridRow>
            <FormLabel label={labels.UserName[lang]} />
            <FormValue component={<TextInput name="userName" />} />

            <FormLabel label={labels.employeeID[lang]} />

            <FormValue component={<TextInput name="employeeId" />} />
          </GridRow>

          <GridRow>
            <FormLabel label={labels.password[lang]} required />
            <FormValue
              component={<TextInput type="password" name="password" />}
            />
            {/* <FormLabel label={labels.profile[lang]} /> */}
            {/* <FormValue component={<TextInput name="profileId" />} /> */}
            <FormLabel label={labels.profile[lang]} />
            <FormValue
              component={
                <SelectInput
                  //   onChange={loadZones}
                  name="profileId"
                  options={profiles} // <-- API dropdown data
                  onChange={(e) => {
                    const profileId = e.target.value;
                    formik.setFieldValue("profileId", profileId);
                  }}
                />
              }
            />
          </GridRow>

          <GridRow>
            <FormLabel label={labels.Zone[lang]} />
            <FormValue
              component={
                <SelectInput
                  name="zoneKey"
                  value={formik.values.zoneKey}
                  onChange={(e) => {
                    const zoneKey = e.target.value;
                    formik.setFieldValue("zoneKey", zoneKey);
                    loadGatByZone(zoneKey);
                  }}
                  options={zoneKeys}
                />
              }
            />
            <FormLabel label={labels.Gat[lang]} />
            <FormValue
              component={
                <SelectInput
                  name="gatKey"
                  value={formik.values.gatKey}
                  options={gatKeys}
                  onChange={(e) => {
                    formik.setFieldValue("gatKey", e.target.value);
                  }}
                />
              }
            />
          </GridRow>

          <GridRow>
            <FormLabel label={labels.Email[lang]} />
            <FormValue component={<TextInput name="emailAddress" />} />

            <FormLabel label={labels.mobileNo[lang]} />
            <FormValue component={<TextInput name="mobileNumber" />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.isActive[lang]} />
            <FormValue
              component={
                <Checkbox
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={(e) =>
                    formik.setFieldValue("isActive", e.target.checked)
                  }
                  sx={{
                    width: "20px",
                    height: "10%",
                  }}
                />
              }
            />
          </GridRow>

          <Grid container justifyContent="center">
            <Grid item md={3} p={2}>
              <FormButtons
                isValid={false}
                handleSubmitButtonClick={handleSave}
                resetForm={resetForm}
                submitBtnLabel="Save"
                isSubmitIcon={false}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Paper>
      </FormikProvider>

      {showTable && (
        <Paper sx={{ width: "50%", marginLeft: "24%" }}>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 500, borderCollapse: "collapse" }}
              size="small"
            >
              <RenderTableHead
                thSx={{
                  bgcolor: "#abd9e3",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
                trSx={{
                  "& th": {
                    border: "1px solid grey",
                    padding: "4px 8px",
                    width: "90px",
                  },
                }}
                cells={[
                  labels.userCode?.[lang],
                  labels.UserName?.[lang],
                  labels.Edit?.[lang],
                ]}
              />

              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length ? (
                  filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "& td": {
                          border: "1px solid grey",
                          padding: "4px 8px",
                          fontSize: "13px",
                        },
                      }}
                    >
                      {/* <TableCell align="center">{index + 1}</TableCell> */}
                      <TableCell align="center">{item.userCode}</TableCell>
                      <TableCell align="center">{item.userName}</TableCell>
                      <TableCell align="center">
                        <button
                          style={{
                            padding: "4px 10px",
                            background: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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

export default React.memo(AddUser);
