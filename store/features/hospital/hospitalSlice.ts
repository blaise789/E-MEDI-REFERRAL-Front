/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Hospital, UpdateSpecialistStatusRequest } from "@/lib/types";

export const hospitalApi = apiSliceV1.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getHospitals: builder.query<Hospital[], void>({
      query: () => "hospitals",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Hospital" as const, id })),
              { type: "Hospital", id: "LIST" },
            ]
          : [{ type: "Hospital", id: "LIST" }],
    }),
    getHospitalById: builder.query<Hospital, string>({
      query: (id) => `hospitals/${id}`,
      providesTags: (result, error, id) => [{ type: "Hospital", id }],
    }),
    getHospitalDashboard: builder.query<any, string>({
      query: (id) => `hospitals/dashboard/${id}`,
      providesTags: (result, error, id) => [
        { type: "Hospital", id },
        "Ward",
        "Specialist",
      ],
    }),
    updateWardOccupancy: builder.mutation<void, { wardId: string; data: any }>({
      query: ({ wardId, data }) => ({
        url: `hospitals/wards/${wardId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { wardId }) => ["Ward"],
      async onQueryStarted({ wardId, data }, { dispatch, queryFulfilled }) {
        // Optimistic update for getHospitals
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              const ward = h.wards?.find((w) => w.id === wardId);
              if (ward) {
                ward.occupiedBeds = data.occupiedBeds;
              }
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateSpecialistStatus: builder.mutation<void, { specialistId: string; data: UpdateSpecialistStatusRequest }>({
      query: ({ specialistId, data }) => ({
        url: `hospitals/specialists/${specialistId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Specialist"],
      async onQueryStarted({ specialistId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              const spec = h.specialists?.find((s) => s.id === specialistId);
              if (spec) {
                spec.status = data.status;
              }
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    addWard: builder.mutation<void, { hospitalId: string; data: any }>({
      query: ({ hospitalId, data }) => ({
        url: `hospitals/${hospitalId}/wards`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { hospitalId }) => [
        { type: "Hospital", id: hospitalId },
        "Ward",
      ],
    }),
    addSpecialist: builder.mutation<void, { hospitalId: string; data: any }>({
      query: ({ hospitalId, data }) => ({
        url: `hospitals/${hospitalId}/specialists`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { hospitalId }) => [
        { type: "Hospital", id: hospitalId },
        "Specialist",
      ],
    }),
    updateSpecialist: builder.mutation<void, { specialistId: string; data: any }>({
      query: ({ specialistId, data }) => ({
        url: `hospitals/specialists/${specialistId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Specialist", { type: "Hospital", id: "LIST" }],
      async onQueryStarted({ specialistId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              h.specialists?.forEach((s) => {
                if (s.id === specialistId) {
                  Object.assign(s, data);
                }
              });
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    recalibrateWard: builder.mutation<void, { wardId: string; data: { occupiedBeds: number } }>({
      query: ({ wardId, data }) => ({
        url: `hospitals/wards/${wardId}/recalibrate`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Ward"],
      async onQueryStarted({ wardId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              const ward = h.wards?.find((w) => w.id === wardId);
              if (ward) {
                ward.occupiedBeds = data.occupiedBeds;
              }
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    addHospital: builder.mutation<Hospital, any>({
      query: (data) => ({
        url: `hospitals`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Hospital", id: "LIST" }],
    }),
    deleteWard: builder.mutation<void, string>({
      query: (wardId) => ({
        url: `hospitals/wards/${wardId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ward", { type: "Hospital", id: "LIST" }],
      async onQueryStarted(wardId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              if (h.wards) {
                h.wards = h.wards.filter((w) => w.id !== wardId);
              }
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useGetHospitalDashboardQuery,
  useUpdateWardOccupancyMutation,
  useUpdateSpecialistStatusMutation,
  useAddWardMutation,
  useAddSpecialistMutation,
  useUpdateSpecialistMutation,
  useRecalibrateWardMutation,
  useAddHospitalMutation,
  useDeleteWardMutation,
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
