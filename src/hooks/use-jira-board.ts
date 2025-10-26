import { useQuery } from "@tanstack/react-query";
import {
  getJiraBoards,
  getJiraBoardSprints,
  getJiraBoardConfiguration,
  getJiraBoardSprintIssues,
} from "@/utils/request-jira";

export function useJiraBoards() {
  return useQuery({
    queryKey: ["jira-boards"],
    queryFn: getJiraBoards,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJiraBoardSprints(boardId: number) {
  return useQuery({
    queryKey: ["jira-board-sprints", boardId],
    queryFn: () => getJiraBoardSprints(boardId),
    enabled: boardId > -1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useJiraBoardConfiguration(boardId: number) {
  return useQuery({
    queryKey: ["jira-board-configuration", boardId],
    queryFn: () => getJiraBoardConfiguration(boardId),
    enabled: boardId > -1,
    staleTime: 10 * 60 * 1000,
  });
}

export function useJiraBoardSprintIssues(boardId: number, sprintId: number) {
  return useQuery({
    queryKey: ["jira-board-sprint-issues", boardId, sprintId],
    queryFn: () => getJiraBoardSprintIssues(boardId, sprintId),
    enabled: boardId > -1 && sprintId > -1,
    staleTime: 1 * 60 * 1000,
  });
}

export function useJiraBoardActiveSprint(boardId: number) {
  const { data: sprints, ...rest } = useJiraBoardSprints(boardId);

  const activeSprint = sprints?.values.find((sprint) => sprint.state === "active") || null;

  return {
    activeSprint,
    ...rest,
  };
}
