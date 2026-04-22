/** @format */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";
import { apiSliceV1 } from "../../api/apiSliceV1";

interface AuthState {
  user: User | null;
  token: string | null;
}

const TOKEN_KEY = "mediReferToken";

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
};

export const authApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "accounts/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => "accounts/profile",
      providesTags: ["User"],
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "accounts/register",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (code) => ({
        url: "auth/verify-email",
        method: "POST",
        body: { code },
      }),
    }),
    resendEmailCode: builder.mutation({
      query: (email) => ({
        url: "auth/resend-verification-email",
        method: "POST",
        body: { email },
      }),
    }),
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: "auth/request-password-reset",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "accounts/profile",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendEmailCodeMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem(TOKEN_KEY, token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<{ access_token: string; user: User }>) => {
        const { access_token, user } = action.payload;
        state.token = access_token;
        state.user = user;
        localStorage.setItem(TOKEN_KEY, access_token);
      }
    );
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      }
    );
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice;
