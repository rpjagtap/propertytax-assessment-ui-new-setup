// routes.js
import AssessmentDashboard from "./components/assessment-dashboard/assessment-dashboard";
import Home from "./components/pcmc-menu/home";
import GatAssign from "./components/gat-assign/gat-assign";
import ProfilePage from "./components/common/profile-page";
import CitizenConsent from "./components/citizen-consent";
import TrackApplication from "./components/track-application";
import Download from "./components/download";
import PcmcTaxBill from "./components/bill-first-april";
import SrRegister from "./components/sr-register";
import PropertyTranApplication from "./components/property-transaction-application";
import PropertyTransferDashBoard from "./components/property-transfer-dashboard";
import TransferForm from "./components/property-transfer";
import ViewTransferFee from "./components/property-transfer-dashboard/view-transfer-fee";
import propertyTransactionsDashboard from "./components/property-transactions-dashboard";
import PropertyInfoChange from "./components/pro-add-mo-em-occ-change";
import PropertyTraAppforadd from "./components/pro-address-change";
import PropertyTraAppforContact from "./components/pro-mob-email-change";
import TransferResult from "./components/property-transfer-result";

import TransferNoticePdf from "./components/property-transfer/transfer-notice";
import AssessmentDocument from "./components/assessment-document";
import PropertyUseTypeChangeApplication from "./components/pro-use-type-change";
import TransferOrderPdf from "./components/property-transfer/transfer-order";
import NocPdf from "./components/property-transfer-dashboard/noc-pdf";

import ViewNumberOfProperties from "./components/property-transfer/view-number-of-property";
import ViewApplications from "./components/property-transfer/view-application";
import ApplicationStatus from "./components/property-transfer/applications-status";
import BuildingPermissionReport from "./components/assessment-report";
import ViewReceipt from "./components/property-transfer/view-fees";
import DashboardRatio from "./components/property-transfer-dashboard/dashboard-ratio";
import DashboardCard from "./components/property-transfer-dashboard/dashboard-card";
import MakePayment from "./components/property-transfer/make-payment";
import PaymentResult from "./components/property-transfer/payment-result";
import PropertyAddConstructedApplication from "./components/property-add-constructed";
import ReuploadDocument from "./components/property-transfer/reuploads";
import OnlineTransaction from "./components/browse-online-transaction-excel/online-transaction";
import OnlineTransactionReport from "./components/online-transaction-report";
import OnlineTransactionExcel from "./components/property-transfer-dashboard/online-transaction-excel";
// import ReuploadDocument from "./components/property-transfer-dashboard/reupload";
import propertyTransactionsDashboardZo from "./components/property-transactions-dashboard-zo";
import PropertyNameChangeZo from "./components/property-name-change-zo";
import PropertyAddressChangeZo from "./components/property-address-change-zo";
import PropertyMobileEmailChangeZo from "./components/property-mobile-email-change-zo";
import ResetPassword from "./components/auth-pages/reset-password";
import addUser from "./components/add-user";
import TrackPropertyApplication from "./components/track-property-application";
import TrackApplicationStatus from "./components/track-property-application/track-application-status";
import CitizenApplication from "./components/citizen-transcation-onlineApplication";
import PropertyType from "./components/property-type";
import PropertyTypeZO from "./components/property-type-zo";
import ZonewisePropertyTransferReport from "./components/zonewise-property-transfer-report";
import SRDashboardForZo from "./components/sr-dashboard-for-zo";
import PropertyTransactionApplicationViewPa from "./components/property-transaction-application-view-pa";
import PropertyUseTypeChange from "./components/pro-use-type-change-process";
import AdditionalConstructedPropertyProcess from "./components/property-add-constructed-process";
import SthapatyaVadhivPropertyDashboard from "./components/sthapatya-vadhiv-propertydata";
import CreateAssignInterface from "./components/create-assign-interface";
import EditProfileInterface from "./components/edit-profile-interface";

