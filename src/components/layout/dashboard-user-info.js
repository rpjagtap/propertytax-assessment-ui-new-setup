// eslint-disable-next-line no-unused-vars
import { Avatar, Box, Breadcrumbs, Chip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getUserDetails } from "../../utils/sessionUtils";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import LanguageSelector from "../form-fields/language-selector";

const UserInfo = () => {
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState({
    menu: "",
    subMenu: "",
  });

  const userDetails = getUserDetails();
  const menuData = useSelector((state) => state.userDetails.userMenu);

  useEffect(() => {
    if (menuData) {
      let data;
      menuData.forEach((element) => {
        data = element.find((item) => {
          return item.formName === location.pathname.replace("/", "");
        });
      });
      if (data) {
        setActiveMenu(data);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuData]);

  if (!userDetails) {
    return "";
  }
  return (
    <Box
      display="flex"
      sx={{
        background: "#f0f0f0",
        justifyContent: { xs: "end", sm: "end", md: "space-between" },
        maxHeight: "19px",
      }}
    >
      <Breadcrumbs
        separator=">"
        aria-label="breadcrub"
        sx={{
          fontSize: "smaller",
          margin: "2px",
          background: "#f0f0f0",
          color: "black",
          underline: "hover",
          display: { xs: "none", sm: "none", md: "block" }, // Hide on xs and sm screens
          marginLeft: "5px",
        }}
      >
        {[
          <span key={1}>
            <Typography variant="subtitle2">{activeMenu.moduleName}</Typography>
          </span>,
          activeMenu && (
            <span key={2}>
              <Typography variant="subtitle2">
                {activeMenu.displayName || location.pathname.replace("/", "")}
              </Typography>
            </span>
          ),
        ]}
      </Breadcrumbs>
      <Box display="flex" fontSize="smaller" alignItems="center">
        <div style={{ paddingRight: "5px" }}>
          Code: <b>{userDetails.userCode || "-"}</b>
          {/* Code
           <Chip
            color="primary"
            variant="outlined"
            label={userDetails.userCode}
          /> */}
        </div>
        {/*<div style={{ paddingRight: "5px" }}>
          Post: <b>{userDetails.profileName || "-"}</b>
        </div>
        <div style={{ paddingRight: "5px" }}>
          Mobile No.: <b>{userDetails.mobileNumber || "-"}</b>
        </div>*/}
        <div style={{ paddingRight: "5px" }}>
          Name: <b>{userDetails.userName || "-"}</b>
        </div>
        <>
          <LanguageSelector />
        </>
      </Box>
    </Box>
  );
};

export default UserInfo;
