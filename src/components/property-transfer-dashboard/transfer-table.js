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
  saveTransferPropertyDetails,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getApiErrorMessage } from "../../utils/helpers";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";

const TransferTable = ({ transferId, setOpenTransferView }) => {
  const lang = useSelector((state) => state.userDetails.lang) || "ma";

  const handleTransferDetails = async () => {
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

      const dataWithTransfer = {
        transferId: transferId,
        propertyTransferMainId: applicationData?.propertyTransferMainId,
        // newPropertyCode: applicationData?.newPropertyCode,
        newOwnerName: applicationData?.newOwnerName,
        newEngOccupantName: applicationData?.newEngOccupantName,
        newoccupantName: applicationData?.newoccupantName,
        newEngOwnerName: applicationData?.newEngOwnerName,
        newPropertyAddress: applicationData?.newPropertyAddress,
        newDescription: applicationData?.newDescription,
        mobileNo: applicationData?.mobileNo,
        propertyAddress: applicationData?.propertyAddress,
        newEngPropertyAddress: applicationData?.newEngPropertyAddress,
        description: applicationData?.description,
        propertyDetailsROLst: applicationData?.propertyDetailsROLst || [],
        newPropertyTransferDetails: [
          {
            propertyDetailsROLst: newPropertyTransferDetails || [],
          },
        ],
      };

      console.log("Saving split details payload:", dataWithTransfer);

      const res = await saveTransferPropertyDetails(dataWithTransfer);
      //  setResResponce(res);
      if (res?.status === "Success") {
        // setSuccessMessage(res.message || "Data saved successfully!");
        showToastSuccess(res.message || "Data saved successfully!");
        // call back page
        setTimeout(setOpenTransferView(false), 500);
      }
    } catch (error) {
      console.error("Error fetching transfer fees:", error);
      showToastError(getApiErrorMessage(error));

      // showToastError(error);
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
            newDescription: "",
            newOwnerName: "",
            newEngOwnerName: "",
            newEngOccupantName: "",
            newEngPropertyAddress: "",
            newoccupantName: "",
            mobileNo: "",
            // newPropertyCode: "",
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
        // newPropertyCode: applicationData.newPropertyCode,
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
        // newPropertyCode: response.newPropertyCode,
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
                      <Typography fontWeight="bold">मालमत्ता कोड :</Typography>
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
                        <Typography fontWeight="bold">मालकाचे नाव:</Typography>
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
                          {" "}
                          भोगवटधारकाचे नाव:
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
                      <Typography fontWeight="bold">मोबाईल नंबर:</Typography>
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
                      वर्णन:
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
                      पत्ता:
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
                        <Typography fontWeight="bold">मालकाचे नाव:</Typography>
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
                          मालकाचे नाव (इंग्रजी):
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

                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">
                          भोगवटधारकाचे नाव:
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
                          भोगवटधारकाचे नाव (इंग्रजी):
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

                <Grid item xs={12} md={6}>
                  <Typography fontWeight="bold" gutterBottom>
                    पत्ता:
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
                    पत्ता (इंग्रजी):
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
                {/* Row 2: Mobile Number full width */}
                <Grid container item spacing={3} xs={12}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Box minWidth={140}>
                        <Typography fontWeight="bold">मोबाईल नंबर:</Typography>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box m={4} width="100%">
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransferDetails}
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

export default TransferTable;
