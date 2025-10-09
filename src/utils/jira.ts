import { jiraRequest } from "./request";
import { writeToSupportPathFile } from "./confluence";
import { JIRA_API, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { JiraSearchIssueResponse, JiraField } from "../types";

export interface JiraSearchIssueParams {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
}

export async function searchJiraIssue(params: JiraSearchIssueParams): Promise<JiraSearchIssueResponse> {
  const searchParams = {
    jql: params.jql,
    startAt: params.startAt || 0,
    maxResults: params.maxResults || DEFAULT_SEARCH_PAGE_SIZE,
    fields: params.fields?.join(","),
    expand: params.expand?.join(","),
  };

  const data = await jiraRequest<JiraSearchIssueResponse>("GET", JIRA_API.SEARCH, searchParams);

  if (data) {
    // TODO: 调试
    writeToSupportPathFile(JSON.stringify(data, null, 2), "jira-search-issue-response.json");
  }

  return data;
}

export async function getJiraField(): Promise<JiraField[]> {
  const data = await jiraRequest<JiraField[]>("GET", JIRA_API.FIELD);

  if (data) {
    writeToSupportPathFile(JSON.stringify(data, null, 2), "jira-manage-field-response.json");
  }

  return data || [];
}

// TODO:
export function getJiraIssueUrl(baseUrl: string, issueKey: string): string {
  return `${baseUrl}/browse/${issueKey}`;
}

export function getJiraProjectUrl(baseUrl: string, projectKey: string): string {
  return `${baseUrl}/browse/${projectKey}`;
}
