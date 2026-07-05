/** @format */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_API_URL } from "@/lib/constants";
export const apiSliceV1 = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state?.auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Hospital",
    "Referral",
    "Patient",
    "Ward",
    "Specialist",
    "Notification",
    "AuditLog",
  ],
  endpoints: (builder) => ({}),
});
