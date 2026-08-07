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
import RecursiveSubMenu from "./RecursiveSubMenu";

// import { capitalizeFirstLetter } from "../../utils/helpers";

// Compares interfaceIds like "05.02" vs "05.10" numerically segment-by-segment
// (plain string comparison would wrongly put "05.10" before "05.2")
const compareInterfaceIds = (a, b) => {
  const partsA = a.interfaceId.split(".").map(Number);
  const partsB = b.interfaceId.split(".").map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA !== numB) return numA - numB;
  }
  return 0;
};

// Recursively sorts a node's children (and grandchildren, etc.) by interfaceId
const sortTree = (nodes) => {
  nodes.sort(compareInterfaceIds);
  nodes.forEach((node) => {
    if (node.children.length > 0) {
      sortTree(node.children);
    }
  });
  return nodes;
};

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

  sortTree(tree);

  return tree;
};

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sessionData = getUserDetails();
  const menuData = useSelector((state) => state.userDetails.userMenu);

  // Per-menu-level open state instead of a single shared anchor, so nested
  // submenus don't close their parent the moment they open.
  // Shape: { [interfaceId]: anchorElDomNode }
  const [openMenus, setOpenMenus] = useState({});
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

  // Opens the menu for a given interfaceId, anchored to the hovered/clicked element
  const handleMenuOpen = (event, menuId) => {

    setOpenMenus(prev => {

      const updated = {};

      // Keep only parents of current menu open.
      Object.keys(prev).forEach(key => {

        if (
          menuId.startsWith(key + ".") ||
          key === menuId
        ) {
          updated[key] = prev[key];
        }

      });

      updated[menuId] = event.currentTarget;

      return updated;

    });

  };

  // Closes a specific menu AND all of its descendant submenus
  // (interfaceId "04.02" is a descendant of "04", "04.02.01" is a descendant of "04.02", etc.)
  const closeMenuAndChildren = (menuId) => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key === menuId || key.startsWith(menuId + ".")) {
          delete next[key];
        }
      });
      return next;
    });
  };

  // Closes everything (used after navigation / final click)
  const handleMenuCloseAll = () => {
    setOpenMenus({});
  };

  const handleMenuClick = (menu, subMenuLink, displayName) => {
    handleMenuCloseAll();

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



  const renderMenuItems = () =>
    menuData.map((menu) => (
      <div
        key={menu.interfaceId}
        //onMouseLeave={() => closeMenuAndChildren(menu.interfaceId)}
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
            background: openMenus[menu.interfaceId]
              ? "rgba(255,255,255,.15)"
              : "transparent",
          }}
        >
          {menu.enDisplayName}

          {menu.children.length > 0 && (
            <ExpandMoreIcon fontSize="small" />
          )}
        </span>

        {menu.children.length > 0 && (
          <Menu
            anchorEl={openMenus[menu.interfaceId] || null}
            open={Boolean(openMenus[menu.interfaceId])}
            onClose={() => closeMenuAndChildren(menu.interfaceId)}
            PaperProps={{
              elevation: 6,
              sx: {
                minWidth: 260,
                borderRadius: 2,
                width:"340px",
                overflow: "visible", // IMPORTANT
              },
            }}
          >
            <RecursiveSubMenu
              items={menu.children}
              parentMenu={menu.enDisplayName}
              onMenuClick={handleMenuClick}
            />
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