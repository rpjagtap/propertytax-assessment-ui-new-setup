import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { Add, RemoveCircleTwoTone } from "@mui/icons-material";
import {
  DateComponent,
  SelectComponent,
  TextComponent,
} from "../assessment-dashboard/inputs";
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
  getUsetypeSubusetypeData,
} from "../../services/assessment-services";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import TableContainer from "@mui/material/TableContainer";

const AssessmentTable = ({
  zoneKey,
  gatKey,
  initialRows = [],
  disableAddButton = false,
}) => {
  const lang = useSelector((state) => state.userDetails?.lang);
  const { setLoading } = useApiState();
  const { setFieldValue, values } = useFormikContext();

  const [zoneKeys, setZoneKeys] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [specialOwnershipRes, setSpecialOwnershipRes] = useState([]);
  const [finalUseType, setFinalUseType] = useState("");
  const [finalConstructionType, setFinalConstructionType] = useState("");
  const [useTypes, setUseTypes] = useState([]);
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [occupancyTypes, setOccupancyTypes] = useState([]);
  const [specialOccupancyTypes, setSpecialOccupancyTypes] = useState([]);

  /*
   * Keep old/new setup compatible.
   * Some new labels may not exist in an older labels file, so never access
   * labels.X[lang] directly for newly introduced labels.
   */
  const getLabel = (key, fallback = "") => {
    const labelObj = labels?.[key];

    if (labelObj && typeof labelObj === "object") {
      return labelObj?.[lang] ?? labelObj?.en ?? fallback;
    }

    if (typeof labelObj === "string") {
      return labelObj;
    }

    return fallback;
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [
          zonesRes,
          useTypesRes,
          financialYearRes,
          constructionTypesRes,
          specialOccupantRes,
          specialOwnershipResponse,
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

        if (!mounted) return;

        setZoneKeys(zonesRes?.zoneLst || []);
        setUseTypes(Array.isArray(useTypesRes) ? useTypesRes : []);
        setFinancialYear(financialYearRes || []);
        setConstructionTypes(
          constructionTypesRes?.constructionTypeLst || []
        );
        setSpecialOccupancyTypes(
          specialOccupantRes?.lstSpecialOccupant || []
        );
        setSpecialOwnershipRes(
          specialOwnershipResponse?.lstSpecialOccupant || []
        );
        setOccupancyTypes(occupancyTypesRes?.lstOccupancy || []);
      } catch (err) {
        if (mounted) {
          showToastError(getErrorMsg(err));
        }
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

  const createEmptyRow = () => ({
    id: uuidv4(),
    useType: "",
    subUseType: "",
    constructionType: "",
    occupancy: "",
    specialResidents: "",
    assessmentDate: "",
    areaType: "",
    areaInSqmt: "",
    rateableValue: "",
    rVValue: "",
    taxAmount: "",
    billRate: "",
    isToilet: false,
    isIllegal: "Y",
    propertyDetailsKey: "",
    floor: "",
  });

  const [rows, setRows] = useState([createEmptyRow()]);

  const mapUseType = (name) =>
    useTypes.find((opt) => opt?.label === name)?.value || "";

  const mapSubUseType = (name) => {
    for (const useType of useTypes) {
      const subList = Array.isArray(useType?.subUseTypeLst)
        ? useType.subUseTypeLst
        : [];

      const sub = subList.find((item) => item?.label === name);

      if (sub) {
        return sub.value;
      }
    }

    return "";
  };

  const mapConstructionType = (name) =>
    constructionTypes.find((opt) => opt?.label === name)?.value || "";

  const mapOccupancy = (name) =>
    occupancyTypes.find((opt) => opt?.label === name)?.value || "";

  const mapSpecialOccupant = (name) =>
    specialOccupancyTypes.find((opt) => opt?.label === name)?.value || "";

  const formatApiDate = (dateStr) => {
    if (!dateStr) return "";

    const parts = String(dateStr).split("/");

    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${dd}/${mm}/${yyyy}`;
    }

    return dateStr;
  };

  const mapApiToRow = (item = {}) => ({
    id: item.propertyDetailsKey || uuidv4(),
    useType: mapUseType(item.useTypeName),
    subUseType: mapSubUseType(item.subuseTypeName),
    constructionType: mapConstructionType(item.constructionTypeName),
    occupancy: mapOccupancy(item.occupancyName),
    specialResidents: mapSpecialOccupant(item.specialOccupantName),
    assessmentDate: formatApiDate(item.assessmentDate),
    areaType: item.areaType || "",
    areaInSqmt: item.area ?? "",
    propertyDetailsKey: item.propertyDetailsKey || "",
    rVValue: item.ratableValue ?? "",
    rateableValue: item.ratableValue ?? "",
    taxAmount: item.ratableValue ?? "",
    billRate: item.billRate ?? item.rate ?? "",
    isToilet: item.toilet === "Y",
    isIllegal: item.permission || "Y",
    floor: item.floor || "",
  });

  const floorOptions = [
    { value: "G", label: "G" },
    ...Array.from({ length: 50 }, (_, index) => ({
      value: String(index + 1),
      label: String(index + 1),
    })),
  ];

  const legalStatusOptions = [
    { value: "Y", label: "Legal" },
    { value: "N", label: "Illegal" },
  ];

  const areaOptions = [
    { value: "चटई क्षेत्रफळ", label: "चटई क्षेत्रफळ" },
    { value: "बांधकाम क्षेत्रफळ", label: "बांधकाम क्षेत्रफळ" },
  ];

  useEffect(() => {
    if (initialRows?.length > 0) {
      setRows(initialRows.map(mapApiToRow));
    } else {
      setRows((currentRows) =>
        currentRows?.length > 0 ? currentRows : [createEmptyRow()]
      );
    }
    // Mapping functions intentionally use the latest API option lists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRows, useTypes, constructionTypes, occupancyTypes, specialOccupancyTypes]);

  // Keep Formik in sync with the complete row state.
  useEffect(() => {
    setFieldValue("propertyTransactionDetailsVO", rows);
  }, [rows, setFieldValue]);

  const getSubusetypes = (useType) => {
    const selectedUseType = useTypes.find(
      (item) => String(item?.value) === String(useType)
    );

    return Array.isArray(selectedUseType?.subUseTypeLst)
      ? selectedUseType.subUseTypeLst
      : [];
  };

  const handleRemoveRow = (id) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    setRows((currentRows) => [...currentRows, createEmptyRow()]);
  };

  const handleAssessmentDetailsInputChange = async (id, field, value) => {
    await handleFieldChange(id, field, value);
  };

  const fetchTaxAmount = async (
    useType,
    subUseType,
    constructionType,
    areaInSqmt,
    currentZoneKey,
    currentGatKey
  ) => {
    try {
      const body = {
        useTypeId: Number(useType),
        subUseTypeId: Number(subUseType),
        connstructionTypeId: Number(constructionType),
        areaInSqmt: Number(areaInSqmt),
        zoneKey: Number(zoneKey),
        gatKey: Number(gatKey),
      };

      console.log("RATE API REQUEST BODY:", body);

      const response = await getRatebaleValueCalculation(body);

      console.log("RATE API RESPONSE:", response);

      return {
        ratableValue: response?.ratableValue ?? 0,
        billRate: response?.rate ?? response?.billRate ?? 0,
      };
    } catch (error) {
      console.error("Error fetching ratable value:", error);

      return {
        ratableValue: 0,
        billRate: 0,
      };
    }
  };

  const calculateTotals = (sourceRows = rows) => {
    const areaTotal = sourceRows.reduce(
      (sum, row) => sum + (parseFloat(row?.areaInSqmt) || 0),
      0
    );

    const taxTotal = sourceRows.reduce(
      (sum, row) => sum + (parseFloat(row?.rVValue) || 0),
      0
    );

    setFieldValue("totalArea", areaTotal);
    setFieldValue("totalTaxAmount", taxTotal);
  };

  const handleFieldChange = async (id, field, value) => {
    let updatedRows = rows.map((row) => {
      if (row.id !== id) return row;

      const updatedRow = {
        ...row,
        [field]: value ?? "",
      };

      /*
       * When Use Type changes, the old Sub Use Type may no longer belong
       * to the selected Use Type. Clear it to avoid sending an invalid
       * combination to the rate API.
       */
      if (field === "useType" && String(row.useType) !== String(value)) {
        updatedRow.subUseType = "";
        updatedRow.rVValue = "";
        updatedRow.billRate = "";
      }

      return updatedRow;
    });

    /*
     * Important:
     * subUseType is also an API dependency. The old new-development code
     * did not trigger the API when subUseType changed.
     */
    const rateFields = [
      "useType",
      "subUseType",
      "constructionType",
      "areaInSqmt",
    ];

    if (rateFields.includes(field)) {
      const updatedRow = updatedRows.find((row) => row.id === id);

      const hasValidRateInputs =
        updatedRow?.useType &&
        updatedRow?.subUseType &&
        updatedRow?.constructionType &&
        updatedRow?.areaInSqmt !== "" &&
        updatedRow?.areaInSqmt !== null &&
        updatedRow?.areaInSqmt !== undefined &&
        zoneKey !== "" &&
        zoneKey !== null &&
        zoneKey !== undefined &&
        gatKey !== "" &&
        gatKey !== null &&
        gatKey !== undefined &&
        Number(updatedRow.areaInSqmt) > 0;

      if (hasValidRateInputs) {
        try {
          const rateData = await fetchTaxAmount(
            updatedRow.useType,
            updatedRow.subUseType,
            updatedRow.constructionType,
            updatedRow.areaInSqmt,
            zoneKey,
            gatKey
          );

          updatedRows = updatedRows.map((row) =>
            row.id === id
              ? {
                ...row,
                rVValue: rateData.ratableValue,
                rateableValue: rateData.ratableValue,
                taxAmount: rateData.ratableValue,
                billRate: rateData.billRate,
              }
              : row
          );
        } catch (error) {
          console.error("Error while calculating rate:", error);
        }
      }
    }

    setRows(updatedRows);
    calculateTotals(updatedRows);
  };

  useEffect(() => {
    calculateTotals(rows);
    // calculateTotals itself uses setFieldValue and rows is the intended trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  useEffect(() => {
    if (!rows.length) {
      setFinalUseType("");
      setFinalConstructionType("");
      setFieldValue("finalUseType", "");
      setFieldValue("finalConstructionType", "");
      return;
    }

    const useTypeValues = [
      ...new Set(rows.map((row) => row?.useType).filter(Boolean)),
    ];

    if (useTypeValues.length === 1) {
      const useType = useTypes.find(
        (item) => String(item?.value) === String(useTypeValues[0])
      );
      const label = useType?.label || "";

      setFinalUseType(label);
      setFieldValue("finalUseType", label);
    } else if (useTypeValues.length > 1) {
      setFinalUseType("मिश्र");
      setFieldValue("finalUseType", "मिश्र");
    } else {
      setFinalUseType("");
      setFieldValue("finalUseType", "");
    }

    const constructionValues = [
      ...new Set(rows.map((row) => row?.constructionType).filter(Boolean)),
    ];

    if (constructionValues.length === 1) {
      const constructionType = constructionTypes.find(
        (item) =>
          String(item?.value) === String(constructionValues[0])
      );
      const label = constructionType?.label || "";

      setFinalConstructionType(label);
      setFieldValue("finalConstructionType", label);
    } else if (constructionValues.length > 1) {
      setFinalConstructionType("मिश्र");
      setFieldValue("finalConstructionType", "मिश्र");
    } else {
      setFinalConstructionType("");
      setFieldValue("finalConstructionType", "");
    }
  }, [rows, useTypes, constructionTypes, setFieldValue]);

  return (
    <Box
      sx={{
        backgroundColor: "rgb(204, 234, 244)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 1, md: 3 },
        m: { xs: 1, md: 3 },
        borderRadius: 4,
        width: "100%",
        boxSizing: "border-box",
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
            boxSizing: "border-box",
          }}
        >
          <Grid
            container
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <GridRow>
              <FormLabel label={getLabel("TotalArea", "Total Area")} />
              <FormValue
                component={
                  <TextInput
                    name="totalArea"
                    value={values?.totalArea ?? ""}
                    InputProps={{ readOnly: true }}
                    variant="standard"
                  />
                }
              />

              <FormLabel
                label={getLabel("TotalTaxAmount", "Total Tax Amount")}
              />
              <FormValue
                component={
                  <TextInput
                    name="totalTaxAmount"
                    value={values?.totalTaxAmount ?? ""}
                    InputProps={{ readOnly: true }}
                    variant="standard"
                  />
                }
              />
            </GridRow>

            <GridRow>
              <FormLabel label={getLabel("FinalUseType", "Final Use Type")} />
              <FormValue
                component={
                  <TextInput
                    name="finalUseType"
                    value={finalUseType}
                    disabled
                    variant="standard"
                  />
                }
              />

              <FormLabel
                label={getLabel(
                  "FinalConstructionType",
                  "Final Construction Type"
                )}
              />
              <FormValue
                component={
                  <TextInput
                    name="finalConstructionType"
                    value={finalConstructionType}
                    disabled
                    variant="standard"
                  />
                }
              />
            </GridRow>

            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1400,
                  border: 1,
                  borderColor: "grey.300",
                  margin: "auto",
                  width: "100%",
                }}
                size="small"
                aria-label="assessment details table"
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "#abd9e3", fontWeight: 600 }}>
                    <TableCell align="center">Floor</TableCell>
                    <TableCell>{getLabel("useType", "Use Type")}</TableCell>
                    <TableCell>
                      {getLabel("secUseType", "Sub Use Type")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("constructionType", "Construction Type")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("Occupancy", "Occupancy")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("SpecialResidents", "Special Residents")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("aakarniDate", "Assessment Date")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("AreaType", "Area Type")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("areaInMeter", "Area")}
                    </TableCell>
                    <TableCell align="center">Bill Rate</TableCell>
                    <TableCell align="center">
                      {getLabel("taxAmount", "Tax Amount")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("Toilet", "Toilet")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("ConstructionStatus", "Construction Status")}
                    </TableCell>
                    <TableCell align="center">
                      {getLabel("Action", "Action")}
                    </TableCell>
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
                      <TableCell align="center">
                        <SelectComponent
                          id={row.id}
                          name="floor"
                          options={floorOptions}
                          value={row.floor || ""}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "floor",
                              value
                            )
                          }
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell>
                        <SelectComponent
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "useType",
                              value
                            )
                          }
                          id={row.id}
                          name="useType"
                          options={useTypes}
                          value={row.useType || ""}
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell>
                        {useTypes.length > 0 ? (
                          <SelectComponent
                            handleInputChange={(id, name, value) =>
                              handleAssessmentDetailsInputChange(
                                row.id,
                                "subUseType",
                                value
                              )
                            }
                            id={row.id}
                            name="subUseType"
                            options={getSubusetypes(row.useType)}
                            value={row.subUseType || ""}
                            variant="standard"
                          />
                        ) : null}
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "constructionType",
                              value
                            )
                          }
                          id={row.id}
                          name="constructionType"
                          options={constructionTypes}
                          value={row.constructionType || ""}
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          variant="standard"
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "occupancy",
                              value
                            )
                          }
                          id={row.id}
                          name="occupancy"
                          options={occupancyTypes}
                          value={row.occupancy || ""}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "specialResidents",
                              value
                            )
                          }
                          id={row.id}
                          name="specialResidents"
                          options={specialOccupancyTypes}
                          value={row.specialResidents || ""}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <DateComponent
                          id={row.id}
                          name="assessmentDate"
                          value={row.assessmentDate || ""}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "assessmentDate",
                              value
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          id={row.id}
                          name="areaType"
                          options={areaOptions}
                          value={row.areaType || ""}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "areaType",
                              value
                            )
                          }
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextComponent
                          id={row.id}
                          name="areaInSqmt"
                          value={row.areaInSqmt ?? ""}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "areaInSqmt",
                              value
                            )
                          }
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextInput
                          name={`billRate_${row.id}`}
                          value={row.billRate ?? ""}
                          InputProps={{ readOnly: true }}
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextComponent
                          id={row.id}
                          name="taxAmount"
                          value={row.rVValue ?? ""}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "rVValue",
                              value
                            )
                          }
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <CheckBoxInput
                          id={row.id}
                          name={`propertyTransactionDetailsVO[${index}].isToilet`}
                          checked={Boolean(row.isToilet)}
                          onChange={(e) => {
                            const checked = e.target.checked;

                            setRows((currentRows) =>
                              currentRows.map((currentRow) =>
                                currentRow.id === row.id
                                  ? {
                                    ...currentRow,
                                    isToilet: checked,
                                  }
                                  : currentRow
                              )
                            );
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <SelectComponent
                          id={row.id}
                          name="isIllegal"
                          options={legalStatusOptions}
                          value={row.isIllegal ?? "Y"}
                          handleInputChange={(id, name, value) =>
                            handleAssessmentDetailsInputChange(
                              row.id,
                              "isIllegal",
                              value
                            )
                          }
                          variant="standard"
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{ display: "none" }}
                      >
                        <TextComponent
                          id={row.id}
                          name="propertyDetailsKey"
                          value={row.propertyDetailsKey || ""}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          onClick={() => handleRemoveRow(row.id)}
                          endIcon={<RemoveCircleTwoTone />}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!disableAddButton && (
                    <TableRow>
                      <TableCell colSpan={15} align="left">
                        <Button
                          onClick={handleAddRow}
                          startIcon={<Add />}
                          variant="contained"
                          color="primary"
                        >
                          Add More
                        </Button>
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
  );
};

export default AssessmentTable;