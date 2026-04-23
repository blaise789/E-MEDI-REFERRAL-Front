import { apiSliceV1 } from "../../api/apiSliceV1";

export const notificationApi = apiSliceV1.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any[], void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllAsRead: builder.mutation<{ count: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
    useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
