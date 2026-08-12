import { getUserDetails, setSession } from "../utils/sessionUtils";
import apiClient from "./axios-client";
const baseUrl = "/assessment";

export const getGatAssignData = async (body) => {
  const response = await apiClient.post(`${baseUrl}/gat-assign-data`, body);
  return response.data;
};

export const updateGatAssignData = async (body) => {
  const response = await apiClient.post(`${baseUrl}/gat-assign-update`, body);
  return response.data;
};

export const getApplications = async (body) => {
  const response = await apiClient.post(`${baseUrl}/get-applications`, body);
  return response.data;
};

export const submitApplication = async (body) => {
  const response = await apiClient.post(`${baseUrl}/submit-application`, body);
  return response.data;
};

export const revertApplications = async (body) => {
  const response = await apiClient.post(`${baseUrl}/revert-application`, body);
  return response.data;
};

export const getPendingApplications = async (body) => {
  // eslint-disable-next-line no-unused-vars
  const response = await apiClient.post(
    `${baseUrl}/get-pending-applications`,
    body,
  );
  return response.data;
};

export const getPendingApplicationsCount = async (body) => {
  const response = await apiClient.post(
    `${baseUrl}/get-pending-applications-count`,
    body,
  );
  return response.data;
};

export const getStages = async () => {
  const response = await apiClient.get(`/master/get-assessment-stages`);
  return response.data;
};

export const getZoneByProfile = async () => {
  const response = await apiClient.get(`/master/getZoneByProfile`);
  return response.data;
};

export const getAllPropertyTransactions = async () => {
  const response = await apiClient.get(`/master/get-all-property-transactions`);
  return response.data;
};

export const getAllProfile = async () => {
  const response = await apiClient.get(`/master/getAllProfile`);
  return response.data;
};

export const getAllZone = async () => {
  const response = await apiClient.get(`/master/getAllZone`);
  return response.data;
};

export const getGatByZonekey = async (body) => {
  const response = await apiClient.post(`/master/getGatByZonekey`, body);
  return response.data;
};

export const getAllGatByZoneKey = async (body) => {
  const response = await apiClient.post(`/master/getAllGatByZoneKey`, body);
  return response.data;
};
export const validateUserApi = async (body) => {
  const response = await apiClient.post(`/userdetails/validate-user`, body);
  return response.data;
};
export const editUserApi = async (body) => {
  const response = await apiClient.post(`/userdetails/edit-user`, body);
  return response.data;
};

export const getUsetypeSubusetypeData = async () => {
  const response = await apiClient.get(`/master/get-usetype-subusetype-data`);
  return response.data;
};

export const getConstructiontypes = async () => {
  const response = await apiClient.get(`/master/get-constructiontype`);
  return response.data;
};

export const getSubusetypeByUsetype = async (useType) => {
  const response = await apiClient.get(
    `/master/get-subusetype-by-usetype?usetype=${useType}`,
  );
  return response.data;
};

export const getAllStages = async () => {
  const response = await apiClient.get(`/master/get-all-assessment-stages`);
  return response.data;
};

export const getStagewiseApplicationsCountRpt = async (body) => {
  const response = await apiClient.post(
    `${baseUrl}/get-stagewise-applications-count-rpt`,
    body,
  );
  return response.data;
};

export const getStagewiseApplicationsRpt = async (body) => {
  const response = await apiClient.post(
    `${baseUrl}/get-stagewise-applications-rpt`,
    body,
  );
  return response.data;
};

export const getPDF = async (docId) => {
  const response = await apiClient.get(
    `${baseUrl}/get-assessment-documents?docId=${docId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    },
  );
  return response.data;
};

export const citizenConsentPDF = async (pdfDocId) => {
  const response = await apiClient.get(
    `${baseUrl}/get-citizen-sr-doc?applicationNo=${pdfDocId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    },
  );
  return response.data;
};

export const citizenConsentApplication = async (body) => {
  const response = await apiClient.post(
    `${baseUrl}/submit-citizen-application`,
    body,
  );
  return response.data;
};

export const getHearingDetails = async (assessmentId) => {
  const response = await apiClient.get(
    `/assessment/get-hearing-details?assessmentId=${assessmentId}`,
  );
  return response.data;
};

