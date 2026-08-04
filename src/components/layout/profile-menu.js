import React, { useState } from "react";
import { Box, Menu, MenuItem, Tooltip, Typography, Stack } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
export default function ProfileMenu({
  handleLogoutClick,
  handleViewProfileClick,
  userCode,
  handleResetProfile,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    // Handle view profile action
    handleMenuClose();
    handleViewProfileClick();
  };

  // const handleResetProfile = () => {};
  // const handleSignOut = () => {
  //   // Handle sign out action
  //   handleMenuClose();
  // };

  // const getInitial = (name = "") => {
  //   return name.charAt(0).toUpperCase();
  // };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Tooltip title="Profile">
        <Box
          onClick={handleMenuOpen}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "2px 5px",
            marginRight: "5px",
            borderRadius: "4px",
            // backgroundColor: "#124981",
             background: "linear-gradient(90deg,#0D47A1,#1976D2,#42A5F5)",
            "&:hover": {
              // backgroundColor: "#1b7de0",
               background: "linear-gradient(90deg,#0D47A1,#1976D2,#42A5F5)",
            },
          }}
        >
          <>
            <Stack spacing={0.2}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  // color: "black",
                  fontSize: "14px",
                  letterSpacing: 0,
                  lineHeight: 1,
                }}
              >
                {userCode}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  // color: "#666",
                  fontSize: "10px",
                  letterSpacing: 0,
                  lineHeight: 1,
                }}
              >
                Profile | ResetPassword | Logout
              </Typography>
            </Stack>
            <KeyboardArrowDownIcon />
          </>

          {/* <Avatar
            sx={{
              bgcolor: "#55a3f1",
              width: 32,
              height: 32,
              marginLeft: "8px",
            }}
          >
            {getInitial(userCode)}
          </Avatar> */}
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={handleViewProfile}>
          <AccountCircleOutlinedIcon sx={{ marginRight: "5px" }} />
          My Profile
        </MenuItem>
        <MenuItem onClick={handleResetProfile}>
          <LockResetIcon sx={{ marginRight: "5px" }} />
          Reset Password
        </MenuItem>

        <MenuItem onClick={handleLogoutClick} end>
          <LogoutOutlinedIcon sx={{ marginRight: "5px" }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
