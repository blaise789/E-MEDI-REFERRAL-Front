/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Hospital, UpdateBedCapacityRequest, UpdateSpecialistStatusRequest } from "@/lib/types";

export const hospitalApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getHospitals: builder.query<Hospital[], void>({
      query: () => "hospitals",
      providesTags: ["Hospital"],
    }),
    getHospitalById: builder.query<Hospital, string>({
      query: (id) => `hospitals/${id}`,
      providesTags: (result, error, id) => [{ type: "Hospital", id }],
    }),
    getHospitalDashboard: builder.query<any, string>({
      query: (id) => `hospitals/dashboard/${id}`,
      providesTags: (result, error, id) => [{ type: "Hospital", id }, "BedCapacity", "Specialist"],
    }),
    updateBedCapacity: builder.mutation<void, { bedId: string; data: UpdateBedCapacityRequest }>({
      query: ({ bedId, data }) => ({
        url: `hospitals/beds/${bedId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["BedCapacity", "Hospital"],
    }),
    updateSpecialistStatus: builder.mutation<void, { specialistId: string; data: UpdateSpecialistStatusRequest }>({
      query: ({ specialistId, data }) => ({
        url: `hospitals/specialists/${specialistId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Specialist", "Hospital"],
    }),
  }),
});

export const {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useGetHospitalDashboardQuery,
  useUpdateBedCapacityMutation,
  useUpdateSpecialistStatusMutation,
} = hospitalApi;

const hospitalSlice = createSlice({
  name: "hospital",
  initialState: {
    hospitals: [] as Hospital[],
    selectedHospital: null as Hospital | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      hospitalApi.endpoints.getHospitals.matchFulfilled,
      (state, action) => {
        state.hospitals = action.payload;
      }
    );
  },
});

export const hospitalReducer = hospitalSlice.reducer;
export default hospitalSlice;
