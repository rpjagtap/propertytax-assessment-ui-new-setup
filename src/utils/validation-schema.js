import * as yup from "yup";

export const assessmentDashSchema = yup.object({
  "fromDate": yup.string("").required("Required *"),
  "toDate": yup.string("").required("Required *"),
  "formStatus": yup.string("").required("Required *"),
  "zoneKey": yup.string("").required("Required *"),
  "gatKey": yup.string("").required("Required *")
});

export const trackApplicationSchema = yup.object({
  "fromDate": yup.string("").required("Required *"),
  "toDate": yup.string("").required("Required *"),
  "formStatus": yup.string(""),
  "zoneKey": yup.string(""),
  "gatKey": yup.string(""),
  "applicationNo": yup.string(""),
});

export const srRegisterSchema = yup.object({
  "zoneKey": yup.string("").required("Required *"),
  "gatKey": yup.string("").required("Required *"),
  "srDate": yup.string("").required("Required *"),
  "malakName": yup.string("").required("Required *"),
  "occupantName": yup.string("").required("Required *"),
  "propertyAddress": yup.string("").required("Required *"),
  "propertyDescription": yup.string("").required("Required *"),
  "fYear": yup.string("").required("Required *"),
  "specialOwnership": yup.string("").required("Required *"),
  "mobileNo": yup.string("").required("Required *"),
});

export const transferApplicationSchema = yup.object({
  "transactionTypeId": yup.string("").required("Required *"),
  "zoneName": yup.string(""),
  "gatName": yup.string(""),
  "propertyCode": yup.string(""),
  "applicantName": yup.string("").required("Required *"),
  //"applicantMiddleName": yup.string("").required("Required *"),
  //"applicantLastName": yup.string("").required("Required *"),
  "applicantMobile": yup.string("").required("Required *")
  .matches(/^\d+$/, "Only numbers are allowed")
  .length(10, "Mobile number must be 10 digits")
});

export const propertyTransactionDashboardSchema = yup.object({
  "fromDate": yup.string("").required("Required *"),
  "toDate": yup.string("").required("Required *"),
  "transactionTypeKey": yup.string("").required("Required *"),
  "zoneKey": yup.string("").required("Required *"),
  "gatKey": yup.string("").required("Required *"),
});

export const propertyTransactionDashboardSchemaZo = yup.object({
  "fromDate": yup.string("").required("Required *"),
  "toDate": yup.string("").required("Required *"),
  "transactionTypeKey": yup.string("").required("Required *"),
  "zoneKey": yup.string("").required("Required *"),
});

