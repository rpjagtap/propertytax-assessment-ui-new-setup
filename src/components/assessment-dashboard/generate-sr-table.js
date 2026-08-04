/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
// import Loader from "../loader/loader";
import {
  Alert,
  Button,
  Divider,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import { RenderTableHead } from "../common/table";
import "./styles.css"; // Import the custom CSS
import { DateComponent, SelectComponent, TextComponent } from "./inputs";
import {
  Add,
  ArrowBack,
  Delete,
  Edit,
  Gavel,
  PictureAsPdf,
  Schema,
} from "@mui/icons-material";
import {
  getConstructiontypes,
  getRatebaleValueCalculation,
  getUsetypeSubusetypeData,
  revertApplications,
} from "../../services/assessment-services";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { UpdateAddress } from "./update-address";
import HearingModal from "../hearing-modal";
import ApplicationWorkflow from "../application-workflow";
import { TruncatedText } from "../common/truncated-text";

const GenerateSRTable = ({
  data,
  handleBackClick,
  stage,
  resetData,
  zoneKey,
}) => {
  // const [isSelectAll, setIsSelectAll] = useState(false);
  const [requiredReasonIds, setRequiredReasonIds] = useState([]);
  const [openModalId, setOpenModalId] = useState("");
  const [addressToUpdate, setAddressToUpdate] = useState("");
  const [openHearingModalId, setOpenHearingModalId] = useState("");
  const [openWorkflowModalId, setOpenWorkflowModalId] = useState("");

  const [useTypes, setUseTypes] = useState([]);
  const [constructionTypes, setConstructionTypes] = useState([]);

  const [pendingAppsData, setPendingAppsData] = useState({
    ...data,
    assessmentFormVOLst: data.assessmentFormVOLst, //.slice(0, 4),
  });

  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError, success, setSuccess } =
    useApiState();
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [useTypesRes, constructionTypesRes] = await Promise.all([
          getUsetypeSubusetypeData(),
          getConstructiontypes(),
        ]);
        setUseTypes(useTypesRes);
        setConstructionTypes(constructionTypesRes.constructionTypeLst);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // // Handle individual checkbox
  // const handleCheckboxChange = (assessmentId) => {
  //     setIsSelectAll(false);
  //     const newData = pendingAppsData.assessmentFormVOLst.map(
  //         (item, index) => {
  //             if (item.assessmentId === assessmentId) {
  //                 return {
  //                     ...item,
  //                     chkSelect: !item.chkSelect,
  //                 };
  //             }

  //             return item;
  //         }
  //     );
  //     setPendingAppsData({
  //         ...pendingAppsData,
  //         assessmentFormVOLst: newData,
  //     });
  // };

  // // Handle all checkbox
  // const handleSelectAll = (e) => {
  //     const checked = e.target.checked;
  //     setIsSelectAll(checked);
  //     const newData = pendingAppsData.assessmentFormVOLst.map(
  //         (item, index) => {
  //             return {
  //                 ...item,
  //                 chkSelect: checked,
  //             };
  //         }
  //     );
  //     setPendingAppsData({
  //         ...pendingAppsData,
  //         assessmentFormVOLst: newData,
  //     });
  // };

  const handleAssessmentInputChange = (id, field, value) => {
    if (field === "acceptOrReject") {
      if (value === "Reject") {
        setRequiredReasonIds((prevData) => {
          const uniqueIds = new Set([...prevData, id]);
          return [...uniqueIds];
        });
      } else {
        setRequiredReasonIds(
          requiredReasonIds.filter((itemId) => itemId !== id),
        );
      }
    }
    setPendingAppsData((prevData) => ({
      ...prevData,
      assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) =>
        item.assessmentId === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const rvCalculationApi = async (
    matchedAssessmentFormDetails,
    field,
    value,
    id,
  ) => {
    try {
      setLoading(true);
      const res = await getRatebaleValueCalculation({
        ...matchedAssessmentFormDetails,
        assessmentDetailId: checkForNewWord(
          matchedAssessmentFormDetails.assessmentDetailId,
        )
          ? 0
          : matchedAssessmentFormDetails.assessmentDetailId,
        [field]: value,
        zoneKey,
      });

      setPendingAppsData((prevData) => ({
        ...prevData,
        assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) => ({
          ...item,
          assessmentFormDetailsVOLst: item.assessmentFormDetailsVOLst.map(
            (innerItem) =>
              innerItem.assessmentDetailId === id ? { ...res } : innerItem,
          ),
        })),
      }));
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  function checkForNewWord(str) {
    if (typeof str === "string") {
      // Convert the string to lowercase for case-insensitive matching
      const lowerCaseStr = str.toLowerCase();

      // Check if the string contains the word "new"
      return lowerCaseStr.includes("new");
    } else {
      return false;
    }
  }

  function areAllKeysPresentAndHasValue(data, requiredKeys) {
    for (const key of requiredKeys) {
      if (
        !data.hasOwnProperty(key) ||
        data[key] === undefined ||
        data[key] === null ||
        data[key] === ""
      ) {
        return false;
      }
    }
    return true;
  }

  // Reusable functions
  const findAssessmentFormDetails = (data, id) => {
    return data.assessmentFormVOLst.find((outerItem) =>
      outerItem.assessmentFormDetailsVOLst.some(
        (innerItem) => innerItem.assessmentDetailId === id,
      ),
    );
  };

  const findMatchedIdDetails = (matchedElement, id) => {
    return matchedElement.assessmentFormDetailsVOLst.find(
      (innerItem) => innerItem.assessmentDetailId === id,
    );
  };

  const updateData = (id, field, value) => {
    setPendingAppsData((prevData) => ({
      ...prevData,
      assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) => ({
        ...item,
        assessmentFormDetailsVOLst: item.assessmentFormDetailsVOLst.map(
          (innerItem) =>
            innerItem.assessmentDetailId === id
              ? { ...innerItem, [field]: value }
              : innerItem,
        ),
      })),
    }));
  };

  const updateDataWithEmptyValue = (id, field, value) => {
    setPendingAppsData((prevData) => ({
      ...prevData,
      assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) => ({
        ...item,
        assessmentFormDetailsVOLst: item.assessmentFormDetailsVOLst.map(
          (innerItem) =>
            innerItem.assessmentDetailId === id
              ? { ...innerItem, [field]: value, ratableValue: "" }
              : innerItem,
        ),
      })),
    }));
    // Optionally handle empty value error here (e.g., showToastError)
  };

  const handleAssessmentDetailsInputChange = async (
    id,
    field,
    value,
    eventType = "",
  ) => {
    if (value) {
      if (checkForNewWord(id)) {
        const matchedElement = findAssessmentFormDetails(pendingAppsData, id);

        if (matchedElement) {
          const matchedAssessmentFormDetails = findMatchedIdDetails(
            matchedElement,
            id,
          );
          const requiredKeys = ["usetype", "constructionType", "areaInSqmt"];
          if (
            areAllKeysPresentAndHasValue(
              matchedAssessmentFormDetails,
              requiredKeys,
            )
          ) {
            rvCalculationApi(matchedAssessmentFormDetails, field, value, id);
          } else {
            updateData(id, field, value);
          }
        }
      } else {
        if (["constructionType", "usetype", "areaInSqmt"].includes(field)) {
          const matchedElement = findAssessmentFormDetails(pendingAppsData, id);

          if (matchedElement) {
            const matchedAssessmentFormDetails = findMatchedIdDetails(
              matchedElement,
              id,
            );
            if (field === "areaInSqmt" && eventType === "onChange") {
              updateData(id, field, value);
            } else {
              rvCalculationApi(matchedAssessmentFormDetails, field, value, id);
            }
          }
        } else {
          updateData(id, field, value);
        }
      }
    } else {
      updateDataWithEmptyValue(id, field, value);
      // showToastError("Empty value not allowed")
    }
  };

  const getSubusetypes = (useType) => {
    // Combine filtering and mapping into a single step for efficiency
    const subUseTypeList = useTypes
      .filter((item) => item.value === useType)
      .map((item) => item.subUseTypeLst);

    // Handle potential cases where no matching useType is found
    if (subUseTypeList.length === 0) {
      // Return an empty array or a default value to indicate no results
      return []; // Or return a more informative default value
    }

    // Return the first subUseTypeLst if there's at least one match
    return subUseTypeList[0];
  };

  const handleGenerateClick = async (e) => {
    e.preventDefault();

    const isRemarkEmpty = pendingAppsData.assessmentFormVOLst.some(
      (item) =>
        item.acceptOrReject === "Reject" &&
        (!item.remark || item.remark === ""),
    );

    if (isRemarkEmpty) {
      showToastError("Please check required fields..");
    } else {
      const body = {
        requestId: "Req-1",
        channelName: pendingAppsData.channelName || "",
        assessmentFormVOLst: pendingAppsData.assessmentFormVOLst.map((item) => {
          return {
            addressDetails: item.addressDetails,
            revertFormVO: {
              revertAction: item.acceptOrReject,
              remark: item.remark,
            },
            assessmentId: item.assessmentId,
            ownerName: item.ownerName,
            mobileNo: item.mobileNo,
            assessmentFormDetailsVOLst: item.assessmentFormDetailsVOLst.map(
              (innerItem) => {
                return {
                  assessmentDetailId: innerItem.assessmentDetailId,
                  usetype: innerItem.usetype,
                  areaInSqmt: innerItem.areaInSqmt,
                  subusetype: innerItem.subusetype,
                  constructionType: innerItem.constructionType,
                  assessmentDate: innerItem.assessmentDate,
                  ratableValue: innerItem.ratableValue,
                  isDeleted: innerItem.isDeleted,
                  isNew: innerItem?.isNew ? true : false,
                };
              },
            ),
          };
        }),
      };

      try {
        setLoading(true);
        const res = await revertApplications(body);
        showToastSuccess("Success");
        setTimeout(() => {
          // window.location.reload();
          resetData();
        }, 2000);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    }
  };

  const isRequiredRemark = (assessmentId) => {
    return requiredReasonIds.includes(assessmentId);
  };

  const handleOpen = (assessmentId) => {
    const addressData = pendingAppsData.assessmentFormVOLst.filter(
      (item) => item.assessmentId === assessmentId,
    );
    setOpenModalId(assessmentId);
    setAddressToUpdate(addressData);
  };

  const handleOpenHearingModal = (assessmentId) => {
    setOpenHearingModalId(assessmentId);
  };

  const handleOpenWorkflowModal = (assessmentId) => {
    setOpenWorkflowModalId(assessmentId);
  };

  const handleUpdateAddress = (data) => {
    const marathiAdress = data.find((item) => item.languageType === "Marathi");
    const {
      flatNo,
      floorMarathi,
      towerNameMarathi,
      societyNameMarathi,
      wingNameMarathi,
      landmarkMarathi,
      villageMarathi,
      pinCode,
    } = marathiAdress;
    const updatedAddressData = pendingAppsData.assessmentFormVOLst.map(
      (item) => {
        if (item.assessmentId === openModalId) {
          return {
            ...item,
            addressDetails: data,
            propertyAddressMarathi: `${flatNo}, ${floorMarathi}, ${towerNameMarathi}, ${societyNameMarathi}, ${wingNameMarathi}, ${landmarkMarathi}, ${villageMarathi}, ${pinCode}`,
          };
        }

        return item;
      },
    );

    setPendingAppsData({
      ...pendingAppsData,
      assessmentFormVOLst: updatedAddressData,
    });
    setOpenModalId("");
    setAddressToUpdate("");
  };

  const isEditable = (edit) => {
    return edit === "N";
  };

  const handleDeleteInnerTableRow = (id) => {
    setPendingAppsData((prevData) => ({
      ...prevData,
      assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) => ({
        ...item,
        assessmentFormDetailsVOLst: item.assessmentFormDetailsVOLst.map(
          (innerItem) =>
            innerItem.assessmentDetailId === id
              ? { ...innerItem, isDeleted: true }
              : innerItem,
        ),
      })),
    }));
  };

  function generateTenDigitRandomNumber() {
    const min = 1000000000; // Minimum 10-digit number
    const max = 9999999999; // Maximum 10-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const handleAddInnerTableRow = () => {
    setPendingAppsData((prevData) => ({
      ...prevData,
      assessmentFormVOLst: prevData.assessmentFormVOLst.map((item) => ({
        ...item,
        assessmentFormDetailsVOLst: [
          ...item.assessmentFormDetailsVOLst,
          {
            assessmentDetailId: "new-" + generateTenDigitRandomNumber(),
            constructionType: "",
            usetype: "",
            subusetype: "",
            areaInSqmt: "",
            assessmentDate: "",
            ratableValue: "",
            rate: "",
            isNew: true,
            isDeleted: false,
          },
        ],
      })),
    }));
  };

  return (
    <Grid>
      {/* {loading && <Loader />} */}
      {error && (
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => {
            setError("");
          }}
        />
      )}

      {openModalId && (
        <UpdateAddress
          setOpenModalId={setOpenModalId}
          data={addressToUpdate[0].addressDetails}
          handleUpdateAddress={handleUpdateAddress}
        />
      )}
      {openHearingModalId && (
        <HearingModal
          setOpenHearingModalId={setOpenHearingModalId}
          assessmentId={openHearingModalId}
        />
      )}
      {openWorkflowModalId && (
        <ApplicationWorkflow
          setOpenWorkflowModalId={setOpenWorkflowModalId}
          assessmentId={openWorkflowModalId}
        />
      )}

      <Grid sx={{ margin: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackClick}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
      </Grid>
      {pendingAppsData?.assessmentFormVOLst.length ? (
        <>
          <Grid>
            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                  border: 1,
                  borderColor: "grey.300",
                }}
                size="small"
                aria-label="a dense table"
              >
                <RenderTableHead
                  thSx={{
                    bgcolor: "#abd9e3",
                    fontWeight: 600,
                  }}
                  trSx={{
                    "& th": {
                      border: "1px solid grey",
                      padding: 0,
                      margin: 0,
                    },
                  }}
                  cells={[
                    labels.SrNo[lang],
                    labels.MalakName[lang],
                    labels.MalakAddress[lang],
                    labels.MobileNo[lang],
                    labels.docs[lang],
                    "",
                    labels.WorkflowHearings[lang],
                    labels.Action[lang],
                    labels.Remark[lang],
                  ]}
                  // handleSelectAll={handleSelectAll}
                  // isSelectAll={isSelectAll}
                />
                <TableBody>
                  {pendingAppsData.assessmentFormVOLst.map((item, index) => {
                    return (
                      <TableRow
                        key={item.assessmentId}
                        sx={{
                          "& td": {
                            border: "1px solid grey",
                          },
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {" "}
                        <TableCell
                          align="center"
                          sx={{
                            minWidth: "10px !important",
                            "&.MuiTableCell-body.table-index": {
                              minWidth: "unset",
                            },
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell align="center">
                          <TextComponent
                            id={item.assessmentId}
                            handleInputChange={handleAssessmentInputChange}
                            name="ownerName"
                            value={item.ownerName}
                            isDisabled={isEditable(item.isEditable)}
                          />
                          <b>
                            {labels.ApplicationNo[lang]} - {item.applicationId}
                          </b>
                        </TableCell>
                        <TableCell align="center">
                          <TextComponent
                            name="propertyAddressMarathi"
                            value={item.propertyAddressMarathi}
                            isDisabled={isEditable(item.isEditable)}
                            multiline
                          />
                          <Button
                            onClick={() => {
                              handleOpen(item.assessmentId);
                            }}
                            endIcon={<Edit />}
                            disabled={isEditable(item.isEditable)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <TextComponent
                            id={item.assessmentId}
                            handleInputChange={handleAssessmentInputChange}
                            name="mobileNo"
                            value={item.mobileNo}
                            isDisabled={isEditable(item.isEditable)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Link
                            href={item.agreementFile}
                            target="_blank"
                            underline="none"
                          >
                            View
                            <PictureAsPdf
                              sx={{ color: "#CC3300", fontSize: "20px" }}
                            />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Table
                            size="small"
                            aria-label="inner-table"
                            sx={{
                              margin: "4px",
                            }}
                          >
                            <RenderTableHead
                              thSx={{
                                bgcolor: "#cbd5d7",
                                fontWeight: 600,
                              }}
                              trSx={{
                                "& th": {
                                  border: "1px solid black",
                                  padding: 0,
                                  margin: 0,
                                },
                              }}
                              cells={[
                                labels.useType[lang],
                                labels.secUseType[lang],
                                labels.constructionType[lang],
                                labels.aakarniDate[lang],
                                labels.areaInMeter[lang],
                                labels.taxAmount[lang],
                                "Delete",
                              ]}
                            />
                            <TableBody>
                              {item.assessmentFormDetailsVOLst
                                .filter((innerItem) => !innerItem.isDeleted)
                                .map((innerItem, innerIndex) => {
                                  return (
                                    <TableRow
                                      key={innerItem.assessmentDetailId}
                                    >
                                      <TableCell>
                                        <SelectComponent
                                          id={innerItem.assessmentDetailId}
                                          handleInputChange={
                                            handleAssessmentDetailsInputChange
                                          }
                                          name={`usetype`}
                                          options={useTypes}
                                          value={innerItem.usetype}
                                          isDisabled={isEditable(
                                            item.isEditable,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {useTypes.length ? (
                                          <SelectComponent
                                            id={innerItem.assessmentDetailId}
                                            handleInputChange={
                                              handleAssessmentDetailsInputChange
                                            }
                                            name={`subusetype`}
                                            options={getSubusetypes(
                                              innerItem.usetype,
                                            )}
                                            value={innerItem.subusetype}
                                            isDisabled={isEditable(
                                              item.isEditable,
                                            )}
                                          />
                                        ) : (
                                          <>""</>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <SelectComponent
                                          id={innerItem.assessmentDetailId}
                                          handleInputChange={
                                            handleAssessmentDetailsInputChange
                                          }
                                          name={`constructionType`}
                                          options={constructionTypes}
                                          value={innerItem.constructionType}
                                          isDisabled={isEditable(
                                            item.isEditable,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <DateComponent
                                          id={innerItem.assessmentDetailId}
                                          handleInputChange={
                                            handleAssessmentDetailsInputChange
                                          }
                                          name={`assessmentDate`}
                                          value={innerItem.assessmentDate}
                                          isDisabled={isEditable(
                                            item.isEditable,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextComponent
                                          id={innerItem.assessmentDetailId}
                                          handleInputChange={
                                            handleAssessmentDetailsInputChange
                                          }
                                          handleOnBlur={
                                            handleAssessmentDetailsInputChange
                                          }
                                          name={`areaInSqmt`}
                                          value={innerItem.areaInSqmt}
                                          isDisabled={isEditable(
                                            item.isEditable,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextComponent
                                          id={innerItem.assessmentDetailId}
                                          handleInputChange={
                                            handleAssessmentDetailsInputChange
                                          }
                                          name={`ratableValue`}
                                          value={innerItem.ratableValue}
                                          isDisabled={isEditable(
                                            item.isEditable,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ minWidth: "10px !important" }}
                                      >
                                        <Button
                                          disabled={isEditable(item.isEditable)}
                                          endIcon={<Delete />}
                                          onClick={() => {
                                            handleDeleteInnerTableRow(
                                              innerItem.assessmentDetailId,
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                          <Button
                            sx={{
                              marginTop: "10px",
                              marginBottom: "5px",
                            }}
                            size="small"
                            variant="contained"
                            onClick={handleAddInnerTableRow}
                            endIcon={<Add />}
                            disabled={isEditable(item.isEditable)}
                          >
                            Add New
                          </Button>
                        </TableCell>
                        {/* <TableCell>
                                                <Checkbox
                                                    sx={{
                                                        padding: "0px",
                                                    }}
                                                    name={index}
                                                    checked={item.chkSelect}
                                                    onChange={() =>
                                                        handleCheckboxChange(item.assessmentId)
                                                    }
                                                />
                                            </TableCell> */}
                        <TableCell>
                          <Button
                            onClick={() => {
                              handleOpenWorkflowModal(item.assessmentId);
                            }}
                            endIcon={<Schema />}
                            disabled={false}
                            sx={{
                              marginTop: "8px",
                            }}
                            variant="outlined"
                          >
                            Workflow
                          </Button>
                          {item.hearing && (
                            <Button
                              onClick={() => {
                                handleOpenHearingModal(item.assessmentId);
                              }}
                              endIcon={<Gavel />}
                              disabled={false}
                              sx={{
                                marginTop: "8px",
                              }}
                              variant="outlined"
                            >
                              Hearing`s
                            </Button>
                          )}
                          {/* {true && ( */}
                          {item.closeHearingRemark && (
                            <div style={{ marginTop: "5px", padding: "2px" }}>
                              <Divider />
                              <b>Hearning Remark - </b>
                              <TruncatedText
                                text={item.closeHearingRemark}
                                maxLength={20}
                              />
                              <Divider />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <SelectComponent
                            id={item.assessmentId}
                            handleInputChange={handleAssessmentInputChange}
                            name={`acceptOrReject`}
                            options={[
                              {
                                label: "Accept",
                                value: "Accept",
                              },
                              {
                                label: "Reject",
                                value: "Reject",
                              },
                            ]}
                            value={item.acceptOrReject || ""}
                          />
                        </TableCell>
                        <TableCell>
                          <TextComponent
                            id={item.assessmentId}
                            handleInputChange={handleAssessmentInputChange}
                            name={`remark`}
                            value={item.remark || ""}
                            multiline
                            required={isRequiredRemark(item.assessmentId)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          {/* {stage === "SR1Pending" && ( */}
          <Grid container justifyContent="center" alignItems="center" m={4}>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={handleGenerateClick}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
          {/* )} */}
        </>
      ) : (
        <Alert severity="warning">Data not available!!</Alert>
      )}
    </Grid>
  );
};

export default GenerateSRTable;
