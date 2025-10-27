import { jiraRequest, handleApiResponse } from "@/utils";
import { JIRA_API, COMMAND_NAME } from "@/constants";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  JiraCurrentUser,
  JiraWorklog,
  JiraSearchIssue,
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

export async function getJiraIssue(endpoint: string): Promise<JiraSearchIssue> {
  const data = await jiraRequest<JiraSearchIssue>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-issue",
    defaultValue: {} as JiraSearchIssue,
  });
}

export async function getJiraIssueTransitions(endpoint: string): Promise<JiraTransitionResponse> {
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
/**
 * See: https://developer.atlassian.com/server/jira/platform/rest/v11001/api-group-issue/#api-api-2-issue-issueidorkey-transitions-post
 */
type JiraIssueTransitionParams = {
  transition: {
    id: string;
  };
};

export async function transitionJiraIssue(endpoint: string, params: JiraIssueTransitionParams): Promise<void> {
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

type JiraBoardSprintParams = {
  /**
   * Filters results to sprints in specified states. Valid values: future, active, closed. You can define multiple states separated by commas, e.g. state=active,closed
   */
  state?: string;
};

export async function getJiraBoardSprints(
  endpoint: string,
  params: JiraBoardSprintParams,
): Promise<JiraSprintResponse> {
  const data = await jiraRequest<JiraSprintResponse>({ method: "GET", endpoint, params });

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

export async function getJiraBoardConfiguration(endpoint: string): Promise<JiraBoardConfiguration> {
  const data = await jiraRequest<JiraBoardConfiguration>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-board-configuration",
    defaultValue: {
      id: 0,
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

type JiraBoardSprintIssueParams = {
  expand?: string;
  jql?: string;
  maxResults?: number;
  validateQuery?: boolean;
  fields?: string[];
  startAt?: number;
};

export async function getJiraBoardSprintIssues(
  endpoint: string,
  params: JiraBoardSprintIssueParams,
): Promise<JiraBoardIssueResponse> {
  const data = await jiraRequest<JiraBoardIssueResponse>({
    method: "GET",
    endpoint,
    params,
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
