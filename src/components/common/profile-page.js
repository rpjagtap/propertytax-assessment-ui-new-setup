/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Grid,
    Card,
    CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DashBoardContainer from "../layout/dashboard-container";
import { getUserDetails } from "../../utils/sessionUtils";
import { useSelector } from "react-redux";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        userId: "",
        userCode: "",
        userName: "",
        zoneKey: "",
        gatKey: "",
        counterKey: "",
        emailAddress: "",
        profileName: "",
        profileId: "",
    });
    const userInfo = useSelector((state) => state.userDetails.userInfo);

    useEffect(() => {
        const user = getUserDetails();
        setUser(user);
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        // Handle saving the data, e.g., sending it to an API
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <DashBoardContainer>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "40px",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{ padding: 3, width: "600px", position: "relative" }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        My Account
                    </Typography>

                    {isEditing ? (
                        <>
                            <TextField
                                label="User ID"
                                name="userId"
                                value={user.userId}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                disabled
                            />
                            <TextField
                                label="User Code"
                                name="userCode"
                                value={user.userCode}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="User Name"
                                name="userName"
                                value={user.userName}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Zone Key"
                                name="zoneKey"
                                value={user.zoneKey}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Gat Key"
                                name="gatKey"
                                value={user.gatKey}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Counter Key"
                                name="counterKey"
                                value={user.counterKey}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                sx={{ mt: 2 }}
                                onClick={handleSaveClick}
                                fullWidth
                            >
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography
                                                variant="body2"
                                                component="div"
                                            >
                                                Username: {userInfo.userName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography
                                                variant="body2"
                                                component="div"
                                            >
                                                Profile Name:{" "}
                                                {userInfo.profileName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                Email: {userInfo.emailAddress}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                Mobile No:{" "}
                                                {userInfo.mobileNumber}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Paper>
            </Box>
        </DashBoardContainer>
    );
}
