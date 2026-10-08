import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import TextInput from "../form-fields/text-input";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import { getFloor, getWing } from "../../services/assessment-services";

// Theme tokens — same values used across the other redesigned pages.
const NAVY = "#12233F";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

// Small caption that labels a group of related fields inside the card.
const GroupCaption = ({ children, hint }) => (
  <Box sx={{ mb: 1 }}>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
    {hint && (
      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>{hint}</Typography>
    )}
  </Box>
);

const PropertyAddressForm = () => {
  const formik = useFormikContext();
  const lang = useSelector((state) => state.userDetails?.lang);
  const { setLoading } = useApiState();
  const [floorList, setFloorList] = useState([]);
  const [wingList, setWingList] = useState([]);

  const floorOptions = useMemo(
    () => floorList.map((item) => ({ id: item.marFloorName, label: item.marFloorName })),
    [floorList]
  );
  const wingOptions = useMemo(
    () =>
      wingList.map((item) => ({
        id: item.engWingName,
        label: item.engWingName,
      })),
    [wingList]
  );

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [floorRes, wingRes] = await Promise.all([getFloor(), getWing()]);

        // Don't touch state if the component unmounted while we were waiting.
        if (!mounted) return;

        setFloorList(floorRes || []);
        setWingList(wingRes || []);
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

  // Rebuilds the full Marathi / English address strings from the
  // individual fields whenever one of them loses focus.
  const handleAddressBlur = () => {
    const {
      flatNo,
      blockNo,
      floorMarathi,
      floor,
      buildingNo,
      wingNameMarathi,
      wingName,
      societyNameMarathi,
      societyName,
      landmarkMarathi,
      landmark,
      towerNameMarathi,
      towerName,
      villageMarathi,
      village,
      pinCode,
    } = formik.values;

    const marathiAddress = [
      flatNo && `फ्लॅट नं. ${flatNo}`,
      blockNo && `ब्लॉक नं. ${blockNo}`,
      floorMarathi,
      buildingNo && `बिल्डिंग नं. ${buildingNo}`,
      wingNameMarathi,
      societyNameMarathi,
      landmarkMarathi,
      towerNameMarathi,
      villageMarathi,
      pinCode,
    ]
      .filter(Boolean)
      .join(", ");

    const englishAddress = [
      flatNo && `Flat No. ${flatNo}`,
      blockNo && `Block No. ${blockNo}`,
      floor,
      buildingNo && `Building No. ${buildingNo}`,
      wingName,
      societyName,
      landmark,
      towerName,
      village,
      pinCode,
    ]
      .filter(Boolean)
      .join(", ");

    formik.setFieldValue("marPropertyAddress", marathiAddress);
    formik.setFieldValue("engPropertyAddress", englishAddress);
  };

  return (
    <Box>
      {/* Section header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: MINT_BG, color: MINT }}>
          <LocationOnOutlined fontSize="small" />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: NAVY }}>
            {labels?.propertyAddressDetails?.[lang] || "Property Address Details"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Unit, building and locality details in both languages
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <GroupCaption>Unit details</GroupCaption>
          <GridRow>
            <FormLabel label={labels.FlatNo[lang]} required />
            <FormValue component={<TextInput name="flatNo" onBlur={handleAddressBlur} />} />
            <FormLabel label={labels.blockNo[lang]} required />
            <FormValue component={<TextInput name="blockNo" onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.Floor[lang]} required />
            <FormValue
              component={<SelectInput name="floorMarathi" options={floorOptions} onBlur={handleAddressBlur} />}
            />
            <FormLabel label={labels.FloorEnglish[lang]} required />
            <FormValue component={<TextInput name="floor" onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.buildingNo[lang]} required />
            <FormValue component={<TextInput name="buildingNo" onBlur={handleAddressBlur} />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>Building &amp; society</GroupCaption>
          <GridRow>
            <FormLabel label={labels.Wing[lang]} required />
            <FormValue
              component={<SelectInput name="wingNameMarathi" options={wingOptions} onBlur={handleAddressBlur} />}
            />
            <FormLabel label={labels.WingEnglish[lang]} required />
            <FormValue component={<TextInput name="wingName" required onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.SocityName[lang]} required />
            <FormValue component={<TextInput name="societyNameMarathi" required onBlur={handleAddressBlur} />} />
            <FormLabel label={labels.SocityNameEnglish[lang]} required />
            <FormValue component={<TextInput name="societyName" required onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.TowerName[lang]} required />
            <FormValue component={<TextInput name="towerNameMarathi" onBlur={handleAddressBlur} />} />
            <FormLabel label={labels.TowerNameEnglish[lang]} required />
            <FormValue component={<TextInput name="towerName" required onBlur={handleAddressBlur} />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>Locality</GroupCaption>
          <GridRow>
            <FormLabel label={labels.Landmark[lang]} required />
            <FormValue component={<TextInput name="landmarkMarathi" onBlur={handleAddressBlur} />} />
            <FormLabel label={labels.LandmarkEnglish[lang]} required />
            <FormValue component={<TextInput name="landmark" onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.Village[lang]} required />
            <FormValue component={<TextInput name="villageMarathi" onBlur={handleAddressBlur} />} />
            <FormLabel label={labels.VillageNameEnglish[lang]} required />
            <FormValue component={<TextInput name="village" required onBlur={handleAddressBlur} />} />
          </GridRow>
          <GridRow>
            <FormLabel label={labels.PinCode[lang]} required />
            <FormValue component={<TextInput name="pinCode" required onBlur={handleAddressBlur} />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption hint="Built automatically from the fields above when you leave a field — you can still edit it.">
            Full address
          </GroupCaption>
          <GridRow>
            <FormLabel label={labels.propertyAddress[lang]} />
            <FormValue component={<TextInput multiline={true} name="marPropertyAddress" />} />
            <FormLabel label={labels.propertyAddressEnglish[lang]} />
            <FormValue component={<TextInput multiline={true} name="engPropertyAddress" />} />
          </GridRow>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PropertyAddressForm;