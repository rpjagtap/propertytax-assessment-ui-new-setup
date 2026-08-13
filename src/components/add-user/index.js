import React, { useState, useEffect } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { FormikProvider, useFormik } from "formik";
import ScrollTop from "../common/scrollTop";
import ScrollBottom from "../common/scrollBottom";
import SelectInput from "../form-fields/select-input";
import {
  Grid,
  Checkbox,
  Button,
  Box,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  OutlinedInput,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  LockOutlined,
  MailOutline,
  MapOutlined,
  Visibility,
  VisibilityOff,
  PersonOutline,
  VerifiedUserOutlined,
  CheckCircle,
  Cancel,
  PersonAddAlt1Outlined,
  ManageAccountsOutlined,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import FormButtons from "../common/buttons";
import { labels } from "../../lang/labels";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import {
  getAllProfile,
  getAllZone,
  getAllGatByZoneKey,
  getAddUser,
  // NOTE: add this to assessment-services.js if it isn't there yet.
  // Expected to accept { userCode } (a partial/prefix match is fine) and
  // return either an array of users or { lst: [...] } / { data: [...] },
  // where each item has at least { userCode, userName, ...same shape
  // editUserApi returns for a single user }.
  getAllUserByUserCode,
  editUserApi,
  validateUserApi,
} from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import { trackApplicationSchema } from "../../utils/validation-schema";

/* ---------------------------------------------------------
   Role-based access pattern. Which fields are shown/required
   depends on the selected profile:
     - Prashashan Adhikari -> multiple zones, no gat, no counter
     - Zone Officer        -> exactly one zone, no gat, no counter
     - Gat (Gat Pramukh)   -> exactly one zone, multiple gats
     - Cashier             -> exactly one zone, one cash counter

   Matching is done on the profile label text since profile ids
   come from the API and aren't guaranteed stable across envs.

   API PAYLOAD SHAPE (confirmed from Postman sample):
   {
     userName, userCode, employeeId (number), password,
     counterKey (number, cashier only),
     profileId,
     emailAddress, mobileNumber,
     userZoneGatVO: [
       { zoneKey, isSelect: true, lstUserGatVOs?: [{ zoneKey, isSelect: true, gatKey }] }
     ]
   }

   SCREEN LAYOUT:
   Two tabs at the top of the screen:
     - "Add New User" -> blank form, admin fills everything in manually.
     - "Edit User Detail" -> admin searches an existing user by userCode
        (getAllUserByUserCode), picks one from the results, and the same
        form below gets populated (editUserApi) so it can be updated.
--------------------------------------------------------- */
const ROLE_ADMIN = "admin"; // Prashashan Adhikari
const ROLE_ZONE_OFFICER = "zoneofficer";
const ROLE_GAT = "gat";
const ROLE_CASHIER = "cashier";

const TAB_ADD = "add";
const TAB_EDIT = "edit";

const getRoleKey = (label = "") => {
  const l = (label || "").toLowerCase();
  if (l.includes("prashashan") || l.includes("adhikari")) return ROLE_ADMIN;
  if (l.includes("cashier")) return ROLE_CASHIER;
  if (l.includes("zone") && l.includes("officer")) return ROLE_ZONE_OFFICER;
  if (l.includes("gat")) return ROLE_GAT;
  return "other";
};

const CASH_COUNTER_OPTIONS = [
  { label: "Counter 1", value: "1" },
  { label: "Counter 2", value: "2" },
];

// Normalizes the gat API response — some endpoints return the array
// directly, others wrap it as { gatLst: [...] }. Handle both so a
// backend shape change doesn't silently empty the dropdown.
const extractGatList = (res) => {
  const list = Array.isArray(res) ? res : res?.gatLst || res?.data || [];
  return list.map((item) => ({ label: item.label, value: item.value }));
};

// Normalizes list-style API responses that may come back as a bare
// array, or wrapped as { lst: [...] } / { data: [...] }.
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  return res?.lst || res?.data || [];
};

