import { jiraRequest, handleApiResponse } from "@/utils";
import { JIRA_API, COMMAND_NAME } from "@/constants";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  JiraCurrentUser,
  JiraWorklog,
  JiraIssue,
  JiraTransitionResponse,
  JiraBoardResponse,
  JiraSprintResponse,
  JiraBoardConfiguration,
  JiraBoardIssueResponse,
} from "@/types";

type JiraSearchIssueParams = {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
  validateQuery?: boolean;
};

export async function searchJiraIssue(params: JiraSearchIssueParams): Promise<JiraSearchIssueResponse> {
  const data = await jiraRequest<JiraSearchIssueResponse>({ method: "GET", endpoint: JIRA_API.SEARCH, params });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_SEARCH_ISSUE,
    defaultValue: {
      expand: "schema,names",
      startAt: 0,
      maxResults: 20,
      total: 0,
      issues: [] as JiraSearchIssueResponse["issues"],
      names: {},
    },
  });
}

export async function getJiraField(): Promise<JiraField[]> {
  const data = await jiraRequest<JiraField[]>({ method: "GET", endpoint: JIRA_API.FIELD });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_MANAGE_FIELD,
    defaultValue: [],
  });
}

export async function getJiraProject(): Promise<JiraProject[]> {
  const data = await jiraRequest<JiraProject[]>({ method: "GET", endpoint: JIRA_API.PROJECT });

  return handleApiResponse({
    data,
    fileName: "jira-project",
    defaultValue: [],
  });
}

export async function getJiraCurrentUser(): Promise<JiraCurrentUser | null> {
  const data = await jiraRequest<JiraCurrentUser>({ method: "GET", endpoint: JIRA_API.CURRENT_USER });

  return handleApiResponse({
    data,
    fileName: "jira-current-user",
    defaultValue: null,
  });
}

type JiraWorklogParams = {
  from: string;
  to: string;
  worker: string[];
};

export async function getJiraWorklog(params: JiraWorklogParams): Promise<JiraWorklog[]> {
  const data = await jiraRequest<JiraWorklog[]>({ method: "POST", endpoint: JIRA_API.WORKLOG, params });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_WORKLOG,
    defaultValue: [],
  });
}

export async function getJiraIssue(issueKey: string): Promise<JiraIssue> {
  const endpoint = JIRA_API.ISSUE.replace("{issueIdOrKey}", issueKey);
  const data = await jiraRequest<JiraIssue>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-issue",
    defaultValue: {} as JiraIssue,
  });
}

export async function getJiraIssueTransitions(issueKey: string): Promise<JiraTransitionResponse> {
  const endpoint = JIRA_API.ISSUE_TRANSITIONS.replace("{issueIdOrKey}", issueKey);
  const data = await jiraRequest<JiraTransitionResponse>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-issue-transitions",
    defaultValue: {
      expand: "transitions",
      transitions: [],
    },
  });
}

export async function transitionJiraIssue(issueKey: string, transitionId: string): Promise<void> {
  const params: Record<string, unknown> = {
    transition: {
      id: transitionId,
    },
  };

  const endpoint = JIRA_API.ISSUE_TRANSITIONS.replace("{issueIdOrKey}", issueKey);

  await jiraRequest<void>({
    method: "POST",
    endpoint,
    params,
  });
}

export async function getJiraBoards(): Promise<JiraBoardResponse> {
  const data = await jiraRequest<JiraBoardResponse>({ method: "GET", endpoint: JIRA_API.BOARD });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_BOARD,
    defaultValue: {
      maxResults: 50,
      startAt: 0,
      total: 0,
      isLast: true,
      values: [],
    },
  });
}

export async function getJiraBoardSprints(boardId: number): Promise<JiraSprintResponse> {
  const endpoint = JIRA_API.BOARD_SPRINT.replace("{boardId}", boardId.toString());
  const data = await jiraRequest<JiraSprintResponse>({ method: "GET", endpoint, params: { state: "active" } });

  return handleApiResponse({
    data,
    fileName: "jira-board-sprints",
    defaultValue: {
      maxResults: 50,
      startAt: 0,
      isLast: true,
      values: [],
    },
  });
}

export async function getJiraBoardConfiguration(boardId: number): Promise<JiraBoardConfiguration> {
  const endpoint = JIRA_API.BOARD_CONFIGURATION.replace("{boardId}", boardId.toString());
  const data = await jiraRequest<JiraBoardConfiguration>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-board-configuration",
    defaultValue: {
      id: boardId,
      name: "",
      type: "scrum",
      self: "",
      filter: { id: "", self: "" },
      columnConfig: { columns: [], constraintType: "none" },
      estimation: { type: "", field: { fieldId: "", displayName: "" } },
      ranking: { rankCustomFieldId: 0 },
    },
  });
}

export async function getJiraBoardSprintIssues(boardId: number, sprintId: number): Promise<JiraBoardIssueResponse> {
  const endpoint = JIRA_API.BOARD_SPRINT_ISSUE.replace("{boardId}", boardId.toString()).replace(
    "{sprintId}",
    sprintId.toString(),
  );
  const data = await jiraRequest<JiraBoardIssueResponse>({
    method: "GET",
    endpoint,
    params: { jql: "order by priority DESC, updated DESC, created DESC" },
  });

  return handleApiResponse({
    data,
    fileName: "jira-board-sprint-issues",
    defaultValue: {
      expand: "schema,names",
      startAt: 0,
      maxResults: 50,
      total: 0,
      issues: [],
    },
  });
}
