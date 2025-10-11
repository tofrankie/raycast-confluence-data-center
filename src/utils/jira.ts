import { jiraRequest, writeResponseFile } from "@/utils";
import { JIRA_API, COMMAND_NAME, SEARCH_PAGE_SIZE, JIRA_BASE_URL } from "@/constants";
import type { JiraSearchIssueResponse, JiraField } from "@/types";

type JiraSearchIssueParams = {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
};

export async function searchJiraIssue(params: JiraSearchIssueParams): Promise<JiraSearchIssueResponse> {
  const searchParams = {
    jql: params.jql,
    startAt: params.startAt || 0,
    maxResults: params.maxResults || SEARCH_PAGE_SIZE,
    fields: params.fields?.join(","),
    expand: params.expand?.join(","),
  };

  const data = await jiraRequest<JiraSearchIssueResponse>("GET", JIRA_API.SEARCH, searchParams);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), COMMAND_NAME.JIRA_SEARCH_ISSUE);
  }

  return data;
}

export async function getJiraField(): Promise<JiraField[]> {
  const data = await jiraRequest<JiraField[]>("GET", JIRA_API.FIELD);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), COMMAND_NAME.JIRA_MANAGE_FIELD);
  }

  return data || [];
}

export function getJiraIssueUrl(issueKey: string): string {
  return `${JIRA_BASE_URL}/browse/${issueKey}`;
}
