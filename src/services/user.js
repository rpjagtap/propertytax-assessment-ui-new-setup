// import axios from "axios";
import apiClient from "./axios-client";
// import { getApiBaseUrl } from "../utils/helpers";
import packageJson from "../../package.json";
import { setToken } from "../utils/sessionUtils";
// const BASE_URL = getApiBaseUrl();
/**
 * Define the async function to fetch menu data
 * @returns user details with menu
 */
export const getUserWithMenuDetails = async (userCode) => {
  const response = await apiClient.get(
    `/userdetails/get-user-menu?userCode=${userCode}`
  );
  return response.data;
};

/**
 * Define the async function to validate user
 * @returns user details
 */
export const validateUser = async (userName, password) => {
  // await getToken(userName);
  const body = {
    userCode: userName,
    password: password,
  };

  const response = await apiClient.post(
    `/userdetails/validate-user-Password`,
    body,
    {}
  );
  return response.data;
};
/**
 * Define the async function to validate user OTP
 * @returns validation status as boolean
 */
export const validateOtp = async (userCode, otp) => {
  const body = {
    userCode: userCode,
    otp: otp,
  };
  const response = await apiClient.post(
    `/userdetails/verify-OTP`,
    body,
    {}
  );
  return response.data;
};

export const resendOtp = async (userCode) => {
  const body = {
    userCode: userCode,
  };
  const response = await apiClient.post(
    `/userdetails/resend-otp`,
    body,
    {}
  );
  return response.data;
};

export const getToken = async (userCode) => {
  try {
    const response = await apiClient.get(
      `/generate-token?userCode=${userCode}&apiKey=${packageJson.auth.apiKey}`
    );
    setToken(response.data.token);
    return response.data.token;
  } catch (error) {
    // throw new Error(error);
  }
};