export const updateHearingDetails = async (body) => {
  const response = await apiClient.post(
    `${baseUrl}/update-hearing-details`,
    body,
  );
  return response.data;
};

export const profileWisePendingApplication = async () => {
  const response = await apiClient.get(
    `/assessment/profile-wise-pending-application`,
  );
  return response.data;
};

export const getApplicationFlow = async (assessmentId) => {
  const response = await apiClient.get(
    `/assessment/get-application-flow?assessmentId=${assessmentId}`,
  );
  return response.data;
};

export const getRatebaleValueCalculation = async (body) => {
  const response = await apiClient.post(
    `/assessment/get-ratebale-value-calculation`,
    body,
  );
  return response.data;
};

export const propertyTransferPaymentRequest = async (body) => {
  const response = await apiClient.post(
    "payment/property-transfer-payment-request",
    body,
  );
  return response.data;
};

export const paymentResponse = async (body) => {
  const response = await apiClient.post("payment/paymentResponse", body);
  return response.data;
};

export const onlineReconsilationBrowse = async (body) => {
  const response = await apiClient.post(
    "payment/online-reconsilation-browse",
    body,
  );
  return response.data;
};

export const getOnlineReconsilation = async (body) => {
  const response = await apiClient.post("payment/online-reconsilation", body);
  return response.data;
};

export const saveOnlineReconsilation = async (body) => {
  const response = await apiClient.post(
    "payment/save-online-reconsilation",
    body,
  );
  return response.data;
};

export const getFinancialYear = async () => {
  const response = await apiClient.get(`/master/get-financialyear`);
  return response.data;
};

export const getSpecialOwnership = async () => {
  const response = await apiClient.get(`/master/get-special-ownership`);
  return response.data;
};

export const getSpecialOccupant = async () => {
  const response = await apiClient.get(`/master/get-special-occupant`);
  return response.data;
};

export const getOccupancy = async () => {
  const response = await apiClient.get(`/master/get-occupancy`);
  return response.data;
};

export const objList = async () => {
  const response = await apiClient.get(`/master/get-objection`);
  return response.data;
};

export const getFloor = async () => {
  const response = await apiClient.get(`/master/get-all-building-floor`);
  return response.data;
};

export const getWing = async () => {
  const response = await apiClient.get(`/master/get-all-wing`);
  return response.data;
};

export const getAllProTransactions = async () => {
  const response = await apiClient.get(`/master/get-all-property-transactions`);
  return response.data;
};

export const getPropertyForUpadate = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/get-property-for-update`,
    body,
  );
  return response.data;
};

export const validatePropertyCode = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/get-property-details-for-transactions`,
    body,
  );
  return response.data;
};

export const getZonewisePropertyTransferReport = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/zone_wise_property_transfer_report`,
    body,
  );
  return response.data;
};

export const getGatwisePropertyTransferReport = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/gat_wise_property_transfer_report`,
    body,
  );
  return response.data;
};

export const submitPropertyTransactionApplication = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/submit-property-transaction-application`,
    body,
  );
  return response.data;
};

export const getTransactionDashboard = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/pending-property-transaction-application`,
    body,
  );
  return response.data;
};

export const getPropertyOwnerDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/get-property-details-for-transactions`,
    body,
  );
  return response.data;
};

export const getAssessmentDocuments = async () => {
  const response = await apiClient.get(`/master/get-all-assessment-document`);
  return response.data;
};

export const submitPropertyTransaction = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/submit-property-transaction`,
    body,
  );
  return response.data;
};

export const generatesr1 = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/generate-sr1`,
    body,
  );
  return response.data;
};

export const submitPropertyNameChangeApplication = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/submit-update-property`,
    body,
  );
  return response.data;
};

// Nikita API Start
export const getPendingApplicationsCountforTransfer = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/get-pending-applications-count`,
    body,
  );
  return response.data;
};

export const getResetPassword = async (body) => {
  const response = await apiClient.post(`/userdetails/reset-password`, body);
  return response.data;
};

export const getAddUser = async (body) => {
  const response = await apiClient.post(`/userdetails/add-user`, body);
  return response.data;
};

export const citizenConsentApplications = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/submit-citizen-application`,
    body,
  );
  return response.data;
};