// Small helper: dedupe an array of {label, value, zoneKey} options by value.
// Keeps the first occurrence, so zoneKey tagging survives the dedupe.
const dedupeOptions = (list = []) => {
  const seen = new Map();
  list.forEach((opt) => {
    if (!seen.has(String(opt.value))) seen.set(String(opt.value), opt);
  });
  return Array.from(seen.values());
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const AddUser = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading } = useApiState();
  const [profiles, setProfiles] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  // gatKeys entries carry { label, value, zoneKey } so we know which
  // zone each gat belongs to when building userZoneGatVO on save
  const [gatKeys, setGatKeys] = useState([]);
  const [editProfile, seteditProfile] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Add / Edit tab switcher
  const [activeTab, setActiveTab] = useState(TAB_ADD);

  // Existing-user search state (Edit User Detail tab)
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUserOption, setSelectedUserOption] = useState(null);

  // Duplicate user-code check (Add New User tab)
  const [userCodeExists, setUserCodeExists] = useState(false);
  const [checkingUserCode, setCheckingUserCode] = useState(false);

  const initialState = {
    userCode: "",
    userName: "",
    employeeId: "",
    password: "",
    profileId: "",
    zoneKey: [], // array of zone values; single or multiple depending on role
    gatKey: [], // array of gat values; only used for the Gat role
    cashCounter: "", // only used for the Cashier role -> mapped to counterKey on save
    emailAddress: "",
    mobileNumber: "",
    isActive: true,
  };

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: trackApplicationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {},
  });

  const selectedProfile = profiles.find(
    (p) => String(p.value) === String(formik.values.profileId)
  );

  const roleKey = getRoleKey(selectedProfile?.label);
  const isAdminRole = roleKey === ROLE_ADMIN; // Prashashan Adhikari -> multi zone, no gat
  const isZoneOfficerRole = roleKey === ROLE_ZONE_OFFICER; // single zone, no gat
  const isGatRole = roleKey === ROLE_GAT; // single zone, multi gat
  const isCashierRole = roleKey === ROLE_CASHIER; // single zone, cash counter

  const zoneMultiple = isAdminRole;
  const showGatSelect = isGatRole;
  const showCashCounter = isCashierRole;

  // On the Edit tab, keep the form hidden until an existing user has
  // actually been picked, so the admin isn't looking at a blank form
  // that looks like "Add".
  const formReady = activeTab === TAB_ADD || (activeTab === TAB_EDIT && isEditMode);

  // arrays of the currently selected zone/gat option objects (for chips, etc.)
  const selectedZones = zoneKeys.filter((z) =>
    (formik.values.zoneKey || []).map(String).includes(String(z.value))
  );
  const selectedGats = gatKeys.filter((g) =>
    (formik.values.gatKey || []).map(String).includes(String(g.value))
  );

  const loadZones = async () => {
    try {
      const data = await getAllZone();
      const formatted = data.map((z) => ({ label: z.label, value: z.value }));
      setZoneKeys(formatted);
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  /* -------------------------------------------------------
     Loads gat options for ALL currently selected zones and
     merges them into one list, since a user can now be given
     access across multiple zones at once. Each gat option is
     tagged with the zoneKey it came from so handleSave can
     nest it under the right zone in userZoneGatVO.
  ------------------------------------------------------- */
  const loadGatOptionsForZones = async (zoneKeyList) => {
    const zones = Array.isArray(zoneKeyList) ? zoneKeyList : [zoneKeyList].filter(Boolean);

    if (!zones.length) {
      setGatKeys([]);
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.all(
        zones.map(async (zoneKey) => {
          const res = await getAllGatByZoneKey({ zoneKey });
          return extractGatList(res).map((g) => ({ ...g, zoneKey: String(zoneKey) }));
        })
      );

      const merged = results.flat();
      const formatted = dedupeOptions(merged);
      setGatKeys(formatted);

      // drop any previously selected gats that are no longer valid
      // for the current zone selection
      const validValues = formatted.map((g) => String(g.value));
      const stillValid = (formik.values.gatKey || []).filter((g) =>
        validValues.includes(String(g))
      );
      if (stillValid.length !== (formik.values.gatKey || []).length) {
        formik.setFieldValue("gatKey", stillValid);
      }

      if (editProfile?.gatKey) {
        const editGats = Array.isArray(editProfile.gatKey)
          ? editProfile.gatKey.map(String)
          : [String(editProfile.gatKey)];
        formik.setFieldValue("gatKey", editGats);
      }
    } catch (err) {
      console.error("Error loading gat keys:", err);
      setGatKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setIsEditMode(false);
    setGatKeys([]);
    setSelectedUserOption(null);
    setUserSearchInput("");
    setUserOptions([]);
    setUserCodeExists(false);
  };

  /* -------------------------------------------------------
     Switching tabs always starts from a clean slate: Add
     gets a blank form, Edit waits for a user to be picked.
  ------------------------------------------------------- */
  const handleTabChange = (event, newTab) => {
    setActiveTab(newTab);
    resetForm();
  };

  /* -------------------------------------------------------
     Whenever the role changes, drop any selections that no
     longer make sense for that role: trim zone down to one
     for every role except admin, clear gat unless the role
     is Gat, and clear cash counter unless the role is Cashier.
  ------------------------------------------------------- */
  useEffect(() => {
    if (!selectedProfile) return;

    if (!isAdminRole && formik.values.zoneKey.length > 1) {
      formik.setFieldValue("zoneKey", formik.values.zoneKey.slice(0, 1));
    }
    if (!isGatRole && formik.values.gatKey.length) {
      formik.setFieldValue("gatKey", []);
    }
    if (!isCashierRole && formik.values.cashCounter) {
      formik.setFieldValue("cashCounter", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleKey]);

  /* -------------------------------------------------------
     Builds the userZoneGatVO array expected by the API:
       [{ zoneKey, isSelect: true, lstUserGatVOs?: [...] }]
     For the Gat role, gats selected for a given zone are
     nested under that zone's lstUserGatVOs. Other roles just
     send the zone entries with no nested gat list.
  ------------------------------------------------------- */
  const buildUserZoneGatVO = (values) => {
    // send EVERY zone the system knows about, marking isSelect true/false
    // based on whether the user actually picked it — not just the picked ones
    const selectedZoneValues = (values.zoneKey || []).map(String);
    const selectedGatValues = (values.gatKey || []).map(String);

    return zoneKeys.map((z) => {
      const zk = String(z.value);
      const isZoneSelected = selectedZoneValues.includes(zk);

      const entry = {
        zoneKey: Number(z.value),
        isSelect: isZoneSelected,
      };

      // only attach lstUserGatVOs for the Gat role, and only for zones
      // that are actually selected
      if (isGatRole && isZoneSelected) {
        const gatsForZone = gatKeys.filter((g) => String(g.zoneKey) === zk);

        if (gatsForZone.length) {
          entry.lstUserGatVOs = gatsForZone.map((g) => ({
            zoneKey: Number(z.value),
            isSelect: selectedGatValues.includes(String(g.value)),
            gatKey: Number(g.value),
          }));
        }
      }

      return entry;
    });
  };

  /* -------------------------------------------------------
     Add New User tab: soft, non-blocking heads-up while typing.
     This never disables Save by itself — the real, authoritative
     check happens inside handleSave right before saving, so a
     slow/hung request here can never strand the Save button.
  ------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== TAB_ADD) {
      setUserCodeExists(false);
      return;
    }
    const code = (formik.values.userCode || "").trim();
    if (!code) {
      setUserCodeExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingUserCode(true);
        const res = await validateUserApi({ userCode: code });
        const list = extractList(res);
        const exists = list.some(
          (u) => String(u.userCode).toLowerCase() === code.toLowerCase()
        );
        setUserCodeExists(exists);
      } catch (err) {
        setUserCodeExists(false);
      } finally {
        setCheckingUserCode(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.userCode, activeTab]);

  const handleSave = async () => {
    const values = formik.values;

    // Authoritative duplicate check, done fresh at save time so it
    // can never be blocked by a stale/slow background check.
    if (activeTab === TAB_ADD) {
      const code = (values.userCode || "").trim();
      if (!code) {
        showToastError("Please enter a user code.");
        return;
      }
      try {
        setLoading(true);
        const res = await validateUserApi({ userCode: code });
        const list = extractList(res);
        const exists = list.some(
          (u) => String(u.userCode).toLowerCase() === code.toLowerCase()
        );
        if (exists) {
          setUserCodeExists(true);
          showToastError("This user code already exists. Please use a different one.");
          setLoading(false);
          return;
        }
      } catch (err) {
        // if the check itself fails, don't block the admin — proceed to save
      }
    }

    let saveSucceeded = false;
    try {
      setLoading(true);

      const body = {
        userName: values.userName,
        employeeId: Number(values.employeeId),
        userCode: values.userCode,
        password: values.password,
        profileId: values.profileId,
        emailAddress: values.emailAddress,
        mobileNumber: values.mobileNumber,
        userZoneGatVO: buildUserZoneGatVO(values),
      };

      // counterKey only applies to the Cashier role
      if (isCashierRole && values.cashCounter) {
        body.counterKey = Number(values.cashCounter);
      }

      // NOTE: isActive wasn't present in the sample Postman payload.
      // Uncomment if the backend still expects it:
      // body.isActive = values.isActive ? "Y" : "N";

      await getAddUser(body);
      saveSucceeded = true;
    } catch (err) {
      // The backend can occasionally throw on the save response (e.g. a
      // downstream step failing) even though the user record was already
      // committed to the database. Rather than alarm the admin with a
      // false failure, double-check whether the user code now actually
      // exists before deciding this was a real error.
      try {
        const verifyRes = await validateUserApi({ userCode: values.userCode });
        const verifyList = extractList(verifyRes);
        const actuallySaved = verifyList.some(
          (u) => String(u.userCode).toLowerCase() === String(values.userCode).toLowerCase()
        );
        if (actuallySaved) {
          saveSucceeded = true;
        } else {
          showToastError(getErrorMsg(err));
          setLoading(false);
          return;
        }
      } catch (verifyErr) {
        // couldn't verify either — fall back to the original error
        showToastError(getErrorMsg(err));
        setLoading(false);
        return;
      }
    }

    // Post-save cleanup, kept outside the try/catch above on purpose:
    // if resetForm() or a state update here ever throws, it must not
    // surface as "something went wrong" for a save that already succeeded.
    try {
      showToastSuccess(isEditMode ? "Updated Successfully!" : "Saved Successfully!");
      resetForm();
      if (activeTab === TAB_EDIT) {
        // stay on the Edit tab but clear the loaded record so the admin
        // has to pick a user again before the form re-appears
        setIsEditMode(false);
      }
    } catch (cleanupErr) {
      console.error("Post-save cleanup error (save itself succeeded):", cleanupErr);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     Debounced search-as-you-type against getAllUserByUserCode.
     Only runs while the "Edit User Detail" tab is active.
  ------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== TAB_EDIT) return;
    if (!userSearchInput || !userSearchInput.trim()) {
      setUserOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setUserSearchLoading(true);
        const res = await getAllUserByUserCode({ userCode: userSearchInput.trim() });
        setUserOptions(extractList(res));
      } catch (err) {
        showToastError(getErrorMsg(err));
        setUserOptions([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [userSearchInput, activeTab]);

  const handleEdit = async (item) => {
    if (!item?.userCode) return;
    try {
      setLoading(true);

      const body = { userCode: item.userCode };
      const res = await editUserApi(body);
      seteditProfile(res);

      // normalize the userZoneGatVO shape coming back from the API into
      // the flat zoneKey/gatKey arrays formik uses for the selects
      const zoneGatList = Array.isArray(res.userZoneGatVO) ? res.userZoneGatVO : [];
      const editZoneKeys = zoneGatList.map((z) => String(z.zoneKey));
      const editGatKeys = zoneGatList.flatMap((z) =>
        Array.isArray(z.lstUserGatVOs)
          ? z.lstUserGatVOs.map((g) => String(g.gatKey))
          : []
      );

      const editRoleKey = getRoleKey(
        profiles.find((p) => String(p.value) === String(res.profileId))?.label
      );
      if (editRoleKey === ROLE_GAT) {
        await loadGatOptionsForZones(editZoneKeys);
      } else {
        setGatKeys([]);
      }

      // NOTE: loads the real password so it can be edited manually.
      // If your backend doesn't return the real password on edit for
      // security reasons, switch this back to a masked value and add
      // a "leave blank to keep current password" pattern in handleSave.
      formik.setValues({
        userName: res.userName || "",
        employeeId: res.employeeId ? String(res.employeeId) : "",
        userCode: res.userCode || "",
        password: res.password || "",
        isActive: res.isActive === "Y" ? true : false,
        zoneKey: editZoneKeys,
        gatKey: editGatKeys,
        cashCounter: res.counterKey ? String(res.counterKey) : "",
        profileId: String(res.profileId) || "",
        emailAddress: res.emailAddress || "",
        mobileNumber: res.mobileNumber || "",
      });

      setIsEditMode(true);
      showToastSuccess("User data loaded for editing!");
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  // Fired when the admin picks a result from the userCode search box
  const handleSelectExistingUser = (event, option) => {
    setSelectedUserOption(option);
    if (option) {
      handleEdit(option);
    } else {
      setIsEditMode(false);
      formik.resetForm();
    }
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await getAllProfile();
        const formatted = res?.map((item) => ({ label: item.label, value: item.value }));
        setProfiles(formatted);
      } catch (err) {
        console.error("Error loading profiles:", err);
      }
    };

    loadProfiles();
    loadZones();
  }, []);

  // single source of truth for gat options: refresh whenever the
  // selected zone(s) change — only relevant for the Gat role
  useEffect(() => {
    if (!isGatRole) {
      setGatKeys([]);
      return;
    }
    if (formik.values.zoneKey && formik.values.zoneKey.length) {
      loadGatOptionsForZones(formik.values.zoneKey);
    } else {
      setGatKeys([]);
      formik.setFieldValue("gatKey", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zoneKey, isGatRole]);

  return (
    <DashBoardContainer>
      <ScrollBottom />
      <ScrollTop />

      {/* Add / Edit tab switcher */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="standard"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            display: "inline-flex",
            bgcolor: "#EEF1F6",
            borderRadius: 3,
            p: 0.6,
            minHeight: 0,
            "& .MuiTabs-flexContainer": { gap: 0.6 },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              minHeight: 0,
              py: 1,
              px: 2.5,
              borderRadius: 2.5,
              color: "#12233F",
            },
            "& .Mui-selected": {
              bgcolor: "#12233F !important",
              color: "#fff !important",
            },
          }}
        >
          <Tab
            icon={<PersonAddAlt1Outlined fontSize="small" />}
            iconPosition="start"
            label="Add New User"
            value={TAB_ADD}
          />
          <Tab
            icon={<ManageAccountsOutlined fontSize="small" />}
            iconPosition="start"
            label="Edit User Detail"
            value={TAB_EDIT}
          />
        </Tabs>
      </Box>

      {activeTab === TAB_EDIT && (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
              Search for an existing user by user code, then pick them below to load
              their details into the form.
            </Typography>
            <Autocomplete
              size="small"
              sx={{ maxWidth: 360 }}
              options={userOptions}
              loading={userSearchLoading}
              value={selectedUserOption}
              filterOptions={(x) => x} // options already come pre-filtered from the API
              getOptionLabel={(opt) =>
                opt?.userCode ? `${opt.userCode}${opt.userName ? " - " + opt.userName : ""}` : ""
              }
              isOptionEqualToValue={(opt, val) => opt.userCode === val.userCode}
              onInputChange={(event, value) => setUserSearchInput(value)}
              onChange={handleSelectExistingUser}
              noOptionsText={
                userSearchInput.trim() ? "No matching users found" : "Start typing a user code"
              }
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.userCode}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar
                      sx={{ width: 26, height: 26, fontSize: 11, bgcolor: "#E1F5EE", color: "#0F6E56" }}
                    >
                      {initials(option.userName)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        {option.userCode}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        {option.userName}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Type a user code to search..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {userSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </CardContent>
        </Card>
      )}

      <FormikProvider value={formik}>
        {!formReady ? (
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, mb: 3, py: 6, display: "flex", justifyContent: "center" }}
          >
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Search and select a user above to load their details for editing.
            </Typography>
          </Card>
        ) : (
          <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
            {/* Header band */}
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
                {initials(formik.values.userName)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                  {isEditMode ? "Edit user account" : "Add user account"}
                </Typography>
                <Typography sx={{ color: "#B8C4D6", fontSize: 13 }}>
                  {isEditMode
                    ? "Update role, zone/gat access or contact details."
                    : "Pick a role, then enter the login code and password manually. Zone and Gat support multiple selections."}
                </Typography>
              </Box>
              {selectedProfile && (
                <Chip
                  icon={<VerifiedUserOutlined sx={{ color: "#0F6E56 !important" }} />}
                  label={selectedProfile.label}
                  sx={{ bgcolor: "#E1F5EE", color: "#0F6E56", fontWeight: 600 }}
                />
              )}
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
                {/* Identity + role */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                    <CardHeader
                      avatar={<PersonOutline sx={{ color: "text.secondary" }} />}
                      title="Identity and role"
                      titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <GridRow>
                        <FormLabel label={labels.profile[lang]} />
                        <FormValue
                          component={
                            <SelectInput
                              name="profileId"
                              options={profiles}
                              onChange={(e) =>
                                formik.setFieldValue("profileId", e.target.value)
                              }
                            />
                          }
                        />
                      </GridRow>
                      <GridRow>
                        <FormLabel label={labels.UserName[lang]} />
                        <FormValue component={<TextInput name="userName" />} />
                        <FormLabel label={labels.employeeID[lang]} />
                        <FormValue component={<TextInput name="employeeId" />} />
                      </GridRow>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Login credentials */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                    <CardHeader
                      avatar={<LockOutlined sx={{ color: "text.secondary" }} />}
                      title="Login credentials"
                      titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                      subheader="Enter the login code and password for this user"
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <GridRow>
                        <FormLabel label={labels.userCode[lang]} required />
                        <FormValue
                          component={
                            <TextInput
                              name="userCode"
                              disabled={activeTab === TAB_EDIT}
                              error={activeTab === TAB_ADD && userCodeExists}
                              helperText={
                                activeTab === TAB_ADD
                                  ? checkingUserCode
                                    ? "Checking user code..."
                                    : userCodeExists
                                    ? "This user code already exists."
                                    : ""
                                  : ""
                              }
                            />
                          }
                        />
                      </GridRow>

                      <GridRow>
                        <FormLabel label={labels.password[lang]} required />
                        <FormValue
                          component={
                            <TextInput
                              type={showPassword ? "text" : "password"}
                              name="password"
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={() => setShowPassword((s) => !s)}
                                  >
                                    {showPassword ? (
                                      <VisibilityOff fontSize="small" />
                                    ) : (
                                      <Visibility fontSize="small" />
                                    )}
                                  </IconButton>
                                ),
                              }}
                            />
                          }
                        />
                      </GridRow>
                      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>
                        Login code and password are entered manually. One login code covers
                        all selected zones/gats below — access is switched in-app, not via
                        separate logins.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Zone / Gat / Cash Counter access */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                    <CardHeader
                      avatar={<MapOutlined sx={{ color: "text.secondary" }} />}
                      title="Access"
                      titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                      subheader={
                        !selectedProfile
                          ? "Select a role to configure access"
                          : isAdminRole
                          ? "Prashashan Adhikari: select all zones this user should access"
                          : isZoneOfficerRole
                          ? "Zone Officer: select the one zone this user belongs to"
                          : isGatRole
                          ? "Gat: select the zone, then all gats this user should switch between"
                          : isCashierRole
                          ? "Cashier: select the zone and the cash counter"
                          : "Select a zone"
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <GridRow>
                        <FormLabel label={labels.Zone[lang]} />
                        <FormValue
                          component={
                            zoneMultiple ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  multiple
                                  displayEmpty
                                  value={formik.values.zoneKey || []}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    formik.setFieldValue("zoneKey", value);
                                  }}
                                  input={<OutlinedInput />}
                                  renderValue={(selected) => {
                                    if (!selected || !selected.length) {
                                      return (
                                        <span style={{ color: "#9aa5b1" }}>Select zone(s)</span>
                                      );
                                    }
                                    return zoneKeys
                                      .filter((z) =>
                                        selected.map(String).includes(String(z.value))
                                      )
                                      .map((z) => z.label)
                                      .join(", ");
                                  }}
                                >
                                  {zoneKeys.map((z) => (
                                    <MenuItem key={z.value} value={z.value}>
                                      <Checkbox
                                        checked={
                                          (formik.values.zoneKey || [])
                                            .map(String)
                                            .indexOf(String(z.value)) > -1
                                        }
                                      />
                                      <ListItemText primary={z.label} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            ) : (
                              <FormControl fullWidth size="small">
                                <Select
                                  displayEmpty
                                  value={formik.values.zoneKey?.[0] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    formik.setFieldValue("zoneKey", value ? [value] : []);
                                  }}
                                >
                                  <MenuItem value="">
                                    <em style={{ color: "#9aa5b1", fontStyle: "normal" }}>
                                      Select zone
                                    </em>
                                  </MenuItem>
                                  {zoneKeys.map((z) => (
                                    <MenuItem key={z.value} value={z.value}>
                                      {z.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )
                          }
                        />

                        {showGatSelect && (
                          <>
                            <FormLabel label={labels.Gat[lang]} />
                            <FormValue
                              component={
                                <FormControl fullWidth size="small">
                                  <Select
                                    multiple
                                    displayEmpty
                                    disabled={!gatKeys.length}
                                    value={formik.values.gatKey || []}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      formik.setFieldValue("gatKey", value);
                                    }}
                                    input={<OutlinedInput />}
                                    renderValue={(selected) => {
                                      if (!selected || !selected.length) {
                                        return (
                                          <span style={{ color: "#9aa5b1" }}>
                                            {gatKeys.length
                                              ? "Select gat(s)"
                                              : "Select a zone first"}
                                          </span>
                                        );
                                      }
                                      return gatKeys
                                        .filter((g) =>
                                          selected.map(String).includes(String(g.value))
                                        )
                                        .map((g) => g.label)
                                        .join(", ");
                                    }}
                                  >
                                    {gatKeys.map((g) => (
                                      <MenuItem key={g.value} value={g.value}>
                                        <Checkbox
                                          checked={
                                            (formik.values.gatKey || [])
                                              .map(String)
                                              .indexOf(String(g.value)) > -1
                                          }
                                        />
                                        <ListItemText primary={g.label} />
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              }
                            />
                          </>
                        )}

                        {showCashCounter && (
                          <>
                            <FormLabel label="Cash Counter" />
                            <FormValue
                              component={
                                <FormControl fullWidth size="small">
                                  <Select
                                    displayEmpty
                                    value={formik.values.cashCounter || ""}
                                    onChange={(e) =>
                                      formik.setFieldValue("cashCounter", e.target.value)
                                    }
                                  >
                                    <MenuItem value="">
                                      <em style={{ color: "#9aa5b1", fontStyle: "normal" }}>
                                        Select counter
                                      </em>
                                    </MenuItem>
                                    {CASH_COUNTER_OPTIONS.map((c) => (
                                      <MenuItem key={c.value} value={c.value}>
                                        {c.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              }
                            />
                          </>
                        )}
                      </GridRow>

                      {!!selectedZones.length && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5, rowGap: 1 }}>
                          {selectedZones.map((z) => (
                            <Chip
                              key={z.value}
                              size="small"
                              icon={<MapOutlined sx={{ fontSize: 16 }} />}
                              label={z.label}
                              sx={{ bgcolor: "#E1F5EE", color: "#0F6E56" }}
                            />
                          ))}
                        </Stack>
                      )}
                      {!!selectedGats.length && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
                          {selectedGats.map((g) => (
                            <Chip
                              key={g.value}
                              size="small"
                              label={g.label}
                              sx={{ bgcolor: "#EEF2FA", color: "#12233F" }}
                            />
                          ))}
                        </Stack>
                      )}
                      {showCashCounter && formik.values.cashCounter && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={
                              CASH_COUNTER_OPTIONS.find(
                                (c) => c.value === formik.values.cashCounter
                              )?.label || `Counter ${formik.values.cashCounter}`
                            }
                            sx={{ bgcolor: "#EEF2FA", color: "#12233F" }}
                          />
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Contact */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                    <CardHeader
                      avatar={<MailOutline sx={{ color: "text.secondary" }} />}
                      title="Contact details"
                      titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <GridRow>
                        <FormLabel label={labels.Email[lang]} />
                        <FormValue component={<TextInput name="emailAddress" />} />
                        <FormLabel label={labels.mobileNo[lang]} />
                        <FormValue component={<TextInput name="mobileNumber" />} />
                      </GridRow>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container justifyContent="center">
                <Grid item md={4} p={0}>
                  <FormButtons
                    isValid={false}
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
        )}
      </FormikProvider>
    </DashBoardContainer>
  );
};

export default React.memo(AddUser);
