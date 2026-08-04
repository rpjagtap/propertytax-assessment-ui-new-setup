import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import TextInput from "../form-fields/text-input";
import useApiState from "../common/useApiState";
import { getAllProTransactions, getZoneByProfile, getGatByZonekey, getFinancialYear, getSpecialOwnership, getPropertyOwnerDetails } from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { useFormikContext } from "formik";
import DateInput from "../form-fields/date-picker";
import { labels } from "../../lang/labels";
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField
} from "@mui/material";
import { FormikProvider } from "formik";


const PropertyInfoForm = ({ zoneKey, setZoneKey }) => {

  const initialState = {
    transactionTypeKey: "",
    zoneKey: "",
    gatKey: "",
  };

  const formik = useFormikContext();
  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading } = useApiState();
  const [allProTransactions, setAllProTransactions] = useState([]);
  const [transactionsOptions, setTransactionsOptions] = useState([]);
  const [zoneKeys, setZoneKeys] = useState([]);
  const [gatKeys, setGatKeys] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [specialOwnershipRes, setSpecialOwnershipRes] = useState([]);
  const [searchParams] = useSearchParams();
  const transactionTypeIdFromURL = searchParams.get("transactionTypeId");
  const propertyCodeFromURL = searchParams.get("propertyCode");
  // const [propertyOwnerDetails, setPropertyOwnerDetails] = useState([]);
  // const [propertyAddress, setPropertyAddress] = useState("");
  // const [mobileNo, setMobileNo] = useState("");
  // const [email, setEmail] = useState("");
  // const [occupant, setOccupant] = useState("");


  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const
          [
            allProTransactionsRes,
            zonesRes,
            financialYearRes,
            specialOwnershipRes
          ] = await Promise.all([
            getAllProTransactions(),
            getZoneByProfile(),
            getFinancialYear(),
            getSpecialOwnership(),
          ]);
        setZoneKeys(zonesRes.zoneLst || []);
        setFinancialYear(financialYearRes.lstSpecialOccupant || []);
        setSpecialOwnershipRes(specialOwnershipRes.lstSpecialOccupant || []);

        if (!mounted) return;
        setAllProTransactions(allProTransactionsRes || []);
        setTransactionsOptions(
          (allProTransactionsRes || []).map((t) => ({
            label: t.marTransactionTypeName,
            value: t.id
          }))
        );
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

  useEffect(() => {
    formik.setFieldValue("gatKey", "");
    setGatKeys([]);
    const loadGatData = async () => {
      try {
        setLoading(true);
        const gatRes = await getGatByZonekey({
          zoneKey: formik.values.zoneKey,
        });
        setGatKeys(gatRes.gatLst);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    if (formik.values.zoneKey) {
      loadGatData();
    }
  }, [formik.values.zoneKey]);

  useEffect(() => {
    if (transactionTypeIdFromURL && transactionsOptions.length > 0) {
      const match = transactionsOptions.find(
        (item) => String(item.value) === String(transactionTypeIdFromURL)
      );
      if (match) {
        formik.setFieldValue("transactionType", match.value); // only id if formik expects id
      }
    }
  }, [transactionTypeIdFromURL, transactionsOptions]);

  // useEffect(() => {
  //   if (propertyCodeFromURL) {
  //     const propertyOwnerDetails = async () => {
  //       try {
  //         setLoading(true);
  //         const response = await getPropertyOwnerDetails({
  //           propertyCode: propertyCodeFromURL
  //         });
  //         if (response) {
  //           setPropertyOwnerDetails(response.propertyName);
  //           setPropertyAddress(response.propertyAddress);
  //           setMobileNo(response.propertyMobileNo);
  //           setEmail(response.email);
  //           setOccupant(response.occupantName);
  //         }
  //       } catch (error) {
  //         showToastError(getErrorMsg(error));
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     propertyOwnerDetails();
  //   }
  // }, [propertyCodeFromURL]);
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
              {labels?.PropertyInfo?.[lang] || ""}
            </Typography>
            <Grid container alignItems="flex-start" justifyContent="flex-start">
              <GridRow>
                <FormLabel label={labels.TransactionType[lang]} />
                <FormValue component={<SelectInput name="transactionType" options={transactionsOptions} disabled  variant="standard" />} />
                <FormLabel label={labels.PropertyNumber[lang]} />
                <FormValue component={<TextInput name="PropertyNumber" disabled value={propertyCodeFromURL}  variant="standard" /> } />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.Zone[lang]} required />
                <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} onChange={(e) => setZoneKey(e.target.value)}  variant="standard"/>} />
                <FormLabel label={labels.Gat[lang]} required />
                <FormValue component={<SelectInput name="gatKey" options={gatKeys}  variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.SRDate[lang]} required />
                <FormValue component={<DateInput name="srDate" required  />} />
                <FormLabel label={labels.PropertyDescription[lang]} required />
                <FormValue component={<TextInput multiline={true} name="propertyDescription"  variant="standard" required />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.FYear[lang]} required />
                <FormValue component={<SelectInput name="fYear" options={financialYear}  variant="standard" />} />
                <FormLabel label={labels.SpecialOwnership[lang]} required />
                <FormValue component={<SelectInput name="specialOwnership" options={specialOwnershipRes} variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.WaterConnectionNumber[lang]} required />
                <FormValue component={<TextInput name="waterConnNo" variant="standard" />} />
                <FormLabel label={labels.DrainageNumber[lang]} required />
                <FormValue component={<TextInput name="drainageNo" variant="standard" />} />
              </GridRow>

            </Grid>
          </Paper>
        </Box>
      </Box>





      {/* <GridRow>
        <FormLabel label={labels.TransactionType[lang]} />
        <FormValue component={<SelectInput name="transactionType" options={transactionsOptions} disabled />} />
        <FormLabel label={labels.PropertyNumber[lang]} />
        <FormValue component={<TextInput name="PropertyNumber" disabled value={propertyCodeFromURL} />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.Zone[lang]} required />
        <FormValue component={<SelectInput name="zoneKey" options={zoneKeys} onChange={(e) => setZoneKey(e.target.value)} />} />
        <FormLabel label={labels.Gat[lang]} required />
        <FormValue component={<SelectInput name="gatKey" options={gatKeys} />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.SRDate[lang]} required />
        <FormValue component={<DateInput name="srDate" required />} />
        <FormLabel label={labels.PropertyDescription[lang]} required />
        <FormValue component={<TextInput multiline={true} name="propertyDescription" required />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.FYear[lang]} required />
        <FormValue component={<SelectInput name="fYear" options={financialYear} />} />
        <FormLabel label={labels.SpecialOwnership[lang]} required />
        <FormValue component={<SelectInput name="specialOwnership" options={specialOwnershipRes} />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.WaterConnectionNumber[lang]} required />
        <FormValue component={<TextInput name="waterConnNo" />} />
        <FormLabel label={labels.DrainageNumber[lang]} required />
        <FormValue component={<TextInput name="drainageNo" />} />
      </GridRow> */}


      {/* <GridRow>
        <FormLabel label={labels.ownerName[lang]} />
        <FormValue component={<TextInput name="propertyOwnerName" value={propertyOwnerDetails} disabled />} />
        <FormLabel label={labels.PropertyAddress[lang]} />
        <FormValue component={<TextInput multiline={true} name="propertyAddress" value={propertyAddress} disabled />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.occupantName[lang]} />
        <FormValue component={<TextInput name="occupantName" value={occupant} disabled />} />
        <FormLabel label={labels.emailId[lang]} />
        <FormValue component={<TextInput name="emailId" value={email} disabled />} />
      </GridRow>
      <GridRow>
        <FormLabel label={labels.MobileNo[lang]} />
        <FormValue component={<TextInput name="mobileNo" value={mobileNo} disabled />} />
      </GridRow> */}
    </>
  );
};
export default PropertyInfoForm;