export const getPropertyTransferPendingCount = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/get-pending-applications-count`,
    body,
  );
  return response.data;
};

export const getPropertyDetailsForTransfer = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/get-property-details-for-transfer`,
    body,
  );
  return response.data;
};

export const getPropertyTransferDocumentType = async () => {
  const response = await apiClient.get(
    `/master/get-property_transfer_document_type`,
  );
  return response.data;
};

export const getSubmitApplication = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/submit-application`,
    body,
  );
  return response.data;
};

export const getCalculateTransferFees = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/calculate-transfer-fees`,
    body,
  );
  return response.data;
};

export const downloadTransferDoc = async (id) => {
  const response = await apiClient.get(`/property-transfer/download-doc`, {
    params: { id },
    responseType: "blob",
  });
  return response.data;
};

export const getViewTransferFees = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/view-transfer-fees`,
    body,
  );
  return response.data;
};

export const getSplitUseTypePropertyDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/get-usetype-property-details`,
    body,
  );
  return response.data;
};

export const postSplitPropertyDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/split-property-details`,
    body,
  );
  return response.data;
};

export const saveSplitPropertyDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/save_split-property-details`,
    body,
  );
  return response.data;
};

export const saveTransferPropertyDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/save_transfer-property-details`,
    body,
  );
  return response.data;
};

export const getViewTransferFeesNew = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/propert-transfer-fees-details`,
    body,
  );
  return response.data;
};

export const saveTrevertApplication = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/revert-application`,
    body,
  );
  return response.data;
};
export const saveTransferFees = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/save-transfer-fees`,
    body,
  );
  return response.data;
};

export const viewTransferFees = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/view-transfer-fees`,
    body,
  );
  return response.data;
};
export const getTransferPendingApplications = async (body) => {
  // eslint-disable-next-line no-unused-vars
  const response = await apiClient.post(
    `/property-transfer/get-pending-applications`,
    body,
  );
  return response.data;
};
export const getStagesByProfile = async () => {
  const response = await apiClient.get(
    `/property-transfer/get-stages-by-profiles`,
    {
      params: { channelName: "PropertyTransfer" },
    },
  );
  return response.data;
};

export const getTransferNotice = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/generate-transfer-notice`,
    body,
  );
  return response.data;
};

export const getTransferOrder = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/generate-transfer-order`,
    body,
  );
  return response.data;
};
export const getreuploadDocument = async (body) => {
  const response = await apiClient.post(
    `/property-transfer/reupload-doc`,
    body,
  );
  return response.data;
};

// export const getCitizenDashboard = async (propertyKey) => {
//   const response = await apiClient.get("/citizen/citizen-dashboard", {
//     params: { propertyKey },
//   });
//   return response.data;
// };

export const getPropertyNoc = async (body) => {
  const response = await apiClient.get(`/property/property-noc`, body);
  return response.data;
};

export const getBasicPropertyDetails = async (propertyCode) => {
  const response = await apiClient.get(
    `/citizen/citizen-getBasicPropertyDetails?propertyCode=${propertyCode}`,
  );
  return response.data;
};

export const getCitizenDashboard = async (propertyKey) => {
  const response = await apiClient.get(
    `/citizen/citizen-dashboard?propertyKey=${propertyKey}`,
  );
  return response.data;
};

export const getCitizenApplications = async (body) => {
  const response = await apiClient.post(`/citizen/citizen-applications`, body);
  return response.data;
};

export const getTrackProperty = async (body) => {
  const response = await apiClient.post(
    `/citizen/track_property_application`,
    body,
  );
  return response.data;
};

// export const getPropertyNocPdf = async (propertyCode) => {
//   const response = await apiClient.post(
//     `/citizen/property-noc?propertyCode?=${propertyCode}`
//   );
//   return response.data;
// };

// export const getPropertyNoc = async (body) => {
//   const response = await apiClient.get(`/property/property-noc`, body);
//   return response.data;
// };

export const getPropertyNocPdf = async (propertyCode) => {
  const response = await apiClient.get(
    `/citizen/property-noc?propertyCode=${propertyCode}`,
  );
  return response.data;
};

export const submitUpdatePropertyUseTypeChange = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/submit-property-vadhiv`,
    body,
  );
  return response.data;
};

