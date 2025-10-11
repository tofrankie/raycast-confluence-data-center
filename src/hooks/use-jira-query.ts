import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  searchJiraIssue,
  processJiraSearchIssue,
  getSelectedCustomFieldIds,
  processJiraFieldItem,
  getJiraField,
} from "@/utils";
import { COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";
import type { JiraSearchIssueResponse, JiraField, ProcessedJiraIssueItem, ProcessedJiraFieldItem } from "@/types";

export function useJiraSearchIssueInfiniteQuery(jql: string, baseUrl: string) {
  return useInfiniteQuery<
    JiraSearchIssueResponse,
    Error,
    {
      issues: ProcessedJiraIssueItem[];
      hasMore: boolean;
    }
  >({
    queryKey: [COMMAND_NAME.JIRA_SEARCH_ISSUE, { jql, pageSize: SEARCH_PAGE_SIZE }],
    queryFn: async ({ pageParam = 0 }) => {
      const customFieldIds = getSelectedCustomFieldIds();

      const params = {
        jql,
        startAt: pageParam as number,
        maxResults: SEARCH_PAGE_SIZE,
        fields: [
          "summary",
          "status",
          "priority",
          "issuetype",
          "project",
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
      const names = data.pages[0]?.names; // 获取 names 对象
      const processedIssues: ProcessedJiraIssueItem[] = allIssue.map((issue) =>
        processJiraSearchIssue(issue, baseUrl, names),
      );

      const hasMore =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].startAt + data.pages[data.pages.length - 1].issues.length <
            data.pages[data.pages.length - 1].total
          : false;

      return {
        issues: processedIssues,
        hasMore,
      };
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
  });
}

export function useJiraFieldQuery() {
  return useQuery<JiraField[], Error, ProcessedJiraFieldItem[]>({
    queryKey: [COMMAND_NAME.JIRA_MANAGE_FIELD],
    queryFn: async () => {
      const fields = await getJiraField();
      return fields;
    },
    select: (data) => {
      return data.map((field) => processJiraFieldItem(field, false));
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
