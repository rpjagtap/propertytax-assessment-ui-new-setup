import axios from "axios";
import {
  clearSession,
  // getTokenFromSession,
  getUserDetails,
  isSessionValid,
} from "../utils/sessionUtils";
import { getApiBaseUrl } from "../utils/helpers";
import { toast } from "react-toastify";
import packageJson from "../../package.json";

export const getHeaders = () => {
  toast.dismiss();

  // console.log("!Get headers called...");
  const isAuthenticated = isSessionValid();
  //console.log("!Authenticated: ", isAuthenticated);
  
  if (isAuthenticated) {
    const userDetails = getUserDetails();

    const { profileId, zoneKey, userCode, userId, counterKey,prabhag,gatKey } = userDetails || {};
    return {
      "Profile-ID": profileId,
      "Zone-Key": zoneKey,
      "User-Code": userCode,
      "User-ID": userId,
      "counter-key": counterKey,
      "prabhag" :prabhag,
      "gat-key" :gatKey
    };
  } else {
    clearSession();
    // window.location.reload();
  }
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the headers from getHeaders function
    const headers = getHeaders();
    // Attach the headers to the config
    config.headers = {
      ...config.headers,
      ...headers,
    };
    // config.headers["Content-Type"] = "application/json";
    // config.headers["Id-Claim"] = `Bearer ${getTokenFromSession()}`;
    config.headers["api-key"] = `${packageJson.auth.apiKey}`;

    if (
      ["post", "put", "patch"].includes(config.method?.toLowerCase()) &&
      !config.headers["Content-Type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export default apiClient;
