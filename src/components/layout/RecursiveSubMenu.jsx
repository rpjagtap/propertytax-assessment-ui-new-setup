import React, { useRef, useState } from "react";
import { Box, Paper, MenuItem, useMediaQuery } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const RecursiveSubMenu = ({ items, parentMenu, onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  return (
    <Box sx={{ position: "relative" }}>
      {items.map((item) => (
        <Box
          key={item.interfaceId}
          sx={{ position: "relative", width: "100%", cursor: "pointer" }}
          onMouseEnter={() => {
            if (!canHover) return;
            clearTimeout(closeTimer.current);

            openTimer.current = setTimeout(() => {
              setActiveMenu(item.interfaceId);
            }, 100);
          }}
          onMouseLeave={() => {
            if (!canHover) return;
            clearTimeout(openTimer.current);

            closeTimer.current = setTimeout(() => {
              setActiveMenu(null);
            }, 150);
          }}
        >
          <MenuItem
            onClick={() => {
              if (item.children.length) {
                if (!canHover) {
                  setActiveMenu((current) => current === item.interfaceId ? null : item.interfaceId);
                }
              } else {
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
              onMouseEnter={() => canHover && clearTimeout(closeTimer.current)}
              onMouseLeave={() => {
                if (!canHover) return;
                closeTimer.current = setTimeout(() => {
                  setActiveMenu(null);
                }, 150);
              }}
              elevation={6}
              sx={{
                position: { xs: "relative", md: "absolute" },
                left: { xs: 0, md: "100%" },
                top: 0,
                minWidth: { xs: "100%", md: 260 },
                maxWidth: { xs: "calc(100vw - 32px)", md: "none" },
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
