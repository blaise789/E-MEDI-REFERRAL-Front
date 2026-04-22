/** @format */
import { createSlice } from "@reduxjs/toolkit";
import type { User, UpdateUserDto, CreateUserDto } from "@/lib/types";
import { apiSliceV1 } from "../../api/apiSliceV1";

export const userApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "users",
      providesTags: ["User"],
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (body) => ({
        url: "users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [] as User[],
  },
  reducers: {},
});

export const userReducer = userSlice.reducer;
export default userSlice;
