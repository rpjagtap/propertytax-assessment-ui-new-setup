/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  Box,
  Divider,
  Button,
  Tooltip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./styles.css"; // Import the CSS file
import { getUserWithMenuDetails } from "../../services/user";
import UserInfo from "./dashboard-user-info";
import { useDispatch, useSelector } from "react-redux";
import LogoutIcon from "@mui/icons-material/Logout";
import { clearSession, getUserDetails } from "../../utils/sessionUtils";
import { useNavigate } from "react-router-dom";
import Loader from "../loader/loader";
import PCMCHeader from "./pcmc-header";
import ProfileMenu from "./profile-menu";
import { Apartment, Assignment, FactCheck } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import { capitalizeFirstLetter } from "../../utils/helpers";

const buildMenuTree = (menuList) => {
  const map = {};
  const tree = [];

  // Create menu map
  menuList.forEach((item) => {
    map[item.interfaceId] = {
      ...item,
      children: [],
    };
  });

  // Create hierarchy
  menuList.forEach((item) => {
    const parts = item.interfaceId.split(".");

    if (parts.length === 1) {
      // Main menu
      tree.push(map[item.interfaceId]);
    } else {
      const parentId = parts.slice(0, -1).join(".");
      if (map[parentId]) {
        map[parentId].children.push(map[item.interfaceId]);
      }
    }
  });

  return tree;
};

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sessionData = getUserDetails();
  const menuData = useSelector((state) => state.userDetails.userMenu);

  const [menuState, setMenuState] = useState({
    anchorEl: null,
    menuId: null,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const getData = async () => {
      try {
        const res = await getUserWithMenuDetails(sessionData.userCode);
        setLoading(false);
        dispatch({
          type: "SET_USER_MENU",
          payload: buildMenuTree(res.menuDetailsRO),
        });
        const tree = buildMenuTree(res.menuDetailsRO);

        dispatch({
          type: "SET_USER_INFO",
          payload: res,
        });

      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    if (!menuData && window.location.pathname !== "/propertyTransfer") {
      setLoading(true);
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuOpen = (event, menuId) => {
    setMenuState({
      anchorEl: event.currentTarget,
      menuId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      menuId: null,
    });
  };

  const handleMenuClick = (menu, subMenuLink, displayName) => {
    handleMenuClose();

    dispatch({
      type: "SET_ACTIVE_MENU",
      payload: {
        menu,
        subMenu: displayName,
        subMenuLink,
      },
    });

    navigate(`/${subMenuLink}`);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const commonDrawerStyle = {
    "& .MuiDrawer-paper": {
      backgroundColor: "#0d67c0",
      color: "white",
    },
  };

  const renderSubMenu = (children, parentMenu) =>
    children.map((item) => {

      if (item.children.length > 0) {
        return (
          <MenuItem
            key={item.interfaceId}
            onMouseEnter={(e) =>
              handleMenuOpen(e, item.interfaceId)
            }
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: 250,
            }}
          >
            {item.enDisplayName}

            <ExpandMoreIcon fontSize="small" />

            <Menu
              anchorEl={menuState.anchorEl}
              open={
                menuState.menuId === item.interfaceId
              }
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {renderSubMenu(
                item.children,
                parentMenu
              )}
            </Menu>
          </MenuItem>
        );
      }

      return (
        <MenuItem
          sx={{
            fontSize: "13px",
            py: 1,
            "&:hover": {
              backgroundColor: "#E3F2FD",
              color: "#1565C0",
            },
          }}
          key={item.interfaceId}
          onClick={() =>
            handleMenuClick(
              parentMenu,
              item.formName,
              item.enDisplayName
            )
          }
        >
          {item.enDisplayName}
        </MenuItem>
      );
    });


  const renderMenuItems = () =>
    menuData.map((menu) => (
      <div
        key={menu.interfaceId}
        onMouseLeave={handleMenuClose}
        className="hover-background"
      >
        <span
          onClick={(e) => {
            if (menu.children.length > 0) {
              handleMenuOpen(e, menu.interfaceId);
            } else {
              handleMenuClick(
                menu.enDisplayName,
                menu.formName,
                menu.enDisplayName
              );
            }
          }}
          style={{
            cursor: "pointer",
            padding: "8px 14px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            color: "white",
            margin: "4px 6px",
            borderRadius: "4px",
            background:
              menuState.menuId === menu.interfaceId
                ? "rgba(255,255,255,.15)"
                : "transparent",
          }}
        >
          {menu.enDisplayName}

          {menu.children.length > 0 && (
            <ExpandMoreIcon
              sx={{
                ml: 0.5,
                fontSize: 18,
              }}
            />
          )}
        </span>

        {menu.children.length > 0 && (
          <Menu
            anchorEl={menuState.anchorEl}
            PaperProps={{
              elevation: 6,
              sx: {
                minWidth: 250,
                borderRadius: 2,
                mt: 0.5,
                boxShadow:
                  "0px 8px 24px rgba(0,0,0,.18)",
              },
            }}
            open={
              menuState.menuId === menu.interfaceId
            }
            onClose={handleMenuClose}
          >
            {renderSubMenu(
              menu.children,
              menu.enDisplayName
            )}
          </Menu>
        )}
      </div>
    ));

  const handleLogoutClick = (e) => {
    e.preventDefault();
    clearSession();
    dispatch({
      type: "RESET",
    });
    navigate("/login");
  };

  const handleResetProfile = (e) => {
    e.preventDefault();
    // clearSession();
    // dispatch({
    //   type: "RESET",
    // });
    navigate("/reset-password");
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </div>
      )} */}

      <PCMCHeader />

      <AppBar
        position="static"
        sx={{
          maxHeight: "40px",
          backgroundColor: "#1565C0",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "40px",
            paddingLeft: "2px !important",
            paddingRight: "2px !important",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Apartment />
            <Typography
              sx={{
                fontWeight: "bold",
                marginRight: "10px",
              }}
              onClick={() => {
                window.location.pathname === "/home"
                  ? navigate(0)
                  : navigate("/home");
              }}
            >
              Property Assessment
            </Typography>

            <Box sx={{ display: { sm: "flex", md: "none" } }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={commonDrawerStyle}
              >
                {menuData && renderMenuItems()}
              </Drawer>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {menuData && renderMenuItems()}
            </Box>
          </Box>

          {/* <Box>
            <Tooltip
              title="Sign Out"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "red",
                    color: "white",
                  },
                },
                arrow: {
                  sx: {
                    color: "red",
                  },
                },
              }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{
                  background: "red",
                  "&:hover": {
                    background: "red",
                  },
                }}
                onClick={handleLogoutClick}
              >
                <LogoutIcon />
              </Button>
            </Tooltip>
          </Box> */}
          <ProfileMenu
            userCode={sessionData.userCode}
            handleLogoutClick={handleLogoutClick}
            handleResetProfile={handleResetProfile}
            handleViewProfileClick={() => navigate("/profile")}
          />
        </Toolbar>
      </AppBar>

      {/* <UserInfo /> */}
    </div>
  );
};

export default DashboardHeader;
