import { useInfiniteQuery, useQuery, UseQueryOptions, UseInfiniteQueryOptions } from "@tanstack/react-query";

import {
  searchJiraIssue,
  processJiraSearchIssue,
  getSelectedCustomFieldIds,
  processJiraFieldItem,
  getJiraField,
  getJiraProject,
} from "@/utils";
import { COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  ProcessedJiraIssueItem,
  ProcessedJiraFieldItem,
} from "@/types";

export function useJiraSearchIssueInfiniteQuery<
  TData = { issues: ProcessedJiraIssueItem[]; hasMore: boolean; totalCount: number },
>(jql: string, queryOptions?: Partial<UseInfiniteQueryOptions<JiraSearchIssueResponse, Error, TData>>) {
  return useInfiniteQuery<JiraSearchIssueResponse, Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_SEARCH_ISSUE, { jql, pageSize: SEARCH_PAGE_SIZE }],
    queryFn: async ({ pageParam = 0 }) => {
      const customFieldIds = getSelectedCustomFieldIds();

      const params = {
        jql,
        startAt: pageParam as number,
        maxResults: SEARCH_PAGE_SIZE,
        validateQuery: false,
        fields: [
          "summary",
          "status",
          "priority",
          "issuetype",
          "assignee",
          "reporter",
          "created",
          "updated",
          "duedate",
          "timetracking",
          ...customFieldIds,
        ],
        expand: ["names"],
      };

      const response = await searchJiraIssue(params);
      return response;
    },
    select: (data) => {
      const allIssue = data.pages.flatMap((page) => page.issues);
      const names = data.pages[0]?.names;
      const totalCount = data.pages[0]?.total;
      const processedIssues: ProcessedJiraIssueItem[] = allIssue.map((issue) => processJiraSearchIssue(issue, names));

      const hasMore =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].startAt + data.pages[data.pages.length - 1].issues.length <
            data.pages[data.pages.length - 1].total
          : false;

      return {
        issues: processedIssues,
        totalCount,
        hasMore,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.startAt + lastPage.issues.length < lastPage.total) {
        return lastPage.startAt + lastPage.issues.length;
      }
      return undefined;
    },
    enabled: jql.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

export function useJiraFieldQuery<TData = ProcessedJiraFieldItem[]>(
  queryOptions?: Partial<UseQueryOptions<JiraField[], Error, TData>>,
) {
  return useQuery<JiraField[], Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_MANAGE_FIELD],
    queryFn: getJiraField,
    select: (data) => {
      return data.map((field) => processJiraFieldItem(field, false)) as TData;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export function useJiraProjectQuery<TData = JiraProject[]>(
  queryOptions?: Partial<UseQueryOptions<JiraProject[], Error, TData>>,
) {
  return useQuery<JiraProject[], Error, TData>({
    queryKey: ["jira-project"],
    queryFn: getJiraProject,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}
