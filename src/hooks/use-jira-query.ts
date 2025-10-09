import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { searchJiraIssue, type JiraSearchIssueParams } from "../utils/jira";
import { processJiraSearchIssue } from "../utils/process-jira-search-issue";
import { getSelectedCustomFieldIds, processJiraFieldItem } from "../utils/process-jira-manage-field";
import { getJiraField } from "../utils/jira";
import type { ProcessedJiraIssueItem, JiraSearchIssueResponse, JiraField, ProcessedJiraField } from "../types";
import { COMMAND_NAMES, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";

export function useJiraSearchIssueInfiniteQuery(
  jql: string,
  baseUrl: string,
  pageSize: number = DEFAULT_SEARCH_PAGE_SIZE,
) {
  return useInfiniteQuery<
    JiraSearchIssueResponse,
    Error,
    {
      issues: ProcessedJiraIssueItem[];
      hasMore: boolean;
    }
  >({
    queryKey: [COMMAND_NAMES.JIRA_SEARCH_ISSUE, { jql, pageSize }],
    queryFn: async ({ pageParam = 0 }) => {
      const customFieldIds = getSelectedCustomFieldIds();

      const params: JiraSearchIssueParams = {
        jql,
        startAt: pageParam as number,
        maxResults: pageSize,
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
      };

      const response = await searchJiraIssue(params);
      return response;
    },
    select: (data) => {
      const allIssue = data.pages.flatMap((page) => page.issues);
      const processedIssues: ProcessedJiraIssueItem[] = allIssue.map((issue) => processJiraSearchIssue(issue, baseUrl));

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
  return useQuery<JiraField[], Error, ProcessedJiraField[]>({
    queryKey: [COMMAND_NAMES.JIRA_MANAGE_FIELD],
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
