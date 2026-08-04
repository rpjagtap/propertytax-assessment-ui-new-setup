import React, { useState, useEffect } from "react";
import { Fab, Tooltip } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material"; // Use down arrow icon
import Zoom from "@mui/material/Zoom";

const ScrollBottom = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    // Show the button when the user scrolls up from the bottom (instead of down from the top)
    if (
      window.scrollY + window.innerHeight <
      document.documentElement.scrollHeight - 200
    ) {
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
      top: document.documentElement.scrollHeight, // Scroll to the bottom
      behavior: "smooth",
    });
  };

  return (
    <Zoom in={visible}>
      <Tooltip title="Go Down" arrow>
        <Fab
          color="primary"
          size="medium"
          onClick={handleClick}
          sx={{ position: "fixed", top: 150, right: 16 }}
        >
          <KeyboardArrowDown /> {/* Change icon to down arrow */}
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ScrollBottom;
