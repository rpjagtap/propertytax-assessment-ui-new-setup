import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { profileWisePendingApplication } from "../../services/assessment-services";
import useApiState from "../common/useApiState";
import { showToastError } from "../common/toastHelper";
import { getErrorMsg } from "../../utils/helpers";
import { CheckCircle, HourglassTop } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const StatusCards = () => {
  const [data, setData] = useState([]);
  const { loading, setLoading } = useApiState();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await profileWisePendingApplication();
        setData(res);
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {data.map((status, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  backgroundColor:
                    status.totalApplications > 0 ? "#E7F6E7" : "#E3F2FD",
                  textAlign: "center",
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <CardContent
                  onClick={() => {
                    navigate(`/AssessmentDashboard?stage=${status.formStatus}`);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      fontSize: 40,
                      color:
                        status.totalApplications > 0
                          ? "warning.main"
                          : "info.main",
                    }}
                  >
                    {status.totalApplications > 0 ? (
                      <HourglassTop
                        sx={{ color: "orange", fontSize: "3rem" }}
                      />
                    ) : (
                      <CheckCircle sx={{ color: "green", fontSize: "3rem" }} />
                    )}
                  </Box>
                  {/* Title */}
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      color:
                        status.totalApplications > 0
                          ? "warning.main"
                          : "info.main",
                    }}
                  >
                    {status.formStatus}
                  </Typography>
                  {/* Description */}
                  {/* <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                                    Test sjhdsvfhsbf stshvfsjd sjdfvshdfj
                                </Typography> */}
                  {/* Status ID */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "inline-block",
                      backgroundColor:
                        status.totalApplications > 0
                          ? "warning.main"
                          : "info.main",
                      color: "white",
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    {status.totalApplications}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StatusCards;