export const getZoneWiseCollectionDetails = async () => {
  const response = await apiClient.get(
    `/assessment-reports/get-zonewise-building-permission-reports`,
  );
  return response.data;
};

export const getGatWiseCollectionDetails = async (body) => {
  const response = await apiClient.post(
    `/assessment-reports/get-gatwise-building-permission-reports`,
    body,
  );
  return response.data;
};
export const getBuildingPermissionData = async () => {
  const response = await apiClient.get(
    `/assessment-reports/get-building-permission-data`,
  );
  return response.data;
};

export const getTransactionDashboardZo = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/pending-property-update-apps`,
    body,
  );
  return response.data;
};
export const submitPropertyInfoChange = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/submit-update-property`,
    body,
  );
  return response.data;
};

export const getPropertyUpadateDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/pending-property-update-details`,
    body,
  );
  return response.data;
};

export const savePropertyUpdateDetails = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/save-property-update-details`,
    body,
  );
  return response.data;
};

export const ViewProTransactionDoc = async (
  documentName,
  documentURLbase64,
) => {
  const response = await apiClient.get(
    `/property-transactions/download-transaction-doc`,
    {
      params: {
        documentName: documentName,
        documentURLbase64: documentURLbase64,
      },
      responseType: "blob",
    },
  );
  return response.data;
};

export const submitCitizenPropertyUpdateApplication = async (body) => {
  const response = await apiClient.post(
    `/citizen/submit-citizen-property-update-application`,
    body
  );
  return response.data;
};

export const get_redzone_data_for_zo = async () => {
  const response = await apiClient.get(`/property/get_redzone_data_for_zo`);
  return response.data;
}

export const approved_property_type = async (propertyKey, isChecked) => {
  const response = await apiClient.post(
    `/property/approved_property_type`,
    {
      propertyROLst: [
        {
          propertyKey: propertyKey,
          isChecked: isChecked,
        },
      ],
    }
  );

  return response.data;
};

export const viewPendingApplications = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/get-pending-applications`,
    body,
  );
  return response.data;
};

export const getPropertyTransactionStages = async () => {
  const response = await apiClient.get(`/master/get-property-transaction-stages`);
  return response.data;
};

// propertyService.js

// export const sendToZoDashboard = async (payload) => {
//   return await apiClient.post("/property/approved_property_type", {
//     propertyROLst: [
//       {
//         // propertyKey: propertyKey,
//         // isChecked: isChecked,
//         propertyROLst: payload,
//       },
//     ],
//   });
// };

export const sendToZoDashboard = async (propertyKey, isChecked) => {
  return await apiClient.post("/property/approved_property_type", {
    propertyROLst: [
      {
        propertyKey,
        isChecked,
      },
    ],
  });
};

// export const viewPendingApplications = async (body) => {
//   const response = await apiClient.post(
//     `/property-transactions/get-pending-applications`,
//   )};
/*export const viewPendingApplications = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/get-pending-applications`,
  )};*/
  
export const revertApplication = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/revert-application`,
    body,
  );
  return response.data;
};


export const ViewSRTransactionDoc = async ( documentId,documentName, documentURLbase64, ) => {

  const response = await apiClient.get(`/property-transactions/download-transaction-doc`, {
      params: {
        documentId: documentId,
        documentName: documentName,
        documentURLbase64: documentURLbase64,
      },
      responseType: "blob",
    },
  );
  return response.data;
};
export const saveSr = async (body) => {
  const response = await apiClient.post(
    `/property-transactions/save-sr`,
    body,
  );
  return response.data;
};

export const getSthapatyaSurveyDashboard = async (body) => {
  const response = await apiClient.post(`/sthapatya/sthapatya-vadhiv-property-dashboard`, body);
  return response.data;
};


export const submitSthapathyaVadhivProperty = async (body) => {
  const response = await apiClient.post(`sthapatya/submit-sthapatya-vadhiv-property` ,body);
  return response.data;
}; 

export const createassignInterface = async (body) => {
  const response = await apiClient.post(`userdetails/create-assign-interface` ,body);
  return response.data;
};

export const editProfileInterface = async (body) => {
  const response = await apiClient.post(`userdetails/edit-profile-interface` ,body);
  return response.data;
};


