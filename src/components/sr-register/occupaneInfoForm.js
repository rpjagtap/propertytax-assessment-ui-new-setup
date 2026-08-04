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
  TextField
} from "@mui/material";

const OccupantInfoForm = React.memo(() => {
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
              {labels?.OccupantDetails?.[lang] || ""}
            </Typography>
            <Grid container alignItems="flex-start" justifyContent="flex-start">
              <GridRow>
                <FormLabel label={labels.NameMarathi[lang]} required />
                <FormValue component={<TextInput name="marFirstOccupantName" variant="standard" />} />
                <FormLabel label={labels.NameEnglish[lang]} required />
                <FormValue component={<TextInput name="engFirstOccupantName" variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.OccupantMobileNo[lang]} required />
                <FormValue component={<TextInput name="occupantMobile" required variant="standard" />} />
                <FormLabel label={labels.OccupantEmailId[lang]} />
                <FormValue component={<TextInput name="occupantEmail" variant="standard" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.OccupantAadhaarNo[lang]} required />
                <FormValue component={<TextInput name="occupantAdharNo" variant="standard" />} />
              </GridRow>

              {/* <GridRow>
                <FormLabel label={labels.OccupantLastName[lang]} required />
                <FormValue component={<TextInput name="engLastOccupantName" />} />
                <FormLabel label={labels.OccupantFirstNameEnglish[lang]} required />
                <FormValue component={<TextInput name="marFirstOccupantName" />} />
              </GridRow>
              <GridRow>
                <FormLabel label={labels.OccupantMiddleNameEnglish[lang]} required />
                <FormValue component={<TextInput name="marMiddleOccupantName" />} />
                <FormLabel label={labels.OccupantLastNameEnglish[lang]} required />
                <FormValue component={<TextInput name="marLastOccupantName" />} />
              </GridRow> */}
              
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
});

export default OccupantInfoForm;
