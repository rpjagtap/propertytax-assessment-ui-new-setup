import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import { Add, RemoveCircleTwoTone } from "@mui/icons-material";
import { DateComponent, SelectComponent, TextComponent } from "../assessment-dashboard/inputs";
import CheckBoxInput from "../form-fields/checkbox-input";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { useFormikContext } from "formik";
import useApiState from "../common/useApiState";
import {
  getZoneByProfile,
  getFinancialYear,
  getSpecialOwnership,
  getOccupancy,
  getSpecialOccupant,
  getRatebaleValueCalculation,
  getConstructiontypes,
  getUsetypeSubusetypeData
} from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import {
  Grid,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";

const AssessmentTable = ({ zoneKey, initialRows = [], disableAddButton = false }) => {

  const lang = useSelector((state) => state.userDetails.lang);
  const { setLoading } = useApiState();
  const [zoneKeys, setZoneKeys] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [specialOwnershipRes, setSpecialOwnershipRes] = useState([]);
  const [finalUseType, setFinalUseType] = useState("");
  const [finalConstructionType, setFinalConstructionType] = useState("");
  const [useTypes, setUseTypes] = useState([]);
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [occupancyTypes, setOccupancyTypes] = useState([]);
  const [specialOccupancyTypes, setSpecialOccupancyTypes] = useState([]);
  const [totalArea, setTotalArea] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const
          [
            zonesRes,
            useTypesRes,
            financialYearRes,
            constructionTypesRes,
            specialOccupantRes,
            specialOwnershipRes,
            occupancyTypesRes,
          ] = await Promise.all([
            getZoneByProfile(),
            getUsetypeSubusetypeData(),
            getFinancialYear(),
            getConstructiontypes(),
            getSpecialOccupant(),
            getSpecialOwnership(),
            getOccupancy(),
          ]);
        setZoneKeys(zonesRes.zoneLst || []);
        setUseTypes(useTypesRes || []);
        setFinancialYear(financialYearRes || []);
        setConstructionTypes(constructionTypesRes.constructionTypeLst || []);
        setSpecialOccupancyTypes(specialOccupantRes.lstSpecialOccupant || []);
        setSpecialOwnershipRes(specialOwnershipRes.lstSpecialOccupant || []);
        setOccupancyTypes(occupancyTypesRes.lstOccupancy);
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

  const { setFieldValue, values } = useFormikContext();

  // initial empty row
  const emptyRow = {
    id: uuidv4(),
    useType: "",
    subUseType: "",
    constructionType: "",
    occupancy: "",
    specialOccupant: "",
    assessmentDate: "",
    areaInSqmt: "",
    rateableValue: "",
    taxAmount: "",
    isToilet: false,
    isIllegal: false,
  };

  const [rows, setRows] = useState([emptyRow]);

  const mapUseType = (name) => useTypes.find((opt) => opt.label === name)?.value || "";
  const mapSubUseType = (name) => {
    for (let u of useTypes) {
      const sub = u.subUseTypeLst.find((s) => s.label === name);
      if (sub) return sub.value;
    }
    return "";
  };
  const mapConstructionType = (name) =>
    constructionTypes.find((opt) => opt.label === name)?.value || "";

  const formatApiDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${dd}/${mm}/${yyyy}`;
    }
    return dateStr;
  };

  const mapOccupancy = (name) => occupancyTypes.find((opt) => opt.label === name)?.value || "";
  const mapSpecialOccupant = (name) => specialOccupancyTypes.find((opt) => opt.label === name)?.value || "";


  const mapApiToRow = (item) => ({
    id: item.propertyDetailsKey || uuidv4(),
    useType: mapUseType(item.useTypeName),
    subUseType: mapSubUseType(item.subuseTypeName),
    constructionType: mapConstructionType(item.constructionTypeName),
    occupancy: mapOccupancy(item.occupancyName),
    specialResidents: mapSpecialOccupant(item.specialOccupantName),
    assessmentDate: formatApiDate(item.assessmentDate) || "",
    areaInSqmt: item.area || "",
    propertyDetailsKey: item.propertyDetailsKey || "",
    rVValue: item.ratableValue || "",
    taxAmount: item.ratableValue || "",
    isToilet: item.toilet === "Y",
    isIllegal: item.permission === "Y",
  });

  // useEffect(() => {
  //   console.log("Mapping API Item:", initialRows);
  //   // if (
  //   //   initialRows.length > 0 &&
  //   //   useTypes.length &&
  //   //   constructionTypes.length &&
  //   //   occupancyTypes.length
  //   // ) {
  //   //   setRows(initialRows.map(mapApiToRow));
  //   // } else if (!initialRows.length && rows.length === 0) {
  //   //   setRows([emptyRow]);
  //   // }
  //   if (initialRows.length > 0) {
  //     setRows(initialRows.map(mapApiToRow));
  //   } else if (!initialRows.length && rows.length === 0) {
  //     setRows([emptyRow]);
  //   }
  // }, [initialRows, useTypes, constructionTypes, occupancyTypes]);

  useEffect(() => {
    if (initialRows.length > 0) {
      const mapped = initialRows.map(mapApiToRow);
      setRows(mapped);
    } else if (!initialRows.length && rows.length === 0) {
      setRows([emptyRow]);
    }
  }, [initialRows, useTypes, constructionTypes, occupancyTypes]);

  // keep Formik in sync
  useEffect(() => {
    setFieldValue("propertyTransactionDetailsVO", rows);
  }, [rows, setFieldValue]);

  const getSubusetypes = (useType) => {
    const subUseTypeList = useTypes
      .filter((item) => item.value === useType)
      .map((item) => item.subUseTypeLst);

    if (subUseTypeList.length === 0) {
      return []; // Or return a more informative default value
    }
    return subUseTypeList[0];
  };

  // Function to remove a row
  const handleRemoveRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
  };
  // Add a new row
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: uuidv4(),
        useType: "",
        subUseType: "",
        constructionType: "",
        occupancy: "",
        specialOccupant: "",
        assessmentDate: "",
        areaInSqmt: "",
        rateableValue: "",
        taxAmount: "",
        isToilet: false,
        isIllegal: false,
      },
    ]);
  };

  const handleAssessmentDetailsInputChange = async (id, field, value) => {
    if (["useType"].includes(field)) {
      setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }
    await handleFieldChange(id, field, value);
  };

  const handleCheckboxChange = (id, name, value) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [name]: value } : row
    );
    setRows(updatedRows);
  };

  const handleFieldChange = async (id, field, value) => {
    // Update the row with the new field value
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value || "" } : row
    );
    setRows(updatedRows);

    // Trigger API call if relevant fields change
    if (["useType", "constructionType", "areaInSqmt"].includes(field)) {
      const updatedRow = updatedRows.find((row) => row.id === id);
      // Ensure all required fields are available for the API call
      if (updatedRow.useType && updatedRow.constructionType && updatedRow.areaInSqmt && zoneKey) {
        try {
          const taxAmount = await fetchTaxAmount(
            updatedRow.useType,
            updatedRow.constructionType,
            updatedRow.areaInSqmt,
            zoneKey,
          );

          const finalRows = updatedRows.map((row) =>
            row.id === id ? { ...row, rVValue: taxAmount } : row
          );
          setRows(finalRows);
        } catch (error) {
          console.error("Error fetching tax amount:", error);
        }
      }
      calculateTotals();
    }
  };

  // Function to make the API call with POST method
  const fetchTaxAmount = async (useType, constructionType, areaInSqmt, zoneKey) => {
    try {
      const body = {
        usetype: useType,
        constructionType: constructionType,
        areaInSqmt: areaInSqmt,
        zoneKey: zoneKey,
      };
      const response = await getRatebaleValueCalculation(body);
      return response.ratableValue;
    } catch (error) {
      return 0;
    }
  };

  const calculateTotals = () => {
    const areaTotal = rows.reduce((sum, row) => sum + (parseFloat(row.areaInSqmt) || 0), 0);
    const taxTotal = rows.reduce((sum, row) => sum + (parseFloat(row.rVValue) || 0), 0);
    // setTotalArea(areaTotal);
    // setTotalTaxAmount(taxTotal);
    setFieldValue("totalArea", areaTotal);
    setFieldValue("totalTaxAmount", taxTotal);
  };

  useEffect(() => {
    calculateTotals();
  }, [rows, setFieldValue]);

  useEffect(() => {
    if (rows.length > 0) {
      // Final UseType logic
      const useTypeValues = [...new Set(rows.map(r => r.useType).filter(Boolean))];
      if (useTypeValues.length === 1) {
        const useType = useTypes.find(u => u.value === useTypeValues[0]);
        const label = useType ? useType.label : "";
        setFinalUseType(label);
        setFieldValue("finalUseType", label);
      } else if (useTypeValues.length > 1) {
        setFinalUseType("मिश्र");
        setFieldValue("finalUseType", "मिश्र");
      } else {
        setFinalUseType("");
        setFieldValue("finalUseType", "");
      }

      // Final ConstructionType logic
      const constructionValues = [...new Set(rows.map(r => r.constructionType).filter(Boolean))];
      if (constructionValues.length === 1) {
        const constructionType = constructionTypes.find(c => c.value === constructionValues[0]);
        const label = constructionType ? constructionType.label : "";
        setFinalConstructionType(label);
        setFieldValue("finalConstructionType", label);
      } else if (constructionValues.length > 1) {
        setFinalConstructionType("मिश्र");
        setFieldValue("finalConstructionType", "मिश्र");
      } else {
        setFinalConstructionType("");
        setFieldValue("finalConstructionType", "");
      }
    }
  }, [rows, useTypes, constructionTypes, setFieldValue]);

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 1, md: 3 },
          m: { xs: 1, md: 3 },
          borderRadius: 4,
          minHeight: "auto",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Paper
            elevation={3}
            sx={{
              width: "100%",
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              textAlign: "left",
            }}
          >

            <Grid container alignItems="flex-start" justifyContent="flex-start">
              <GridRow>
                <FormLabel label={labels.TotalArea[lang]} />
                {/* <FormValue component={<TextInput name="totalArea" value={totalArea} disabled={true} />} /> */}
                <FormValue component={<TextInput name="totalArea" value={values.totalArea} InputProps={{ readOnly: true }} variant="standard" />} />
                <FormLabel label={labels.TotalTaxAmount[lang]} />
                {/* <FormValue component={<TextInput name="totalTaxAmount" value={totalTaxAmount} disabled={true} />} /> */}
                <FormValue component={<TextInput name="totalTaxAmount" value={values.totalTaxAmount} InputProps={{ readOnly: true }} variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.FinalUseType[lang]} />
                <FormValue component={<TextInput name="finalUseType" value={finalUseType} disabled={true} variant="standard" />} />
                <FormLabel label={labels.FinalConstructionType[lang]} />
                <FormValue component={<TextInput name="finalConstructionType" value={finalConstructionType} disabled={true} variant="standard" />} />
              </GridRow>
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <Table
                  sx={{
                    minWidth: "100%",
                    border: 1,
                    borderColor: "grey.300",
                    margin: "auto",
                    width: "90%",
                  }}
                  size="small"
                  aria-label="a dense table"
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#abd9e3", fontWeight: 600 }}>
                      <TableCell>{labels.useType[lang]}</TableCell>
                      <TableCell>{labels.secUseType[lang]}</TableCell>
                      <TableCell align="center">{labels.constructionType[lang]}</TableCell>
                      <TableCell align="center">{labels.Occupancy[lang]}</TableCell>
                      <TableCell align="center">{labels.SpecialResidents[lang]}</TableCell>
                      <TableCell align="center">{labels.aakarniDate[lang]}</TableCell>
                      <TableCell align="center">{labels.areaInMeter[lang]}</TableCell>
                      <TableCell align="center">{labels.taxAmount[lang]}</TableCell>
                      <TableCell align="center">{labels.Toilet[lang]}</TableCell>
                      <TableCell align="center">{labels.Illegal[lang]}</TableCell>
                      <TableCell align="center">{labels.Action[lang]}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "& td": { border: "1px solid grey" },
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <TableCell>
                          <SelectComponent
                            handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "useType", value)}
                            id={row.id}
                            name={`useType`}
                            options={useTypes}
                            value={row.useType || ""}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          {useTypes.length ? (
                            <SelectComponent
                              handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "subUseType", value)}
                              id={row.id}
                              name={`subUseType`}
                              options={getSubusetypes(row.useType)}
                              value={row.subUseType || ""}
                              variant="standard"
                            />
                          ) : (
                            <></>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <SelectComponent
                            handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "constructionType", value)}
                            id={row.id}
                            name={`constructionType`}
                            options={constructionTypes}
                            value={row.constructionType || ""}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <SelectComponent variant="standard"
                            handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "occupancy", value)}
                            id={row.id}
                            name={`occupancy`}
                            options={occupancyTypes}
                            value={row.occupancy || ""}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <SelectComponent
                            handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "specialResidents", value)}
                            id={row.id}
                            name={`specialResidents`}
                            options={specialOccupancyTypes}
                            value={row.specialResidents || ""}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <DateComponent
                            id={row.id}
                            name={`assessmentDate`}
                            value={row.assessmentDate || ""}   // 👈 add this line
                            handleInputChange={(id, name, value) =>
                              handleAssessmentDetailsInputChange(row.id, "assessmentDate", value)
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextComponent id={row.id} name={`areaInSqmt`} value={row.areaInSqmt} handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "areaInSqmt", value)} variant="standard" />
                        </TableCell>
                        <TableCell align="center">
                          <TextComponent id={row.id} name={`taxAmount`} value={row.rVValue || ""} handleInputChange={(id, name, value) => handleAssessmentDetailsInputChange(row.id, "rVValue", value)} variant="standard" />
                        </TableCell>
                        <TableCell align="center">
                          <CheckBoxInput
                            id={row.id}
                            name={`propertyTransactionDetailsVO[${index}].isToilet`}
                            checked={rows[index].isToilet}
                            onChange={(e) =>
                              setFieldValue(
                                `propertyTransactionDetailsVO[${index}].isToilet`,
                                e.target.checked
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <CheckBoxInput
                            id={row.id}
                            name={`propertyTransactionDetailsVO[${index}].isIllegal`}
                            checked={rows[index].isIllegal}
                            onChange={(e) =>
                              setFieldValue(
                                `propertyTransactionDetailsVO[${index}].isIllegal`,
                                e.target.checked
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="center" style={{ display: "none" }}>
                          <TextComponent id={row.id} name={`propertyDetailsKey`} value={row.propertyDetailsKey} />
                        </TableCell>
                        <TableCell align="center">
                          <Button onClick={() => handleRemoveRow(row.id)} endIcon={<RemoveCircleTwoTone />}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!disableAddButton && (
                      <TableRow>
                        <TableCell colSpan={12} align="left">
                          <Button onClick={handleAddRow} startIcon={<Add />} variant="contained" color="primary">Add More</Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default AssessmentTable;