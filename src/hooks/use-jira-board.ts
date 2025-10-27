import { useQuery } from "@tanstack/react-query";
import {
  getJiraBoards,
  getJiraBoardSprints,
  getJiraBoardConfiguration,
  getJiraBoardSprintIssues,
} from "@/utils/request-jira";
import { processActiveSprint, processBoards } from "@/utils/process-jira-board";

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
    queryFn: () => getJiraBoardConfiguration(boardId),
    enabled: boardId > -1,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useJiraBoardActiveSprint(boardId: number) {
  return useQuery({
    queryKey: ["jira-board-sprints", boardId],
    queryFn: () => getJiraBoardSprints(boardId),
    select: processActiveSprint,
    enabled: boardId > -1,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}

export function useJiraBoardSprintIssues(boardId: number, sprintId: number) {
  return useQuery({
    queryKey: ["jira-board-sprint-issues", boardId, sprintId],
    queryFn: () => getJiraBoardSprintIssues(boardId, sprintId),
    enabled: boardId > -1 && sprintId > -1,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}
