import React, { useMemo, useState, useEffect } from "react";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import TextInput from "../form-fields/text-input";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { getFloor, getWing } from "../../services/assessment-services";
import {
  Grid,
  Paper,
  Box,
  Typography,
} from "@mui/material";

const PropertyAddressForm = () => {
  const formik = useFormikContext();
  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading } = useApiState();
  const [floor, setFloor] = useState([]);
  const [wing, SetWing] = useState([]);


  const floorOptions = useMemo(
    () => floor.map((item) => ({ id: item.marFloorName, label: item.marFloorName })),
    [floor]
  );
  const wingOptions = useMemo(
    () => wing.map(item => ({
      id: item.engWingName,
      label: item.engWingName,
    })),
    [wing]
  );

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const
          [
            floorRes,
            wingRes
          ] = await Promise.all([
            getFloor(),
            getWing(),
          ]);

        setFloor(floorRes || []);
        SetWing(wingRes || []);
        if (!mounted) return;


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

  const handleAddressBlur = (formik) => {
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

    // Marathi address
    const marathiAddressParts = [
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
    ].filter(Boolean);

    const marathiAddress = marathiAddressParts.join(", ");

    // English address
    const englishAddressParts = [
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
    ].filter(Boolean);

    const englishAddress = englishAddressParts.join(", ");

    formik.setFieldValue("marPropertyAddress", marathiAddress);
    formik.setFieldValue("engPropertyAddress", englishAddress);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          margin: 5,
          borderRadius: 4,
          minHeight: "auto",
        }}
      >
        <Box>
          <Paper
            elevation={3}
            sx={{
              // width: "200%",
              padding: 5,
              marginLeft: "1.5%",
              borderRadius: 5,
              textAlign: "left",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bolder"
              align="center"
              paddingBottom={2}
              paddingTop={2}
            >
              {labels?.propertyAddressDetails?.[lang] || ""}
            </Typography>
            <Grid container alignItems="flex-start" justifyContent="flex-start">
              <GridRow>
                <FormLabel label={labels.FlatNo[lang]} required />
                <FormValue component={<TextInput name="flatNo" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.blockNo[lang]} required />
                <FormValue component={<TextInput name="blockNo" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.Floor[lang]} required />
                <FormValue component={<SelectInput name="floorMarathi" options={floorOptions} onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.FloorEnglish[lang]} required />
                <FormValue component={<TextInput name="floor" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.buildingNo[lang]} required />
                <FormValue component={<TextInput name="buildingNo" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.Wing[lang]} required />
                <FormValue component={<SelectInput name="wingNameMarathi" options={wingOptions} onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.WingEnglish[lang]} required />
                <FormValue component={<TextInput name="wingName" required onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.SocityName[lang]} required />
                <FormValue component={<TextInput name="societyNameMarathi" required onBlur={() => handleAddressBlur(formik)}  variant="standard"/>} />
                <FormLabel label={labels.SocityNameEnglish[lang]} required />
                <FormValue component={<TextInput name="societyName" required onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.Landmark[lang]} required />
                <FormValue component={<TextInput name="landmarkMarathi" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.LandmarkEnglish[lang]} required />
                <FormValue component={<TextInput name="landmark" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.TowerName[lang]} required />
                <FormValue component={<TextInput name="towerNameMarathi" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.TowerNameEnglish[lang]} required />
                <FormValue component={<TextInput name="towerName" required onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.Village[lang]} required />
                <FormValue component={<TextInput name="villageMarathi" onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
                <FormLabel label={labels.VillageNameEnglish[lang]} required />
                <FormValue component={<TextInput name="village" required onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.PinCode[lang]} required />
                <FormValue component={<TextInput name="pinCode" required onBlur={() => handleAddressBlur(formik)} variant="standard" />} />
              </GridRow>

              <GridRow>
                <FormLabel label={labels.propertyAddress[lang]} />
                <FormValue component={<TextInput multiline={true} name="marPropertyAddress" variant="standard" />} />
                <FormLabel label={labels.propertyAddressEnglish[lang]} />
                <FormValue component={<TextInput multiline={true} name="engPropertyAddress" variant="standard" />} />
              </GridRow>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PropertyAddressForm;