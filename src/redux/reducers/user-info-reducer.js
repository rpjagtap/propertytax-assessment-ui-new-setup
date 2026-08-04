const initialState = {
  userInfo: {
    userId: "",
    userCode: "",
    userName: "",
    emailAddress: "",
    mobileNumber: "",
    profileId: "",
    profileName: "",
    valid: false,
  },
  activeMenu: {
    menu: "",
    subMenu: "",
    subMenuLink: "",
  },
  lang: "ma",
};

const userInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER_MENU":
      return {
        ...state,
        userMenu: action.payload,
      };
    case "SET_USER_INFO":
      const {
        userId,
        userCode,
        userName,
        mobileNumber,
        valid,
        otpverified,
        emailAddress,
        profileName,
      } = action.payload;

      return {
        ...state,
        userInfo: {
          userId,
          userCode,
          userName,
          mobileNumber,
          valid,
          otpverified,
          profileName,
          emailAddress,
        },
      };
    case "SET_ACTIVE_MENU":
      return { ...state, activeMenu: action.payload };
    case "SET_LANG":
      return { ...state, lang: action.payload };
    case "RESET":
      return { ...initialState };
    case "RESET_MENU":
      return { ...state, userMenu: "" };
    default:
      return state;
  }
};

export default userInfoReducer;
