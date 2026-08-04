import React from "react";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import { labels } from "../../lang/labels";
import { useSelector } from "react-redux";
import {
  Grid,
  Paper,
  Box,
  Typography,
} from "@mui/material";

const OwnerInfoForm = React.memo(() => {
  const lang = useSelector((state) => state.userDetails.lang);
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgb(204, 234, 244)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          margin: 5,
          borderRadius: 4,
          minHeight: "auto",
        }}
      >
        <Box>
          <Paper
            elevation={3}
            sx={{
              // width: "200%",
              padding: 5,
              marginLeft: "1.5%",
              borderRadius: 5,
              textAlign: "left",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bolder"
              align="center"
              paddingBottom={2}
              paddingTop={2}
            >
              {labels?.ownerDetails?.[lang] || ""}
            </Typography>
            <Grid container alignItems="flex-start" justifyContent="flex-start">
              <GridRow>
                <FormLabel label={labels.NameMarathi[lang]} required />
                <FormValue component={<TextInput name="marFirstOwnerName" variant="standard" />} />
                <FormLabel label={labels.NameEnglish[lang]} required />
                <FormValue component={<TextInput name="engFirstOwnerName" variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.MobileNo[lang]} required />
                <FormValue component={<TextInput name="ownerMobile" variant="standard" />} />
                <FormLabel label={labels.emailId[lang]} />
                <FormValue component={<TextInput name="ownerEmail" variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.AadhaarNo[lang]} required />
                <FormValue component={<TextInput name="ownerAdharNo" variant="standard" />} />
              </GridRow>

              


              {/* <GridRow>
                <FormLabel label={labels.LastName[lang]} required />
                <FormValue component={<TextInput name="marLastOwnerName" />} />
                <FormLabel label={labels.FirstNameEnglish[lang]} required />
                <FormValue component={<TextInput name="engFirstOwnerName" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.MiddleNameEnglish[lang]} required />
                <FormValue component={<TextInput name="engMiddleOwnerName" />} />
                <FormLabel label={labels.LastNameEnglish[lang]} required />
                <FormValue component={<TextInput name="engLastOwnerName" />} />
              </GridRow> */}
              
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
});

export default OwnerInfoForm;