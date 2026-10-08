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

  const transactionTypeIdFromURL =
    searchParams.get("transactionTypeId");

  const propertyCodeFromURL =
    searchParams.get("propertyCode");

  // =========================================================
  // Initial API calls
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

        setZoneKeys(zonesRes?.zoneLst || []);

        setFinancialYear(
          financialYearRes?.lstSpecialOccupant || []
        );

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
  }, [setLoading]);

  // =========================================================
  // Load GAT when Zone changes / PropertyInfo mounts again
  //
  // IMPORTANT:
  // Do NOT clear gatKey here.
  // Otherwise when user returns to this tab, selected GAT
  // will be erased.
  // =========================================================
  useEffect(() => {
    const selectedZoneKey = formik.values.zoneKey;

    if (!selectedZoneKey) {
      setGatKeys([]);
      return;
    }

    const loadGatData = async () => {
      try {
        setLoading(true);

        const gatRes = await getGatByZonekey({
          zoneKey: selectedZoneKey,
        });

        setGatKeys(gatRes?.gatLst || []);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };

    loadGatData();

    // IMPORTANT:
    // We intentionally DO NOT do:
    //
    // formik.setFieldValue("gatKey", "");
    //
    // because PropertyInfoForm gets mounted again when
    // user comes back to this tab.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zoneKey]);

  // =========================================================
  // Transaction type from URL
  // =========================================================
  useEffect(() => {
    if (
      transactionTypeIdFromURL &&
      transactionsOptions.length > 0
    ) {
      const match = transactionsOptions.find(
        (item) =>
          String(item.value) ===
          String(transactionTypeIdFromURL)
      );

      if (match) {
        formik.setFieldValue(
          "transactionType",
          match.value
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transactionTypeIdFromURL,
    transactionsOptions,
  ]);

  // =========================================================
  // Property code from URL
  // =========================================================
  useEffect(() => {
    if (propertyCodeFromURL) {
      formik.setFieldValue(
        "PropertyNumber",
        propertyCodeFromURL
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCodeFromURL]);

  // =========================================================
  // Zone change handler
  //
  // THIS is now the correct place to clear GAT.
  // If user actually changes Zone, old GAT should be removed.
  // =========================================================
  const handleZoneChange = async (e) => {
    const newZoneKey = e.target.value;

    // Update Formik Zone
    formik.setFieldValue("zoneKey", newZoneKey);

    // Keep parent state also updated
    setZoneKey(newZoneKey);

    // Since Zone changed, old GAT is no longer valid
    formik.setFieldValue("gatKey", "");

    // Clear old GAT dropdown immediately
    setGatKeys([]);

    if (!newZoneKey) {
      return;
    }

    try {
      setLoading(true);

      const gatRes = await getGatByZonekey({
        zoneKey: newZoneKey,
      });

      setGatKeys(gatRes?.gatLst || []);
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
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
            {labels?.PropertyInfo?.[lang] ||
              "Property Info"}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Transaction type, location, registration and
            utility connection details
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>

          <GroupCaption>
            Transaction &amp; location
          </GroupCaption>

          <GridRow>

            <FormLabel
              label={labels.TransactionType[lang]}
            />

            <FormValue
              component={
                <SelectInput
                  name="transactionType"
                  options={transactionsOptions}
                  disabled
                />
              }
            />

            <FormLabel
              label={labels.PropertyNumber[lang]}
            />

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

            <FormLabel
              label={labels.Zone[lang]}
              required
            />

            <FormValue
              component={
                <SelectInput
                  name="zoneKey"
                  options={zoneKeys}
                  onChange={handleZoneChange}
                />
              }
            />

            <FormLabel
              label={labels.Gat[lang]}
              required
            />

            <FormValue
              component={
                <SelectInput
                  name="gatKey"
                  options={gatKeys}
                />
              }
            />

          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>
            Registration details
          </GroupCaption>

          <GridRow>

            <FormLabel
              label={labels.SRDate[lang]}
              required
            />

            <FormValue
              component={
                <DateInput
                  name="srDate"
                  required
                />
              }
            />

            <FormLabel
              label={labels.PropertyDescription[lang]}
              required
            />

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

            <FormLabel
              label={labels.FYear[lang]}
              required
            />

            <FormValue
              component={
                <SelectInput
                  name="fYear"
                  options={financialYear}
                />
              }
            />

            <FormLabel
              label={labels.SpecialOwnership[lang]}
              required
            />

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

          <GroupCaption>
            Utility connections
          </GroupCaption>

          <GridRow>

            <FormLabel
              label={
                labels.WaterConnectionNumber[lang]
              }
            />

            <FormValue
              component={
                <TextInput name="waterConnNo" />
              }
            />

            <FormLabel
              label={
                labels.DrainageNumber[lang]
              }
            />

            <FormValue
              component={
                <TextInput name="drainageNo" />
              }
            />

          </GridRow>

        </CardContent>
      </Card>
    </Box>
  );
};

export default PropertyInfoForm;