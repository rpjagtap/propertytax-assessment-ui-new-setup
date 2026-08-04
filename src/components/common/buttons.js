import React from "react";
import PropTypes from "prop-types";
import { Button, Stack } from "@mui/material";
// import { Receipt } from "@mui/icons-material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { labels } from "../../lang/labels";

const FormButtons = ({
  isValid,
  handleSubmitButtonClick,
  resetForm,
  submitBtnLabel,
  isSubmitIcon = true,
  cancelRedirect = "/home",
}) => {
  const lang = useSelector((state) => state.userDetails.lang);

  const navigate = useNavigate();
  return (
    <Stack
      spacing={2}
      direction={{ xs: "column", sm: "row" }} // column for mobile, row for larger screens
      sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
      justifyContent={{ sm: "center" }}
    >
      <Button
        variant="contained"
        size="small"
        disabled={isValid}
        // endIcon={isSubmitIcon && <Receipt />}
        onClick={handleSubmitButtonClick}
      >
        {submitBtnLabel || "Submit"}
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={resetForm}
        color="warning"
        endIcon={<RestartAltIcon />}
      >
        {labels.Reset[lang]}
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={() => navigate(cancelRedirect)}
      >
        {labels.Cancel[lang]}
      </Button>
    </Stack>
  );
};

FormButtons.propTypes = {
  isValid: PropTypes.bool.isRequired,
  handleSubmitButtonClick: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  submitBtnLabel: PropTypes.string,
  isSubmitIcon: PropTypes.bool,
  cancelRedirect: PropTypes.string, 
};

export default FormButtons;
