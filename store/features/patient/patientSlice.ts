/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Patient, CreatePatientRequest } from "@/lib/types";

export const patientApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<Patient[], void>({
      query: () => "patients",
      providesTags: ["Patient"],
    }),
    getPatientById: builder.query<Patient, string>({
      query: (id) => `patients/${id}`,
      providesTags: (result, error, id) => [{ type: "Patient", id }],
    }),
    registerPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (data) => ({
        url: "patients",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Patient"],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useRegisterPatientMutation,
} = patientApi;

const patientSlice = createSlice({
  name: "patient",
  initialState: {
    patients: [] as Patient[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      patientApi.endpoints.getPatients.matchFulfilled,
      (state, action) => {
        state.patients = action.payload;
      }
    );
  },
});

export const patientReducer = patientSlice.reducer;
export default patientSlice;
