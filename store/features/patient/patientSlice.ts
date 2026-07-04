/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Patient, CreatePatientRequest } from "@/lib/types";

export const patientApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<Patient[], { search?: string; hospitalId?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && 'search' in params && params.search) searchParams.set('search', params.search);
        if (params && 'hospitalId' in params && params.hospitalId) searchParams.set('hospitalId', params.hospitalId);
        const qs = searchParams.toString();
        return qs ? `patients?${qs}` : 'patients';
      },
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query<Patient, string>({
      query: (id) => `patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    registerPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (data) => ({
        url: 'patients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patient'],
    }),
    updatePatient: builder.mutation<Patient, { id: string; data: Partial<CreatePatientRequest> }>({
      query: ({ id, data }) => ({
        url: `patients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }, 'Patient'],
    }),
    deactivatePatient: builder.mutation<Patient, string>({
      query: (id) => ({
        url: `patients/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Patient'],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useRegisterPatientMutation,
  useUpdatePatientMutation,
  useDeactivatePatientMutation,
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
