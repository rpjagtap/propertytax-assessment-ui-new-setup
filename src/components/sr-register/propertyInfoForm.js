import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useSearchParams } from "react-router-dom";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";

import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import TextInput from "../form-fields/text-input";
import DateInput from "../form-fields/date-picker";

import useApiState from "../common/useApiState";

import {
  getAllProTransactions,
  getZoneByProfile,
  getGatByZonekey,
  getFinancialYear,
  getSpecialOwnership,
} from "../../services/assessment-services";

import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { labels } from "../../lang/labels";

// Theme tokens
const NAVY = "#12233F";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

// ---------------------------------------------------------
// Returns the value SelectInput uses for an option.
// ADJUST this to match your API item shape (e.g. item.zoneKey, item.gatKey)
// and keep it consistent with what SelectInput reads as option value.
// ---------------------------------------------------------
const getOptionValue = (item) =>
  item?.value ?? item?.id ?? item?.key ?? "";

// Small caption
const GroupCaption = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

const PropertyInfoForm = ({ zoneKey, setZoneKey }) => {
  const formik = useFormikContext();

  const lang = useSelector((state) => state.userDetails?.lang);

  const { setLoading } = useApiState();

  const [transactionsOptions, setTransactionsOptions] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [specialOwnershipRes, setSpecialOwnershipRes] = useState([]);

  const [searchParams] = useSearchParams();

  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");

  // =========================================================
  // Initial API calls
  // Also auto-selects the Zone when only ONE zone is returned
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [
          allProTransactionsRes,
          zonesRes,
          financialYearRes,
          specialOwnershipData,
        ] = await Promise.all([
          getAllProTransactions(),
          getZoneByProfile(),
          getFinancialYear(),
          getSpecialOwnership(),
        ]);

        if (!mounted) return;

        const zones = zonesRes?.zoneLst || [];
        setZoneKeys(zones);

        // Only one zone -> select it by default
        if (zones.length === 1) {
          const onlyZone = getOptionValue(zones[0]);

          formik.setFieldValue("zoneKey", onlyZone);
          setZoneKey?.(onlyZone); // keep parent in sync
        }

        setFinancialYear(financialYearRes?.lstSpecialOccupant || []);

        setSpecialOwnershipRes(
          specialOwnershipData?.lstSpecialOccupant || []
        );

        setTransactionsOptions(
          (allProTransactionsRes || []).map((t) => ({
            label: t.marTransactionTypeName,
            value: t.id,
          }))
        );
      } catch (err) {
        showToastError(getErrorMsg(err));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading]);

  // =========================================================
  // Parent -> Formik sync
  // If parent already has a zoneKey, make sure Formik has it too
  // =========================================================
  useEffect(() => {
    if (
      zoneKey &&
      String(zoneKey) !== String(formik.values.zoneKey ?? "")
    ) {
      formik.setFieldValue("zoneKey", zoneKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneKey]);

  // =========================================================
  // Load GAT list whenever Zone changes
  // Auto-selects the GAT when only ONE GAT is returned
  // =========================================================
  useEffect(() => {
    const selectedZoneKey = formik.values.zoneKey;

    if (!selectedZoneKey) {
      setGatKeys([]);
      return;
    }

    let active = true; // ignore stale responses

    const loadGatData = async () => {
      try {
        setLoading(true);

        const gatRes = await getGatByZonekey({
          zoneKey: selectedZoneKey,
        });

        if (!active) return;

        const gats = gatRes?.gatLst || [];
        setGatKeys(gats);

        // Only one GAT -> select it by default
        if (gats.length === 1) {
          formik.setFieldValue("gatKey", getOptionValue(gats[0]));
        }
      } catch (error) {
        if (active) showToastError(getErrorMsg(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadGatData();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zoneKey]);

  // =========================================================
  // Transaction type from URL
  // =========================================================
  useEffect(() => {
    if (transactionTypeIdFromURL && transactionsOptions.length > 0) {
      const match = transactionsOptions.find(
        (item) => String(item.value) === String(transactionTypeIdFromURL)
      );

      if (match) {
        formik.setFieldValue("transactionType", match.value);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionTypeIdFromURL, transactionsOptions]);

  // =========================================================
  // Property code from URL
  // =========================================================
  useEffect(() => {
    if (propertyCodeFromURL) {
      formik.setFieldValue("PropertyNumber", propertyCodeFromURL);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCodeFromURL]);

  // =========================================================
  // Zone change handler (user-initiated change only)
  // GAT list is loaded by the effect above, so no API call here.
  // =========================================================
  const handleZoneChange = (e) => {
    const newZoneKey = e.target.value;

    formik.setFieldValue("zoneKey", newZoneKey);

    // Old GAT is no longer valid for the new Zone
    formik.setFieldValue("gatKey", "");
    setGatKeys([]);

    // Keep parent state updated
    setZoneKey?.(newZoneKey);
  };

  return (
    <Box>
      {/* Section header */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: MINT_BG,
            color: MINT,
          }}
        >
          <HomeWorkOutlined fontSize="small" />
        </Avatar>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: NAVY,
            }}
          >
            {labels.PropertyDetails[lang]}
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <GroupCaption>{labels.TransactionAndLocation[lang]}</GroupCaption>

          <GridRow>
            <FormLabel label={labels.TransactionType[lang]} />

            <FormValue
              component={
                <SelectInput
                  name="transactionType"
                  options={transactionsOptions}
                  disabled
                />
              }
            />

            <FormLabel label={labels.PropertyNumber[lang]} />

            <FormValue
              component={
                <TextInput
                  name="PropertyNumber"
                  disabled
                  value={propertyCodeFromURL || ""}
                />
              }
            />
          </GridRow>

          <GridRow>
            <FormLabel label={labels.Zone[lang]} required />

            <FormValue
              component={
                <SelectInput
                  name="zoneKey"
                  options={zoneKeys}
                  onChange={handleZoneChange}
                />
              }
            />

            <FormLabel label={labels.Gat[lang]} required />

            <FormValue
              component={<SelectInput name="gatKey" options={gatKeys} />}
            />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>{labels.Registrationdetails[lang]}</GroupCaption>

          <GridRow>
            <FormLabel label={labels.SRDate[lang]} required />

            <FormValue
              component={<DateInput name="srDate" required />}
            />

            <FormLabel label={labels.PropertyDescription[lang]} required />

            <FormValue
              component={
                <TextInput
                  multiline={true}
                  name="propertyDescription"
                  required
                />
              }
            />
          </GridRow>

          <GridRow>
            <FormLabel label={labels.FYear[lang]} required />

            <FormValue
              component={
                <SelectInput name="fYear" options={financialYear} />
              }
            />

            <FormLabel label={labels.SpecialOwnership[lang]} required />

            <FormValue
              component={
                <SelectInput
                  name="specialOwnership"
                  options={specialOwnershipRes}
                />
              }
            />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>{labels.WaterAndDrainage[lang]}</GroupCaption>

          <GridRow>
            <FormLabel label={labels.WaterConnectionNumber[lang]} />

            <FormValue component={<TextInput name="waterConnNo" />} />

            <FormLabel label={labels.DrainageNumber[lang]} />

            <FormValue component={<TextInput name="drainageNo" />} />
          </GridRow>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PropertyInfoForm;