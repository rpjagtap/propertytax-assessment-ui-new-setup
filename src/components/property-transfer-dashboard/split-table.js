import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  Grid,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import {
  getSplitUseTypePropertyDetails,
  postSplitPropertyDetails,
  saveSplitPropertyDetails,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { getApiErrorMessage } from "../../utils/helpers";
const SplitTable = ({ transferId, setOpenSplitView }) => {
  const lang = useSelector((state) => state.userDetails.lang);

  const handleSplitDetails = async () => {
    try {
      const cleanedPropertyDetailsROLst = (
        applicationData?.propertyDetailsROLst || []
      ).map((item) => ({
        ...item,
        reducedArea: item?.reducedArea ? Number(item.reducedArea) : null,
        areaAfterPartition: item?.areaAfterPartition
          ? Number(item.areaAfterPartition)
          : null,
        ratableValueSumAfterPartition: item?.ratableValueSumAfterPartition
          ? Number(item.ratableValueSumAfterPartition)
          : null,
      }));

      const cleanedNewPropertyTransferDetails = (
        newPropertyTransferDetails || []
      ).map((item) => ({
        ...item,
        reducedArea: item?.reducedArea ? Number(item.reducedArea) : null,
        areaAfterPartition: item?.areaAfterPartition
          ? Number(item.areaAfterPartition)
          : null,
        ratableValueSumAfterPartition: item?.ratableValueSumAfterPartition
          ? Number(item.ratableValueSumAfterPartition)
          : null,
      }));

      const dataWithSplit = {
        transferId: transferId,
        propertyTransferMainId: applicationData?.propertyTransferMainId,
        newPropertyCode: applicationData?.newPropertyCode,
        newOwnerName: applicationData?.newOwnerName,
        newEngOwnerName: applicationData?.newEngOwnerName,
        newoccupantName: applicationData?.newoccupantName,
        newEngOccupantName: applicationData?.newEngOccupantName,
        newPropertyAddress: applicationData?.newPropertyAddress,
        newEngPropertyAddress: applicationData?.newEngPropertyAddress,
        newDescription: applicationData?.newDescription,
        mobileNo: applicationData?.mobileNo,
        propertyAddress: applicationData?.propertyAddress,
        ownerName: applicationData?.ownerName,
        occupantName: applicationData?.occupantName,
        description: applicationData?.description,

        propertyDetailsROLst: applicationData?.propertyDetailsROLst || [],
        newPropertyTransferDetails: [
          {
            propertyDetailsROLst: newPropertyTransferDetails || [],
          },
        ],
      };

      console.log("Saving split details payload:", dataWithSplit);

      const res = await saveSplitPropertyDetails(dataWithSplit);
      //  setResResponce(res);
      if (res?.status === "Success") {
        // setSuccessMessage(res.message || "Data saved successfully!");
        showToastSuccess(res.message || "Data saved successfully!");
        // call back page
        setTimeout(setOpenSplitView(false), 500);
      }
    } catch (error) {
      console.error("Error fetching transfer fees:", error);
      showToastError(getApiErrorMessage(error));
    } finally {
      // setLoading(false);
    }
  };

  const [applicationData, setApplicationData] = useState(null);
  const [editRows, setEditRows] = useState({}); // track which row is editable
  const [newPropertyTransferDetails, setNewPropertyTransferDetails] = useState(
    []
  ); // track which row is
  useEffect(() => {
    (async () => {
      const response = await getSplitUseTypePropertyDetails({ transferId });

      if (response?.propertyDetailsROLst) {
        if (response?.newPropertyTransferDetails)
          setNewPropertyTransferDetails(
            response?.newPropertyTransferDetails[0]?.propertyDetailsROLst || []
          );

        if (!response?.flag) {
          const updatedList = response.propertyDetailsROLst.map((item) => ({
            ...item,
            reducedArea: "",
            areaAfterPartition: "",
            ratableValueSumAfterPartition: "",
          }));
          setApplicationData({
            ...response,
            propertyDetailsROLst: updatedList,
            newPropertyAddress: "",
            newEngPropertyAddress: "",
            newDescription: "",
            newOwnerName: "",
            newEngOwnerName: "",
            newoccupantName: "",
            newEngOccupantName: "",
            mobileNo: "",
            newPropertyCode: "",
          });
        } else {
          setApplicationData({
            ...response,
            propertyDetailsROLst: response.propertyDetailsROLst,
            // newPropertyAddress: "",
            // newDescription: "",
            // newOwnerName: "",
            // newoccupantName: "",
            // mobileNo: "",
            // newPropertyCode: "",
          });
        }
      }
    })();
  }, [transferId]);
  const splitCalculate = async () => {
    try {
      // Filter only checked rows (where checkbox is true in editRows)
      const filteredDetails = applicationData.propertyDetailsROLst
        .map((item, index) => ({ ...item, index }))
        .filter((item) => editRows[item.index]);

      if (filteredDetails.length === 0) {
        alert("कृपया किमान एक पंक्ती निवडा");
        return;
      }
      // set porpty code to new code

      const invalidRow = filteredDetails.find(
        (item) => Number(item.reducedArea || 0) > Number(item.area || 0)
      );

      if (invalidRow) {
        showToastError("कमी केलेले क्षेत्रफळ मूळ क्षेत्रफळापेक्षा जास्त आहे.");
        return;
      }

      const body = {
        transferId: applicationData.transferId,
        zoneKey: applicationData.zoneKey,
        newPropertyCode: applicationData.newPropertyCode,
        propertyTransferMainId: applicationData.propertyTransferMainId,

        propertyDetailsROLst: filteredDetails.map((item) => ({
          useTypeName: item.useTypeName,
          constructionTypeName: item.constructionTypeName,
          ratableValue: item.ratableValue,
          area: item.area,
          subuseTypeName: item.subuseTypeName,
          reducedArea: parseFloat(item.reducedArea) || 0,
          propertyTransferMainDetailsId: item.propertyTransferMainDetailsId,
        })),
      };

      const response = await postSplitPropertyDetails(body);

      if (response?.code == "4001") {
        showToastError(response?.message);
      }
      setNewPropertyTransferDetails(
        response?.newPropertyTransferDetails[0]?.propertyDetailsROLst || []
      );
      setApplicationData((prev) => ({
        ...prev,
        newPropertyCode: response.newPropertyCode,
      }));

      const updatedList = applicationData.propertyDetailsROLst.map((item) => {
        // Find matching record in oldPropertyTransferDetails based on propertyTransferMainDetailsId
        const matchingOldDetail = response.oldPropertyTransferDetails
          .flatMap((detail) => detail.propertyDetailsROLst)
          .find(
            (oldItem) =>
              oldItem.propertyTransferMainDetailsId ===
              item.propertyTransferMainDetailsId
          );

        if (matchingOldDetail) {
          return {
            ...item,
            areaAfterPartition: matchingOldDetail.areaAfterPartition,
            ratableValueSumAfterPartition:
              matchingOldDetail.ratableValueSumAfterPartition,
          };
        }

        return item;
      });

      setApplicationData((prev) => ({
        ...prev,
        propertyDetailsROLst: updatedList,
      }));
    } catch (error) {
      showToastError(error?.message);
      console.error("Error in splitCalculate:", error);
    }
  };
  const handleCheckboxToggle = (index) => {
    setEditRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleReducedAreaChange = (index, value) => {
    const updated = { ...applicationData };
    updated.propertyDetailsROLst[index].reducedArea = value;
    setApplicationData(updated);
  };

  // const handleReducedAreaChange = (index, value) => {
  //   setApplicationData((prevData) => {
  //     const updatedList = [...prevData.propertyDetailsROLst];

  //     const reducedValue = parseFloat(value) || 0;
  //     const currentArea = parseFloat(updatedList[index]?.area) || 0;
  //     const currentRatableValue =
  //       parseFloat(updatedList[index]?.ratableValue) || 0;

  //     // calculate both updated values automatically
  //     const areaAfterPartition = currentArea - reducedValue;
  //     const ratableValueSumAfterPartition = currentRatableValue - reducedValue;

  //     updatedList[index] = {
  //       ...updatedList[index],
  //       reducedArea: value,
  //       areaAfterPartition: areaAfterPartition > 0 ? areaAfterPartition : 0,
  //       ratableValueSumAfterPartition:
  //         ratableValueSumAfterPartition > 0 ? ratableValueSumAfterPartition : 0,
  //     };

  //     return { ...prevData, propertyDetailsROLst: updatedList };
  //   });
  // };

  // Assuming newPropertyTransferDetails is your state
  // const handleRatableValueChange = (index, appindex, value) => {
  //   setNewPropertyTransferDetails((prevDetails) => {
  //     const updated = [...prevDetails];
  //     const item = { ...updated[index] };

  //     // allow typing freely
  //     item.ratableValue = value;

  //     // calculate difference only if value is numeric
  //     const original = Number(item.ratableValue) || 0;
  //     const entered = Number(value);

  //     if (!isNaN(entered)) {
  //       item.ratableValueSumAfterPartition = original - entered;
  //     } else {
  //       item.ratableValueSumAfterPartition = original; // reset if not number
  //     }

  //     updated[index] = item;
  //     return updated;
  //   });

  //   // now also update in main applicationData list if needed
  //   setApplicationData((prev) => {
  //     if (!prev) return prev;
  //     const updatedList = [...prev.propertyDetailsROLst];
  //     if (updatedList[appindex]) {
  //       updatedList[appindex].ratableValueSumAfterPartition =
  //         Number(updatedList[appindex].ratableValue) - (Number(value) || 0);
  //     }
  //     return { ...prev, propertyDetailsROLst: updatedList };
  //   });
  // };

  const handleRatableValueChange = (newIndex, value) => {
    setNewPropertyTransferDetails((prevDetails) => {
      const updated = [...prevDetails];
      updated[newIndex] = {
        ...updated[newIndex],
        ratableValue: value,
      };
      return updated;
    });

    setApplicationData((prev) => {
      if (!prev) return prev;

      const updatedList = prev.propertyDetailsROLst.map((row) => {
        const newRow = newPropertyTransferDetails[newIndex];

        if (
          row.propertyTransferMainDetailsId ===
          newRow.propertyTransferMainDetailsId
        ) {
          const original = Number(row.ratableValue) || 0;
          const entered = Number(value) || 0;

          return {
            ...row,
            ratableValueSumAfterPartition: original - entered,
          };
        }

        return row;
      });

      return { ...prev, propertyDetailsROLst: updatedList };
    });
  };

  const handleChange = (e) => {
    setApplicationData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
      }}
    >
      {/* <Typography variant="h6" align="center" gutterBottom>
        Transfer Split Details
      </Typography> */}

      <Typography
        variant="h5"
        fontWeight="bolder"
        align="center"
        paddingBottom={5}
        // color="primary"
        // letterSpacing={1}
      >
        {labels?.oldPropertyDetails?.[lang] || ""}
      </Typography>

      {!applicationData ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {/* Optional for debug */}
          {/* <pre>{JSON.stringify(applicationData, null, 2)}</pre> */}

          <Box
            sx={
              {
                // height: "100vh", // full viewport height
                // display: "flex",
                // justifyContent: "center", // center horizontally
                // alignItems: "center", // center vertically
                // backgroundColor: "#f5f5f5", // optional background
              }
            }
          >
            <Paper
              elevation={3}
              sx={{
                width: "90%",
                padding: 5,
                marginLeft: "1.5%",
              }}
            >
              <Grid container spacing={3}>
                {/* Row 1: Property Code full width */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Box minWidth={140}>
                      <Typography fontWeight="bold">
                        {labels.propertyCode[lang]}:
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth={false}
                      variant="standard"
                      size="small"
                      value={applicationData.propertyCode || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          propertyCode: e.target.value,
                        })
                      }
                      sx={{ width: "35.5%" }}
                    />
                  </Box>
                </Grid>

                {/* Row 2: Owner Name and Occupant Name side by side */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {" "}
                          {labels.ownerName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.ownerName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            ownerName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {labels.occupantName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.occupantName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            occupantName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Row 3: Mobile Number full width */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Box minWidth={140}>
                      <Typography fontWeight="bold">
                        {labels.propertyMobileNo[lang]}:
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth={false}
                      variant="standard"
                      size="small"
                      value={applicationData.propertyMobileNo || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          propertyMobileNo: e.target.value,
                        })
                      }
                      sx={{ width: "35.5%" }}
                    />
                  </Box>
                </Grid>

                {/* Row 4: Description and Address side by side */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight="bold" gutterBottom>
                      {labels.description[lang]}:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      // name="description"
                      value={applicationData.description || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          description: e.target.value,
                        })
                      }
                      placeholder="वर्णन लिहा"
                      variant="outlined"
                      sx={{
                        "& textarea": {
                          resize: "vertical",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography fontWeight="bold" gutterBottom>
                      {labels.propertyAddress[lang]}:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      // name="propertyAddress"
                      value={applicationData.propertyAddress || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          propertyAddress: e.target.value,
                        })
                      }
                      placeholder="पत्ता लिहा"
                      variant="outlined"
                      sx={{
                        "& textarea": {
                          resize: "vertical",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Typography
            variant="h5"
            fontWeight="bolder"
            align="center"
            paddingBottom={2}
            paddingTop={2}
            // color="primary"
            // letterSpacing={1}
          >
            {labels?.newPropertyDetails?.[lang] || ""}
          </Typography>

          <Box
            sx={
              {
                // height: "100vh", // full viewport height
                // display: "flex",
                // justifyContent: "center", // center horizontally
                // alignItems: "center", // center vertically
                // backgroundColor: "#f5f5f5", // optional background
              }
            }
          >
            <Paper
              elevation={3}
              sx={{
                width: "90%",
                padding: 5,
                marginLeft: "1.5%",
              }}
            >
              <Grid container spacing={3}>
                {/* Row 1: Owner Name and Occupant Name side by side */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {" "}
                          {labels.newOwnerName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.newOwnerName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            newOwnerName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {labels.newEngOwnerName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.newEngOwnerName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            newEngOwnerName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* row 2: occupantName in english and marathi  */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {labels.newoccupantName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.newoccupantName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            newoccupantName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          {labels.newEngOccupantName[lang]}:
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        variant="standard"
                        size="small"
                        value={applicationData.newEngOccupantName || ""}
                        onChange={(e) =>
                          setApplicationData({
                            ...applicationData,
                            newEngOccupantName: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>
                {/* Row 2: Mobile Number full width */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Box minWidth={140}>
                      <Typography fontWeight="bold">
                        {" "}
                        {labels.mobileNo[lang]}:
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth={false}
                      variant="standard"
                      size="small"
                      value={applicationData.mobileNo || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          mobileNo: e.target.value,
                        })
                      }
                      sx={{ width: "35.5%" }}
                    />
                  </Box>
                </Grid>

                {/* Row 3: Description and Address side by side */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight="bold" gutterBottom>
                      {labels.newPropertyAddress[lang]}:{" "}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      name="newPropertyAddress"
                      value={applicationData.newPropertyAddress}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          newPropertyAddress: e.target.value,
                        })
                      }
                      // onChange={handleChange}
                      placeholder="पत्ता लिहा"
                      variant="outlined"
                      sx={{
                        "& textarea": {
                          resize: "vertical",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight="bold" gutterBottom>
                      {labels.newEngPropertyAddress[lang]}:{" "}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      name="newEngPropertyAddress"
                      value={applicationData.newEngPropertyAddress}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          newEngPropertyAddress: e.target.value,
                        })
                      }
                      // onChange={handleChange}
                      placeholder="पत्ता लिहा"
                      variant="outlined"
                      sx={{
                        "& textarea": {
                          resize: "vertical",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight="bold" gutterBottom>
                      वर्णन:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      name="newDescription"
                      value={applicationData.newDescription || ""}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          newDescription: e.target.value,
                        })
                      }
                      placeholder="वर्णन लिहा"
                      variant="outlined"
                      sx={{
                        "& textarea": {
                          resize: "vertical",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          <Typography
            variant="h5"
            fontWeight="bolder"
            align="center"
            paddingBottom={1}
            paddingTop={3}
            // color="primary"
            // letterSpacing={1}
          >
            {labels?.propertyTransferDetails?.[lang] || ""}
          </Typography>

          <Box sx={{ mt: 2, overflowX: "auto" }} width="100%">
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table
                size="small"
                stickyHeader
                sx={{
                  borderCollapse: "collapse",
                  tableLayout: "fixed", // Ensures equal spacing for all columns
                  width: "100%", // Ensures it stretches full width
                }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      "अ.क्र.",
                      "वापर",
                      "उपवापर",
                      "बांधकाम प्रकार",
                      "क्षेत्रफळ",
                      "करयोग्य रक्कम",
                      "नवीन क्षेत्रफळ",
                      "नवीन करयोग्य रक्कम",
                      "कमी केलेले क्षेत्रफळ",
                      "कमी करायचे?",
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          fontWeight: 600,
                          textAlign: "center",
                          padding: "4px",
                          letterSpacing: 0,
                          border: "1px solid #ccc",
                          backgroundColor: "#abd9e3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {applicationData?.propertyDetailsROLst?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item.useTypeName}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item.subuseTypeName}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item.constructionTypeName}
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item.area}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item.ratableValue}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item?.areaAfterPartition || "-"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {item?.ratableValueSumAfterPartition || "-"}
                      </TableCell>

                      {/* <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {editRows[index] ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            value={
                              item.ratableValueSumAfterPartition !== undefined
                                ? item.ratableValueSumAfterPartition
                                : item.ratableValue
                            }
                            sx={{ width: "100px" }}
                            onChange={(e) =>
                              handleRatableValueChange(index, e.target.value)
                            }
                          />
                        ) : item.ratableValueSumAfterPartition !== undefined ? (
                          item.ratableValueSumAfterPartition
                        ) : (
                          "-"
                        )}
                      </TableCell> */}

                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        {editRows[index] ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            value={item.reducedArea}
                            onChange={(e) =>
                              handleReducedAreaChange(index, e.target.value)
                            }
                            sx={{ width: "80px" }}
                          />
                        ) : (
                          item.reducedArea || "-"
                        )}
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "4px" }}>
                        <Checkbox
                          checked={!!editRows[index]}
                          onChange={() => handleCheckboxToggle(index)}
                          color="primary"
                          sx={{ padding: 0 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Button variant="contained" color="primary" onClick={splitCalculate}>
            Split & calculate
          </Button>

          <Box m={4} width="100%">
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                // color: "#2e7d32",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bolder"
                align="center"
                paddingBottom={1}
                paddingTop={3}
                // color="primary"
                // letterSpacing={1}
              >
                {labels?.propertySplitDetails?.[lang] || ""}
              </Typography>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography
                    fontWeight="medium"
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: "100px",
                      marginLeft: "3%",
                    }}
                  >
                    मालमत्ता कोड
                  </Typography>
                  <TextField
                    name="newPropertyCode"
                    value={applicationData.newPropertyCode || ""}
                    // onChange={handleChange}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        newPropertyCode: e.target.value,
                      })
                    }
                    placeholder="Enter new property code"
                    variant="outlined"
                    size="small"
                    sx={{ flex: 1, maxWidth: "200px" }}
                  />
                </Box>
              </Grid>
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table
                size="small"
                stickyHeader
                sx={{
                  borderCollapse: "collapse",
                }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      "वापर",
                      "उपवापर",
                      "बांधकाम प्रकार",
                      "क्षेत्रफळ (sq.ft)",
                      "करयोग्य रक्कम",
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          fontWeight: 600,
                          textAlign: "center",
                          padding: 1,
                          border: "1px solid #ccc",
                          backgroundColor: "#abd9e3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {newPropertyTransferDetails.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        {row.useTypeName}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        {row.subuseTypeName}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        {row.constructionTypeName}
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        {row.area}
                      </TableCell>
                      {/* <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        {row.ratableValue}
                      </TableCell> */}

                      {/* <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        <TextField
                          variant="outlined"
                          size="small"
                          defaultValue="" // blank initially
                          sx={{ width: "100px" }}
                          onChange={(e) =>
                            handleRatableValueSubtract(index, e.target.value)
                          }
                        />
                      </TableCell> */}

                      <TableCell sx={{ textAlign: "center", padding: 1 }}>
                        <TextField
                          variant="outlined"
                          size="small"
                          value={row.ratableValue ?? ""}
                          sx={{ width: "100px" }}
                          onChange={(e) => {
                            const index2 =
                              applicationData?.propertyDetailsROLst?.findIndex(
                                (item2) =>
                                  item2.useTypeName === row.useTypeName &&
                                  item2.subuseTypeName === row.subuseTypeName
                              );

                            handleRatableValueChange(
                              index,
                              // index2,
                              e.target.value
                            );
                          }}
                          //disabled={!editRows[index]} // only editable if checkbox checked
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSplitDetails}
              >
                Save
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SplitTable;
