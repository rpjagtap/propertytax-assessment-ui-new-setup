import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
// import { extendSessionData } from "./utils/sessionUtils";
// import routes from "./routes";
import Login from "./components/auth-pages/login";
import VerifyOtp from "./components/auth-pages/verify-otp";
// import ProtectedRoute from "./protectedRoute";
import NotFound from "./components/not-found";
import UnAuthorized from "./components/unauthorized";
import useInactivityTimer from "./components/common/useInactivityTimer";
import { clearSession } from "./utils/sessionUtils";
import { showToastWarn } from "./components/common/toastHelper";
import routes from "./routes";
import ProtectedRoute from "./protectedRoute";
import ViewTransferFee from "./components/property-transfer-dashboard/view-transfer-fee";
import TransferNoticePdf from "./components/property-transfer-dashboard/property-transfer-notice";
import Dashboard from "./components/property-transfer-dashboard/dashboard-ratio";
import DashboardCard from "./components/property-transfer-dashboard/dashboard-card";
import NocPdf from "./components/property-transfer-dashboard/noc-pdf";
import TrackApplicationStatus from "./components/track-property-application/track-application-status";
import ZonewisePropertyTransferReport from "./components/zonewise-property-transfer-report";
const App = () => {
  useEffect(() => {
    // Extend session data on component mount
    // extendSessionData();
  }, []);
  const handleLogout = () => {
    // Logic to expire the session or log the user out
    if (!["/login", "/verify-otp", "/"].includes(window.location.pathname)) {
      showToastWarn("User inactive for long time. Logging out.");
      clearSession();
      window.location.href = "/login";
    }
  };

  useInactivityTimer(handleLogout);
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<UnAuthorized />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/view-transfer-fee" element={<ViewTransferFee />} />
        <Route path="/dashboard-ratio" element={<Dashboard />} />
        <Route path="/dashboard-card" element={<DashboardCard />} />
        <Route
          path="/track-application-status"
          element={<TrackApplicationStatus />}
        />

        <Route
          path="property-transfer-notice"
          element={<TransferNoticePdf />}
        />

        <Route
          path="ZonewisePropertyTransferReport"
          element={<ZonewisePropertyTransferReport />}
        />

        <Route path="noc-pdf" element={<NocPdf />} />
        {routes.map((route, index) => {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute
                  routeName={route.path}
                  element={route.component}
                />
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
};

export default App;
