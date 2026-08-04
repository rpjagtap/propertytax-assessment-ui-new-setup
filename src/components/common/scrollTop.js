import React, { useState, useEffect } from "react";
import { Fab, Tooltip } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
// import useScrollTrigger from '@mui/material/useScrollTrigger';
import Zoom from "@mui/material/Zoom";

const ScrollTop = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Zoom in={visible}>
      <Tooltip title="Go Top" arrow>
        <Fab
          color="primary"
          size="medium"
          onClick={handleClick}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ScrollTop;
