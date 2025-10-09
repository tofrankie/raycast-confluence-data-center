import { useInfiniteQuery } from "@tanstack/react-query";
import { searchJiraIssue, type JiraSearchIssueParams } from "../utils/jira";
import { processJiraSearchIssue } from "../utils/process-jira-search-issue";
import type { ProcessedJiraIssueItem, JiraSearchIssueResponse } from "../types";
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
        ],
      };

      const response = await searchJiraIssue(params);
      return response;
    },
    select: (data) => {
      const allIssues = data.pages.flatMap((page) => page.issues);

      // 处理每个 issue
      const processedIssues: ProcessedJiraIssueItem[] = allIssues.map((issue) =>
        processJiraSearchIssue(issue, baseUrl),
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
