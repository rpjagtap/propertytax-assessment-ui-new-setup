import React from "react";
import { Navigate } from "react-router-dom";
import { getUserDetails } from "./utils/sessionUtils";
import { useSelector } from "react-redux";

const findFormName = (menus, targetFormName) => {
  for (const menu of menus) {
    if (menu.formName === targetFormName) {
      return menu.formName;
    }

    if (menu.children?.length) {
      const result = findFormName(menu.children, targetFormName);
      if (result) {
        return result;
      }
    }
  }

  return false;
};

const ProtectedRoute = ({ routeName, element: Component, ...rest }) => {
  const menuData = useSelector((state) => {
    if (routeName === "home") {
      return [
        {
          formName: "home",
        },
      ];
    } else {
      return state.userDetails.userMenu;
    }
  });
  const isAuthenticated = getUserDetails();
  // Show routes wihtout authentication
  if (
    routeName === "citizen-consent" ||
    routeName.startsWith("1-april-bill") ||
    routeName === "/download/hearing-letter" ||
    routeName === "PropertyTransfer" ||
    routeName === "submitApplication" ||
    routeName === "PropertyTransactions" ||
    routeName === "PropertyInfoChange" ||
    routeName === "property-transfer-result" ||
    routeName === "assessment-document" ||
    routeName === "PropertyUseTypeChange" ||
    routeName === "PropertyAddressChange" ||
    routeName === "AdditionalConstructedProperty" ||
    routeName === "view-number-of-property" ||
    routeName === "view-application" ||
    routeName === "applications-status" ||
    routeName === "transfer-notice" ||
    routeName === "transfer-order" ||
    routeName === "view-fees" ||
    routeName === "make-payment" ||
    routeName === "PaymentResponse" ||
    routeName === "PropertyContactChange" ||
    routeName === "reuploads" ||
    routeName === "PropertyTransactionsDashBoardZo" ||
    routeName === "PropertyNameChangeZo" ||
    routeName === "PropertyAddressChangeZo" ||
    routeName === "PropertyMobileEmailChangeZo" ||
    routeName === "reset-password" ||
    routeName === "track-application-status" ||
    routeName === "VadhivPropertyTransactionDashBoardZo" ||
    routeName === "CitizenApplication" ||
    routeName === "zonewise-property-transfer-report" ||
    routeName === "SRDashboardForZo" ||
    routeName === "viewPropertyTransactionApplicationPa" ||
    routeName === "viewPropertyTransactionApplicationPa" || 
    routeName === "UseTypeChangeProcess" ||
    routeName === "AdditionalConstructedPropertyProcess"
  ) {
    return <Component {...rest} />;
  }
  // If user is not authenticated, navigate to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (
    routeName === "profile" ||
    routeName === "SrRegister"
    // routeName === "CashChallan" ||
    // routeName === "edc-receipt" ||
    // routeName === "SearchPropertyToGenReceipt"
  ) {
    return <Component {...rest} />;
  }

  // If route is not "home" and menuData is provided, check access
  if (routeName !== "home" && menuData) {
    const isUserHasRouteAccess = findFormName(menuData, routeName);

    // If user has access to the route, render the component
    if (isUserHasRouteAccess) {
      return <Component {...rest} />;
    } else {
      // If user doesn't have access, navigate to unauthorized
      return <Navigate to="/unauthorized" />;
    }
  }

  // If route is "home" or no menuData provided, render the component
  return <Component {...rest} />;
};

export default ProtectedRoute;
