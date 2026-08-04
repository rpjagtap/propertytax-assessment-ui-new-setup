export const isSessionValid = () => {
  const sessionData = sessionStorage.getItem("sessionData");
  if (!sessionData) {
    return false;
  }

  return true;

  // const { expiry } = JSON.parse(sessionData);
  // const now = new Date().getTime();

  // return now < expiry;
};

export const getUserDetails = () => {
  const sessionData = sessionStorage.getItem("sessionData");
  if (!sessionData) return false;

  const parsedData = JSON.parse(sessionData);
  const { expiry, ...userDetails } = parsedData;
  const now = new Date().getTime();
  if (now >= expiry) {
    sessionStorage.removeItem("sessionData");
    return null;
  }

  return userDetails;
};

export const clearSession = () => {
  // clearToken();
  sessionStorage.removeItem("sessionData");
};

export const setSession = (sessionData) => {
  const data = {
    ...sessionData,
    // expiry: new Date().getTime() + 20 * 60 * 1000, // 5 minutes from now
  };
  sessionStorage.setItem("sessionData", JSON.stringify(data));
};

export const extendSessionData = () => {
  const sessionData = sessionStorage.getItem("sessionData");

  if (sessionData) {
    const parsedData = JSON.parse(sessionData);
    const now = new Date();

    if (parsedData) {
      // Extend the expiry time
      parsedData.expiry = now.getTime() + 20 * 60 * 1000;
      sessionStorage.setItem("sessionData", JSON.stringify(parsedData));
      return parsedData;
    } else {
      // Session has expired
      sessionStorage.removeItem("sessionData");
    }
  } else {
    console.log("Not logged in!!");
  }
  return null;
};

export const clearToken = () => {
  sessionStorage.removeItem("token");
};
export const setToken = (token) => {
  sessionStorage.setItem("token", token);
};

export const getTokenFromSession = () => {
  return sessionStorage.getItem("token");
};
