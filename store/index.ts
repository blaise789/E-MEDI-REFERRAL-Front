import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSliceV1 } from "./api/apiSliceV1";
import { authReducer } from "./features/auth/authSlice";
import { referralReducer } from "./features/referral/referralSlice";
import { userReducer } from "./features/user/userSlice";
import { hospitalReducer } from "./features/hospital/hospitalSlice";
import { patientReducer } from "./features/patient/patientSlice";

export const store = configureStore({
  reducer: {
    [apiSliceV1.reducerPath]: apiSliceV1.reducer,
    auth: authReducer,
    referral: referralReducer,
    user: userReducer,
    hospital: hospitalReducer,
    patient: patientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSliceV1.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
