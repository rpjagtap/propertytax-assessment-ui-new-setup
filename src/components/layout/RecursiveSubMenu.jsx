import React, { useRef, useState } from "react";
import { Box, Paper, MenuItem } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const RecursiveSubMenu = ({ items, parentMenu, onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  return (
    <Box sx={{ position: "relative" }}>
      {items.map((item) => (
        <Box
          key={item.interfaceId}
          sx={{ position: "relative", width: "100%", cursor: "pointer" }}
          onMouseEnter={() => {
            clearTimeout(closeTimer.current);

            openTimer.current = setTimeout(() => {
              setActiveMenu(item.interfaceId);
            }, 100);
          }}
          onMouseLeave={() => {
            clearTimeout(openTimer.current);

            closeTimer.current = setTimeout(() => {
              setActiveMenu(null);
            }, 150);
          }}
        >
          <MenuItem
            onClick={() => {
              if (!item.children.length) {
                onMenuClick(parentMenu, item.formName, item.enDisplayName);
              }
            }}
            sx={{
              width: '100%',
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {item.enDisplayName}

            {item.children.length > 0 && <ChevronRightIcon fontSize="small" />}
          </MenuItem>

          {item.children.length > 0 && activeMenu === item.interfaceId && (
            <Paper
              onMouseEnter={() => clearTimeout(closeTimer.current)}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(() => {
                  setActiveMenu(null);
                }, 150);
              }}
              elevation={6}
              sx={{
                position: "absolute",
                left: "100%",
                top: 0,
                minWidth: 260,
                zIndex: 9999,
              }}
            >
              <RecursiveSubMenu
                items={item.children}
                parentMenu={parentMenu}
                onMenuClick={onMenuClick}
              />
            </Paper>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default RecursiveSubMenu;
