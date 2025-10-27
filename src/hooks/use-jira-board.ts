import { useQuery } from "@tanstack/react-query";

import { JIRA_BOARD_ISSUE_FIELDS, JIRA_API } from "@/constants";
import {
  getJiraBoards,
  getJiraBoardSprints,
  getJiraBoardConfiguration,
  getJiraBoardSprintIssues,
  processActiveSprint,
  processBoards,
  transformURL,
} from "@/utils";

export function useJiraBoards() {
  return useQuery({
    queryKey: ["jira-boards"],
    queryFn: getJiraBoards,
    select: processBoards,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useJiraBoardConfiguration(boardId: number) {
  return useQuery({
    queryKey: ["jira-board-configuration", boardId],
    queryFn: () => {
      const endpoint = transformURL(JIRA_API.BOARD_CONFIGURATION, { boardId });
      return getJiraBoardConfiguration(endpoint);
    },
    enabled: boardId > -1,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useJiraBoardActiveSprint(boardId: number) {
  return useQuery({
    queryKey: ["jira-board-sprints", boardId],
    queryFn: () => {
      const endpoint = transformURL(JIRA_API.BOARD_SPRINT, { boardId });
      const params = { state: "active" };
      return getJiraBoardSprints(endpoint, params);
    },
    select: processActiveSprint,
    enabled: boardId > -1,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}

export function useJiraBoardSprintIssues(boardId: number, sprintId: number) {
  return useQuery({
    queryKey: ["jira-board-sprint-issues", boardId, sprintId],
    queryFn: () => {
      const endpoint = transformURL(JIRA_API.BOARD_SPRINT_ISSUE, { boardId, sprintId });
      const params = {
        jql: "order by priority DESC, updated DESC, created DESC",
        fields: [...JIRA_BOARD_ISSUE_FIELDS],
      };
      return getJiraBoardSprintIssues(endpoint, params);
    },
    enabled: boardId > -1 && sprintId > -1,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}
