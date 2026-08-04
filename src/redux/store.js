import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import userInfoReducer from "./reducers/user-info-reducer";
// Combine Reducers
const rootReducer = combineReducers({
  userDetails: userInfoReducer,
  // Add other reducers here if you have more
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
