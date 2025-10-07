import { useInfiniteQuery } from "@tanstack/react-query";
import { searchJiraIssues, type JiraSearchParams } from "../utils/jira";
import { processJiraIssue } from "../utils/process-jira-issue";
import type { JiraPreferences, ProcessedJiraIssueItem, JiraSearchResponse } from "../types";

export function useJiraSearchIssue(
  preferences: JiraPreferences,
  jql: string,
  enabled: boolean = true,
  pageSize: number = 20,
) {
  return useInfiniteQuery<
    JiraSearchResponse,
    Error,
    {
      issues: ProcessedJiraIssueItem[];
      hasMore: boolean;
    }
  >({
    queryKey: ["jira-search", preferences.baseUrl, jql, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      const params: JiraSearchParams = {
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

      const response = await searchJiraIssues(preferences, params);
      return response;
    },
    select: (data) => {
      const allIssues = data.pages.flatMap((page) => page.issues);

      // 处理每个 issue
      const processedIssues: ProcessedJiraIssueItem[] = allIssues.map((issue) => processJiraIssue(issue, preferences));

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
    enabled: enabled && !!preferences.baseUrl && !!preferences.token && !!jql.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
