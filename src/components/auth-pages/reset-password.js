import React, { useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import DashBoardContainer from "../layout/dashboard-container";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Grid } from "@mui/material";
import FormButtons from "../common/buttons";
import { useFormik } from "formik";
import { getResetPassword } from "../../services/assessment-services";
import { getUserDetails } from "../../utils/sessionUtils";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";

export default function ResetPassword() {
  const userDetails = getUserDetails();
  const userCode = userDetails?.userCode || "";

  const formik = useFormik({
    initialValues: {
      userCode: userCode,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          userCode: values.userCode,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        };

        const res = await getResetPassword(values);
        showToastSuccess(res);
        console.log(res);
        resetForm();
      } catch (err) {
        console.error(err);
        showToastError(getErrorMsg(err));
      }
    },
  });

  return (
    <DashBoardContainer>
      <Paper
        sx={{
          margin: "auto",
          marginTop: "2%",
          //   fontFamily: "serif",
        }}
        elevation={0}
      >
        <Box
          sx={{
            width: "45%",
            margin: "auto",
            // background: "#e1fcff",
            padding: "38px",
            paddingTop: "1%",

            border: "1px solid #cecbcbff",
          }}
        >
          <Typography
            variant="h6"
            sx={{ textAlign: "center", mb: 2, fontWeight: "500" }}
          >
            Password Change Form
          </Typography>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    width: "35%",
                    textAlign: "right",
                    padding: "10px",
                    fontSize: "15px",
                    fontWeight: "400",
                  }}
                >
                  User Code
                </td>
                <td>
                  <input
                    style={{
                      width: "300px",
                      height: "28px",
                      paddingLeft: "5px",
                      border: "1px solid #8e8c8cff",
                    }}
                    // value={form.userCode}
                    // name="userCode"
                    value={formik.values.userCode}
                    onChange={formik.handleChange}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    textAlign: "right",
                    padding: "10px",
                    fontSize: "15px",
                    fontWeight: "400",
                  }}
                >
                  Old Password
                </td>
                <td>
                  <input
                    type="password"
                    name="oldPassword"
                    // value={form.oldPassword}
                    value={formik.values.oldPassword}
                    onChange={formik.handleChange}
                    // onChange={handleChange}
                    style={{
                      width: "300px",
                      height: "28px",
                      paddingLeft: "5px",
                      border: "1px solid #8e8c8cff",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    textAlign: "right",
                    padding: "10px",
                    fontSize: "15px",
                    fontWeight: "400",
                  }}
                >
                  New Password
                </td>
                <td>
                  <input
                    type="password"
                    name="newPassword"
                    // value={form.newPassword}
                    // onChange={handleChange}
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    style={{
                      width: "300px",
                      height: "28px",
                      paddingLeft: "5px",
                      border: "1px solid #8e8c8cff",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    textAlign: "right",
                    padding: "10px",
                    fontSize: "15px",
                    fontWeight: "400",
                  }}
                >
                  Confirm Password
                </td>
                <td>
                  <input
                    type="password"
                    name="confirmPassword"
                    // value={form.confirmPassword}
                    // onChange={handleChange}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    style={{
                      width: "300px",
                      height: "28px",
                      paddingLeft: "5px",
                      border: "1px solid #8e8c8cff",
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <Grid container justifyContent="center">
            <Grid item md={3} p={2}>
              <FormButtons
                isValid={false}
                handleSubmitButtonClick={formik.handleSubmit}
                resetForm={formik.resetForm}
                submitBtnLabel="Save"
                isSubmitIcon={false}
              />
            </Grid>
          </Grid>{" "}
        </Box>
      </Paper>
    </DashBoardContainer>
  );
}
