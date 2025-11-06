import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

import { COMMAND_NAME, PAGINATION_SIZE } from "@/constants";
import {
  getJiraNotifications,
  processJiraNotificationView,
  markJiraNotificationAsRead,
  markJiraAllNotificationsAsRead,
  setJiraNotificationState,
} from "@/utils";
import type { JiraNotificationsResponse, ProcessedJiraNotification } from "@/types";

export function useJiraNotificationsInfiniteQuery<
  TData = { notifications: ProcessedJiraNotification[]; hasMore: boolean; totalCount: number },
>(queryOptions?: Partial<UseInfiniteQueryOptions<JiraNotificationsResponse, Error, TData>>) {
  return useInfiniteQuery<JiraNotificationsResponse, Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_NOTIFICATION_VIEW, { pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam = 0 }) => {
      const params = {
        limit: PAGINATION_SIZE,
        offSet: pageParam as number,
      };

      const response = await getJiraNotifications(params);
      return response;
    },
    select: (data) => {
      const allNotifications = data.pages.flatMap((page) => page.notificationsList);
      const processedNotifications: ProcessedJiraNotification[] = processJiraNotificationView(allNotifications);

      // Get total count from the first page (or last page if available)
      const totalCount = data.pages[0]?.count || 0;
      const fetchedCount = allNotifications.length;
      const hasMore = fetchedCount < totalCount;

      return {
        notifications: processedNotifications,
        hasMore,
        totalCount,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, page) => sum + page.notificationsList.length, 0);
      const totalCount = lastPage.count || 0;

      if (fetchedCount < totalCount) {
        return fetchedCount;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}

export function useMarkJiraNotificationAsReadMutation(
  mutationOptions?: Partial<UseMutationOptions<void, Error, number>>,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (notificationId) => markJiraNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMAND_NAME.JIRA_NOTIFICATION_VIEW] });
    },
    ...mutationOptions,
  });
}

export function useSetJiraNotificationStateMutation(
  mutationOptions?: Partial<UseMutationOptions<void, Error, number>>,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (notificationId) => setJiraNotificationState(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMAND_NAME.JIRA_NOTIFICATION_VIEW] });
    },
    ...mutationOptions,
  });
}

export function useMarkJiraAllNotificationsAsReadMutation(
  mutationOptions?: Partial<UseMutationOptions<void, Error, void>>,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => markJiraAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMAND_NAME.JIRA_NOTIFICATION_VIEW] });
    },
    ...mutationOptions,
  });
}

export function useJiraUnreadNotificationsQuery(
  queryOptions?: Partial<UseQueryOptions<JiraNotificationsResponse, Error, number>>,
) {
  return useQuery<JiraNotificationsResponse, Error, number>({
    queryKey: ["jira-unread-notification"],
    queryFn: () => getJiraNotifications({ offSet: 0, limit: 1 }),
    select: (data) => data.unreadNotificationsCount,
    staleTime: 15 * 1000,
    gcTime: 30 * 1000,
    ...queryOptions,
  });
}