export const srRegisterFullFormSchema = yup.object({
  "zoneKey": yup.string("").required("Required *"),
  "gatKey": yup.string("").required("Required *"),
  "srDate": yup.string("").required("Required *"),
  "propertyDescription": yup.string("").required("Required *"),
  "fYear": yup.string("").required("Required *"),
  "specialOwnership": yup.string("").required("Required *"),
  "waterConnNo": yup.string("").required("Required *"),
  "drainageNo": yup.string("").required("Required *"),
  "marFirstOwnerName": yup.string("").required("Required *"),
  "marMiddleOwnerName": yup.string("").required("Required *"),
  "marLastOwnerName": yup.string("").required("Required *"),
  "engFirstOwnerName": yup.string("").required("Required *"),
  "engMiddleOwnerName": yup.string("").required("Required *"),
  "engLastOwnerName": yup.string("").required("Required *"),
  "ownerMobile": yup.string("").required("Required *"),
  "ownerAdharNo": yup.string("").required("Required *"),
  "engFirstOccupantName": yup.string("").required("Required *"),
  "engMiddleOccupantName": yup.string("").required("Required *"),
  "engLastOccupantName": yup.string("").required("Required *"),
  "marFirstOccupantName": yup.string("").required("Required *"),
  "marMiddleOccupantName": yup.string("").required("Required *"),
  "marLastOccupantName": yup.string("").required("Required *"),
  "occupantMobile": yup.string("").required("Required *"),
  "occupantAdharNo": yup.string("").required("Required *"),
  // "flatNo": yup.string("").required("Required *"),
  // "blockNo": yup.string("").required("Required *"),
  // "floorMarathi": yup.string("").required("Required *"),
  // "floor": yup.string("").required("Required *"),
  // "buildingNo": yup.string("").required("Required *"),
  // "wingNameMarathi": yup.string("").required("Required *"),
  // "wingName": yup.string("").required("Required *"),
  // "societyNameMarathi": yup.string("").required("Required *"),
  // "societyName": yup.string("").required("Required *"),
  // "landmarkMarathi": yup.string("").required("Required *"),
  // "landmark": yup.string("").required("Required *"),
  // "towerNameMarathi": yup.string("").required("Required *"),
  // "towerName": yup.string("").required("Required *"),
  // "villageMarathi": yup.string("").required("Required *"),
  // "village": yup.string("").required("Required *"),
  // "pinCode": yup.string("").required("Required *"),
  // "marPropertyAddress": yup.string("").required("Required *"),
  // "engPropertyAddress": yup.string("").required("Required *"),
  // "documentId": yup.string("").required("Required *"),
  // "documentURLbase64": yup.string("").required("Required *"),
  // "totalArea": yup.string("").required("Required *"),
  // "totalTaxAmount": yup.string("").required("Required *"),
  // "finalUseType": yup.string("").required("Required *"),
  // "finalConstructionType": yup.string("").required("Required *"),
  // "useType": yup.string("").required("Required *"),
  // "subUseType": yup.string("").required("Required *"),
  // "constructionType": yup.string("").required("Required *"),
  // "occupancy": yup.string("").required("Required *"),
  // "specialOccupant": yup.string("").required("Required *"),
  // "assessmentDate": yup.string("").required("Required *"),
  // "areaInSqmt": yup.string("").required("Required *"),
  // "rateableValue": yup.string("").required("Required *"),
});

export const namChangeApplicationSchema = yup.object({
  transactionTypeId: yup.string().required("Required *"),
  zoneKey: yup.string().required("Required *"),
  gatKey: yup.string().required("Required *"),
  remark: yup.string().required("Required *"),

  marPropertyName: yup.string().required("Required *"),
  engPropertyName: yup.string().required("Required *"),
  marPropertyOccupantName: yup.string().required("Required *"),
  engPropertyOccupantName: yup.string().required("Required *"),
});


export const useTypeApplicationSchema = yup.object({
  "sr1Date": yup.string("").required("Required *"),
  "description": yup.string("").required("Required *"),
});

export const addressChangeApplicationSchema = yup.object({
  "transactionTypeKey": yup.string(""),
  "zoneName": yup.string(""), 
  "gatName": yup.string(""),
  "propertyCode": yup.string(""),
  "marPropertyAddress": yup.string("").required("Required *"),
  "engPropertyAddress": yup.string("").required("Required *"),
  "orderNo": yup.string("").required("Required *"),
  "remark": yup.string("").required("Required *"),
  "newOwnerAddressMar": yup.string("").required("Required *"),
  "newOwnerAddressEng": yup.string("").required("Required *"),
  "newOccupantAddressMar": yup.string("").required("Required *"),
  "newOccupantAddressEng": yup.string("").required("Required *"),

});  

export const mobileEmailChangeApplicationSchema = yup.object({
  "transactionTypeId": yup.string(""),
  "zoneName": yup.string(""), 
  "gatName": yup.string(""),
  "propertyCode": yup.string(""),
  "orderNo": yup.string("").required("Required *"),
  "remark": yup.string("").required("Required *"),
   "newOwnerMobile": yup.string("").required("Required *"),
  "newOwnerEmail": yup.string("").required("Required *"),
  "newOccupantMobile": yup.string("").required("Required *"),
  "newOccupantEmail": yup.string("").required("Required *"),  

}); 

export const namChangeApplicationZoSchema = yup.object({
  "remarks": yup.string("").required("Required *"),
});

export const srDashboardForZoSchema = yup.object({
  "remarks": yup.string("").required("Required *"),
});

export const sthapatyavadhivPropertyDataSchema = yup.object({  
  "zoneKey": yup.string("").required("Required *"),
  "gatKey": yup.string("").required("Required *"),
});
