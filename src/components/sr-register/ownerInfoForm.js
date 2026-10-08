import React from "react";
import { useSelector } from "react-redux";
import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { GridRow, FormLabel, FormValue } from "../common/custom-form-grid";
import TextInput from "../form-fields/text-input";
import { labels } from "../../lang/labels";

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
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Owner name in both languages, contact details and Aadhaar number
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <GroupCaption>Name</GroupCaption>
          <GridRow>
            <FormLabel label={labels.NameMarathi[lang]} required />
            <FormValue component={<TextInput name="marFirstOwnerName" />} />
            <FormLabel label={labels.NameEnglish[lang]} required />
            <FormValue component={<TextInput name="engFirstOwnerName" />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>Contact</GroupCaption>
          <GridRow>
            <FormLabel label={labels.MobileNo[lang]} required />
            <FormValue component={<TextInput name="ownerMobile" />} />
            <FormLabel label={labels.emailId[lang]} />
            <FormValue component={<TextInput name="ownerEmail" />} />
          </GridRow>

          <Divider sx={{ my: 2.5 }} />

          <GroupCaption>Identity</GroupCaption>
          <GridRow>
            <FormLabel label={labels.AadhaarNo[lang]} required />
            <FormValue component={<TextInput name="ownerAdharNo" />} />
          </GridRow>
        </CardContent>
      </Card>
    </Box>
  );
});

export default OwnerInfoForm;