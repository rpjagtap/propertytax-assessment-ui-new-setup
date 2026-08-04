import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  MenuList,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
// import { ArrowDropDown, Menu as MenuIcon } from "@mui/icons-material";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { useTheme } from "@mui/material/styles";

const HeaderRes = () => {
  const [anchorNav, setAnchorNav] = useState(null);

  const openMenu = (event) => {
    setAnchorNav(event.currentTarget);
  };

  // const closeMenu = (event) => {
  //   setAnchorNav(null);
  // };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <AdminPanelSettingsIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
        >
          Property Tax Dashboard
        </Typography>
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Button color="inherit">Home</Button>
          <Button color="inherit">Contact</Button>
          <Button color="inherit">Features</Button>
          <Button color="inherit">LOGOUT</Button>
        </Box>

        {/* Mobile View */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={openMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu open={Boolean(anchorNav)}>
            <MenuList>
              <MenuItem>Home</MenuItem>
              <MenuItem>Contact</MenuItem>
              <MenuItem>Features</MenuItem>
              <MenuItem>LOGOUT</MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <AdminPanelSettingsIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
        >
          Property Tax Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderRes;
