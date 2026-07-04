/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Referral, CreateReferralRequest, ReferralStatus, CounterReferral, CreateCounterReferralRequest } from "@/lib/types";

export const referralApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getReferrals: builder.query<Referral[], { hospitalId?: string; search?: string; nationalId?: string; status?: string; startDate?: string; endDate?: string } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if ('hospitalId' in filters && filters.hospitalId) params.set('hospitalId', filters.hospitalId);
          if ('search' in filters && filters.search) params.set('search', filters.search);
          if ('nationalId' in filters && filters.nationalId) params.set('nationalId', filters.nationalId);
          if ('status' in filters && filters.status) params.set('status', filters.status);
          if ('startDate' in filters && filters.startDate) params.set('startDate', filters.startDate);
          if ('endDate' in filters && filters.endDate) params.set('endDate', filters.endDate);
        }
        const qs = params.toString();
        return qs ? `referrals?${qs}` : 'referrals';
      },
      providesTags: ['Referral'],
    }),
    getReferralById: builder.query<Referral, string>({
      query: (id) => `referrals/${id}`,
      providesTags: (result, error, id) => [{ type: "Referral", id }],
    }),
    createReferral: builder.mutation<Referral, CreateReferralRequest>({
      query: (data) => ({
        url: "referrals",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Referral"],
    }),
    updateReferralStatus: builder.mutation<Referral, { id: string; status: ReferralStatus }>({
      query: ({ id, status }) => ({
        url: `referrals/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Referral", id }, "Referral"],
    }),
    addCounterReferral: builder.mutation<CounterReferral, { id: string; data: CreateCounterReferralRequest }>({
      query: ({ id, data }) => ({
        url: `referrals/${id}/counter`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Referral", id }, "Referral"],
    }),
  }),
});

export const { 
  useGetReferralsQuery, 
  useGetReferralByIdQuery, 
  useCreateReferralMutation,
  useUpdateReferralStatusMutation,
  useAddCounterReferralMutation,
} = referralApi;

const referralSlice = createSlice({
  name: "referral",
  initialState: {
    referrals: [] as Referral[],
    activeReferral: null as Referral | null,
  },
  reducers: {
    setActiveReferral: (state, action) => {
      state.activeReferral = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      referralApi.endpoints.getReferrals.matchFulfilled,
      (state, action) => {
        state.referrals = action.payload;
      },
    );
    builder.addMatcher(
      referralApi.endpoints.getReferralById.matchFulfilled,
      (state, action) => {
        state.activeReferral = action.payload;
      },
    );
  },
});

export const { setActiveReferral } = referralSlice.actions;
export const referralReducer = referralSlice.reducer;
export default referralSlice;
