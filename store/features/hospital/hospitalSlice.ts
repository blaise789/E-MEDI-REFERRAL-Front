/** @format */
import { createSlice } from "@reduxjs/toolkit";
import { apiSliceV1 } from "../../api/apiSliceV1";
import type { Hospital, UpdateBedCapacityRequest, UpdateSpecialistStatusRequest } from "@/lib/types";

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
        "BedCapacity",
        "Specialist",
      ],
    }),
    updateBedCapacity: builder.mutation<void, { bedId: string; data: UpdateBedCapacityRequest }>({
      query: ({ bedId, data }) => ({
        url: `hospitals/beds/${bedId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { bedId }) => ["BedCapacity"],
      async onQueryStarted({ bedId, data }, { dispatch, queryFulfilled }) {
        // Optimistic update for getHospitals
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              const bed = h.beds?.find((b) => b.id === bedId);
              if (bed) {
                bed.occupiedBeds = data.occupiedBeds;
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
    addBedCapacity: builder.mutation<void, { hospitalId: string; data: any }>({
      query: ({ hospitalId, data }) => ({
        url: `hospitals/${hospitalId}/beds`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { hospitalId }) => [
        { type: "Hospital", id: hospitalId },
        "BedCapacity",
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
    recalibrateBedCapacity: builder.mutation<void, { bedId: string; data: { occupiedBeds: number } }>({
      query: ({ bedId, data }) => ({
        url: `hospitals/beds/${bedId}/recalibrate`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["BedCapacity"],
      async onQueryStarted({ bedId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          hospitalApi.util.updateQueryData("getHospitals", undefined, (draft) => {
            draft.forEach((h) => {
              const bed = h.beds?.find((b) => b.id === bedId);
              if (bed) {
                bed.occupiedBeds = data.occupiedBeds;
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
  useUpdateBedCapacityMutation,
  useUpdateSpecialistStatusMutation,
  useAddBedCapacityMutation,
  useAddSpecialistMutation,
  useRecalibrateBedCapacityMutation,
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
