import React, { useState } from "react";
import {
    Modal,
    Box,
    IconButton,
    Typography,
    Divider,
    Grid,
    TextField,
    Button,
    // MenuItem,
    // Select,
    // FormControl,
    // InputLabel,
} from "@mui/material";
import Close from "@mui/icons-material/Close";

export const UpdateAddress = ({ setOpenModalId, handleUpdateAddress, data }) => {
    // Separate Marathi and English addresses from data
    const [marathiAddress, setMarathiAddress] = useState(data.find((item) => item.languageType === "Marathi") || []);
    const [englishAddress, setEnglishAddress] = useState(data.find((item) => item.languageType === "English") || []);

    const handleInputChange = (language, field, value) => {
        if (language === "Marathi") {
            setMarathiAddress((prev) => ({ ...prev, [field]: value }));
        } else if (language === "English") {
            setEnglishAddress((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = () => {
        const updatedData = [{ ...marathiAddress }, { ...englishAddress }];

        // Exclude `lstVillage` before submission
        // delete updatedData.marathiAddress.lstVillage;
        // delete updatedData.englishAddress.lstVillage;
        // console.log("!!updatedData",updatedData)
        handleUpdateAddress(updatedData);
        // setOpenModalId("");
    };

    const capitalizedKey = (modifiedKey) => {
        const key = modifiedKey;
        return key.charAt(0).toUpperCase() + modifiedKey.slice(1);
    };

    return (
        <Modal
            open={true}
            onClose={() => {
                setOpenModalId("");
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 1000,
                    bgcolor: "background.paper",
                    border: "1px solid #000",
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={() => {
                        setOpenModalId("");
                    }}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
                <Grid sx={{ display: "flex", justifyContent: "left", marginBottom: "10px" }}>
                    <Typography variant="h5" component="h2">
                        Update Address
                    </Typography>
                </Grid>
                <Divider />
                <Grid container m={2} spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
                    {/* Marathi Address */}
                    <Grid item xs={6}>
                        <Typography sx={{ marginBottom: 2 }}>Marathi</Typography>
                        <Grid container spacing={2} justifyContent="center" width="80%">
                            {Object.keys(marathiAddress)
                                .filter((key) => key !== "lstVillage" && key !== "languageType") // Exclude lstVillage from rendering
                                .map((key) => (
                                    <Grid
                                        item
                                        xs={
                                            key === "pinCode" ||
                                            key === "villageMarathi" ||
                                            key === "flatNo" ||
                                            key === "floorMarathi"
                                                ? 6
                                                : 12
                                        }
                                        key={key}
                                    >
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={capitalizedKey(key.replace(/([A-Z])/g, " $1"))}
                                            variant="outlined"
                                            value={marathiAddress[key] || ""}
                                            onChange={(e) => handleInputChange("Marathi", key, e.target.value)}
                                        />
                                    </Grid>
                                ))}
                        </Grid>
                    </Grid>

                    {/* English Address */}
                    <Grid item xs={6}>
                        <Typography sx={{ marginBottom: 2 }}>English</Typography>
                        <Grid container spacing={2} justifyContent="center" width="80%">
                            {Object.keys(englishAddress)
                                .filter((key) => key !== "lstVillage" && key !== "languageType") // Exclude lstVillage from rendering
                                .map((key) => (
                                    <Grid
                                        item
                                        xs={
                                            key === "pinCode" || key === "village" || key === "flatNo" || key === "floor" ? 6 : 12
                                        }
                                        key={key}
                                    >
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={capitalizedKey(key.replace(/([A-Z])/g, " $1"))}
                                            variant="outlined"
                                            value={englishAddress[key] || ""}
                                            onChange={(e) => handleInputChange("English", key, e.target.value)}
                                        />
                                    </Grid>
                                ))}
                        </Grid>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Grid sx={{ display: "flex", justifyContent: "center" }} mt={4}>
                    <Button variant="contained" sx={{ marginRight: "25px" }} color="success" onClick={handleSubmit}>
                        Update
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenModalId("");
                        }}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Box>
        </Modal>
    );
};
