import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseInfiniteQueryOptions } from "@tanstack/react-query";

import { JIRA_BOARD_ISSUE_FIELDS, JIRA_API, PAGINATION_SIZE, JIRA_SEARCH_ISSUE_FIELDS } from "@/constants";
import {
  getJiraBoards,
  getJiraBoardSprints,
  getJiraBoardConfiguration,
  getJiraBoardSprintIssues,
  getJiraBoardIssues,
  processActiveSprint,
  processBoards,
  transformURL,
  getSelectedFieldIds,
  getSelectedFields,
  processJiraBoardIssue,
} from "@/utils";
import type {
  JiraBoardResponse,
  JiraBoard,
  JiraBoardConfiguration,
  JiraSprintResponse,
  JiraSprint,
  JiraKanbanBoardIssueResponse,
  ProcessedJiraKanbanBoardIssue,
} from "@/types";

export function useJiraBoards<TData = JiraBoard[]>(
  queryOptions?: Partial<UseQueryOptions<JiraBoardResponse, Error, TData>>,
) {
  return useQuery<JiraBoardResponse, Error, TData>({
    queryKey: ["jira-boards"],
    queryFn: getJiraBoards,
    select: (data) => processBoards(data) as TData,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export function useJiraBoardConfiguration<TData = JiraBoardConfiguration>(
  boardId: number,
  queryOptions?: Partial<UseQueryOptions<JiraBoardConfiguration, Error, TData>>,
) {
  return useQuery<JiraBoardConfiguration, Error, TData>({
    queryKey: ["jira-board-configuration", boardId],
    queryFn: () => {
      const url = transformURL(JIRA_API.BOARD_CONFIGURATION, { boardId });
      return getJiraBoardConfiguration(url);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export function useJiraBoardActiveSprint<TData = JiraSprint | null>(
  boardId: number,
  queryOptions?: Partial<UseQueryOptions<JiraSprintResponse, Error, TData>>,
) {
  return useQuery<JiraSprintResponse, Error, TData>({
    queryKey: ["jira-board-sprints", boardId],
    queryFn: () => {
      const url = transformURL(JIRA_API.BOARD_SPRINT, { boardId });
      const params = { state: "active" };
      return getJiraBoardSprints(url, params);
    },
    select: (data) => processActiveSprint(data) as TData,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}

export function useJiraBoardSprintIssues<TData = JiraKanbanBoardIssueResponse>(
  boardId: number,
  sprintId: number,
  queryOptions?: Partial<UseQueryOptions<JiraKanbanBoardIssueResponse, Error, TData>>,
) {
  return useQuery<JiraKanbanBoardIssueResponse, Error, TData>({
    queryKey: ["jira-board-sprint-issues", boardId, sprintId],
    queryFn: () => {
      const selectedFieldIds = getSelectedFieldIds();
      const url = transformURL(JIRA_API.BOARD_SPRINT_ISSUE, { boardId, sprintId });
      const params = {
        jql: "order by priority DESC, updated DESC, created DESC",
        fields: [...JIRA_BOARD_ISSUE_FIELDS, ...selectedFieldIds],
        maxResults: 200,
      };
      return getJiraBoardSprintIssues(url, params);
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}

export function useJiraKanbanBoardIssuesInfiniteQuery<
  TData = { issues: ProcessedJiraKanbanBoardIssue[]; hasMore: boolean; totalCount: number },
>(boardId: number, queryOptions?: Partial<UseInfiniteQueryOptions<JiraKanbanBoardIssueResponse, Error, TData>>) {
  return useInfiniteQuery<JiraKanbanBoardIssueResponse, Error, TData>({
    queryKey: ["jira-board-issues", { boardId, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam = 0 }) => {
      const selectedFieldIds = getSelectedFieldIds();
      const url = transformURL(JIRA_API.BOARD_ISSUE, { boardId });
      const params = {
        expand: ["names"],
        startAt: pageParam as number,
        jql: "order by updated DESC, priority DESC, created DESC",
        maxResults: PAGINATION_SIZE,
        fields: [...JIRA_SEARCH_ISSUE_FIELDS, ...selectedFieldIds],
      };
      return getJiraBoardIssues(url, params);
    },
    select: (data) => {
      const allIssues = data.pages.flatMap((page) => page.issues);
      const fieldsNameMap = data.pages[0]?.names;
      const totalCount = data.pages[0]?.total;
      const selectedFields = getSelectedFields();
      const processedIssues: ProcessedJiraKanbanBoardIssue[] = allIssues.map((issue) =>
        processJiraBoardIssue(issue, selectedFields, fieldsNameMap),
      );

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
    enabled: boardId > -1,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}
