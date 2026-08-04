import React, { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { capitalizeFirstLetter, getErrorMsg } from "../../utils/helpers";
import useApiState from "../pcmc-menu/common/useApiState";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { resendOtp } from "../../services/user";
import { useSelector } from "react-redux";
import {
  AccessTime,
  Refresh,
} from "@mui/icons-material";
// import { toast } from "react-toastify";

const ResendOTPButton = () => {
  const [timer, setTimer] = useState(60); // 1 minute timer
  const [isDisabled, setIsDisabled] = useState(true);
  const { setLoading } = useApiState();
  const userInfo = useSelector((state) => state.userDetails.userInfo);

  useEffect(() => {
    let interval;

    // If timer is running, start the countdown
    if (isDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    // Enable button when timer reaches 0
    if (timer === 0) {
      setIsDisabled(false);
      clearInterval(interval);
    }

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [isDisabled, timer]);

  const handleResendOTP = async () => {
    // Logic to resend OTP goes here, for example, an API call
    try {
      setLoading(true);
      setIsDisabled(true);
      await resendOtp(userInfo.userCode);
      showToastSuccess(
        `OTP sent on ${userInfo.mobileNumber
          .slice(-4)
          .padStart(userInfo.mobileNumber.length, "*")} successfully`
      );
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }

    // toast.promise(
    //   resendOtp(userInfo.mobileNumber, userInfo.userCode), // The promise
    //   {
    //     // pending: "Resending OTP...",      // Message while the promise is pending
    //     success: "OTP has been sent 👌", // Message when promise resolves
    //     error: "Failed to resend OTP 🤯", // Message when promise rejects
    //   }
    // );
    // Reset timer and disable the button again
    setTimer(60);
    setIsDisabled(true);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleResendOTP}
      disabled={isDisabled}
      endIcon={isDisabled ? <AccessTime /> : <Refresh />}
    >
      {isDisabled ? (
        <>
          Resend OTP in{" "}
          <Typography
            component="span"
            sx={{ paddingLeft: "10px", color: "green" }} // Highlighted text style
          >
            {timer} {capitalizeFirstLetter("Seconds")}
          </Typography>
        </>
      ) : (
        "Resend OTP"
      )}
    </Button>
  );
};

export default ResendOTPButton;