const routes = [
  {
    path: "home",
    component: Home,
  },
  {
    path: "profile",
    component: ProfilePage,
  },
  {
    path: "AssessmentDashboard",
    component: AssessmentDashboard,
  },

  {
    path: "GatAssignPending",
    component: GatAssign,
  },
  {
    path: "citizen-consent",
    component: CitizenConsent,
  },
  {
    path: "TrackApplication",
    component: TrackApplication,
  },
  {
    path: "/download/hearing-letter",
    component: Download,
  },
  {
    path: "1-april-bill/:propertyId",
    component: PcmcTaxBill,
  },
  {
    path: "PropertyTransactions",
    component: PropertyTranApplication,
  },
  {
    path: "PropertyTransferDashBoard",
    component: PropertyTransferDashBoard,
  },
  {
    path: "TrackPropertyApplication",
    component: TrackPropertyApplication,
  },
  {
    path: "TrackApplicationStatus",
    component: TrackApplicationStatus,
  },

  {
    path: "view-transfer-table",
    component: ViewTransferFee,
  },

  {
    path: "zonewise-property-transfer-report",
    component: ZonewisePropertyTransferReport,
  },

  // {
  //   path: "reupload",
  //   component: ReuploadDocument,
  // },
  {
    path: "reuploads",
    component: ReuploadDocument,
  },
  {
    path: "PropertyTransfer",
    component: TransferForm,
  },
  {
    path: "submitApplication",
    component: SrRegister,
  },
  {
    path: "PropertyTransactionsDashBoard",
    component: propertyTransactionsDashboard,
  },
  {
    path: "PropertyInfoChange",
    component: PropertyInfoChange,
  },
  {
    path: "property-transfer-result",
    component: TransferResult,
  },

  {
    path: "transfer-notice",
    component: TransferNoticePdf,
  },
  {
    path: "transfer-order",
    component: TransferOrderPdf,
  },
  {
    path: "reset-password",
    component: ResetPassword,
  },
  {
    path: "AddUser",
    component: addUser,
  },
  {
    path: "noc-pdf",
    component: NocPdf,
  },
  {
    path: "view-number-of-property",
    component: ViewNumberOfProperties,
  },
  {
    path: "view-application",
    component: ViewApplications,
  },
  {
    path: "BrowseOnlineTransactionExcel",
    component: OnlineTransactionExcel,
  },
  {
    path: "OnlineTransactionReport",
    component: OnlineTransactionReport,
  },
  {
    path: "applications-status",
    component: ApplicationStatus,
  },
  {
    path: "make-payment",
    component: MakePayment,
  },
  {
    path: "PaymentResponse",
    component: PaymentResult,
  },
  {
    path: "assessment-document",
    component: AssessmentDocument,
  },
  {
    path: "view-fees",
    component: ViewReceipt,
  },
  {
    path: "dashboard-ratio",
    component: DashboardRatio,
  },
  {
    path: "dashboard-card",
    component: DashboardCard,
  },
  {
    path: "PropertyUseTypeChange",
    component: PropertyUseTypeChangeApplication,
  },
  {
    path: "AssessmentReport",
    component: BuildingPermissionReport,
  },
  {
    path: "AdditionalConstructedProperty",
    component: PropertyAddConstructedApplication,
  },
  {
    path: "PropertyTransactionsDashBoardZo",
    component: propertyTransactionsDashboardZo,
  },
  {
    path: "PropertyAddressChange",
    component: PropertyTraAppforadd,
  },
  {
    path: "PropertyContactChange",
    component: PropertyTraAppforContact,
  },
  {
    path: "PropertyNameChangeZo",
    component: PropertyNameChangeZo,
  },
  {
    path: "PropertyAddressChangeZo",
    component: PropertyAddressChangeZo,
  },
  {
    path: "PropertyMobileEmailChangeZo",
    component: PropertyMobileEmailChangeZo,
  },
  {
    path: "PropertyContactChange",
    component: PropertyTraAppforContact,
  },
  {
    path: "CitizenApplication",
    component: CitizenApplication,
  },
  {
    path: "PropertyType",
    component: PropertyType,
  },
  {
    path: "PropertyTypeZO",
    component: PropertyTypeZO,
  },
  {
    path: "SRDashboardForZo",
    component: SRDashboardForZo,
  },
  {
    path: "viewPropertyTransactionApplicationPa",
    component: PropertyTransactionApplicationViewPa,
  },
  {
    path: "UseTypeChangeProcess",
    component: PropertyUseTypeChange,
  },
  {
    path: "AdditionalConstructedPropertyProcess",
    component: AdditionalConstructedPropertyProcess,
  },
  {
    path: "SthapatyaVadhivPropertyDashboard",
    component: SthapatyaVadhivPropertyDashboard,
  },
  {
    path: "CreateAssignInterface",
    component : CreateAssignInterface,
  },
  {
    path: "EditProfileInterface",
    component : EditProfileInterface,
  }
  
  // Add other routes here
];

export default routes;
