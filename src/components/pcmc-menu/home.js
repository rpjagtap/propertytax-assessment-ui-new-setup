import React from "react";
import MainLayout from "../layout/dashboard-container";
import TimeDisplay from "./home-content";
// import Header from "../layout/header";
// import { Container } from "@mui/material";
const Home = () => {
  return (
    <MainLayout>
      <TimeDisplay />
    </MainLayout>
  );
};

export default Home;
