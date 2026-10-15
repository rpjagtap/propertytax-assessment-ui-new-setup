import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import { labels } from "../../lang/labels";
import { useSearchParams } from "react-router-dom";
import { useFormikContext } from "formik";
import { getApplicationDetail } from "../../services/assessment-services";

// Theme tokens — same values used across the other redesigned pages.
const NAVY = "#12233F";
const MINT = "#0F6E56";
const MINT_BG = "#E1F5EE";

// Small caption that labels a group of related fields inside the card.
const GroupCaption = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

const OwnerInfoForm = React.memo(() => {
  const lang = useSelector((state) => state.userDetails?.lang);
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationNo");
  const { setFieldValue } = useFormikContext();

    const fetchApplicationDetail = async () => {
    try {
      const response = await getApplicationDetail({ applicationId });
      const data = response.propertyTransactionVO?.[0];

      if (!data) {
        console.log("Application details not found");
        return;
      }
      setFieldValue("marFirstOwnerName", data.applicantName || "");
      setFieldValue("ownerMobile", data.applicantMobile || "");
      setFieldValue("ownerEmail", data.applicantEmail || "");
    } catch (error) {
      console.error("Error fetching application detail:", error);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  return (
    <Box>
      {/* Section header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: MINT_BG, color: MINT }}>
          <PersonOutline fontSize="small" />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: NAVY }}>
            {labels?.ownerDetails?.[lang] || "Owner Details"}
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <GroupCaption>{labels.DocName[lang]}</GroupCaption>
          <GridRow>
            <FormLabel label={labels.NameMarathi[lang]} required />
            <FormValue component={<TextInput name="marFirstOwnerName" />} />
            <FormLabel label={labels.NameEnglish[lang]} required />
            <FormValue component={<TextInput name="engFirstOwnerName" />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>{labels.Contact[lang]}</GroupCaption>
          <GridRow>
            <FormLabel label={labels.MobileNo[lang]} required />
            <FormValue component={<TextInput name="ownerMobile" />} />
            <FormLabel label={labels.emailId[lang]} />
            <FormValue component={<TextInput name="ownerEmail" />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>{labels.Identity[lang]}</GroupCaption>
          <GridRow>
            <FormLabel label={labels.AadhaarNo[lang]}  />
            <FormValue component={<TextInput name="ownerAdharNo" />} />
          </GridRow>
        </CardContent>
      </Card>
    </Box>
  );
});

export default OwnerInfoForm;