import { jiraRequest } from "./request";
import { writeToSupportPathFile } from "./confluence";
import { JIRA_API, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { JiraSearchResponse, JiraPreferences } from "../types";

export interface JiraSearchParams {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
}

export async function searchJiraIssues(
  preferences: JiraPreferences,
  params: JiraSearchParams,
): Promise<JiraSearchResponse> {
  const searchParams = {
    jql: params.jql,
    startAt: params.startAt || 0,
    maxResults: params.maxResults || DEFAULT_SEARCH_PAGE_SIZE,
    fields: params.fields?.join(","),
    expand: params.expand?.join(","),
  };

  const data = await jiraRequest<JiraSearchResponse>("GET", JIRA_API.SEARCH, searchParams, preferences);

  // TODO: 调试
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-jira-issues-response.json");

  return data;
}

export function getJiraIssueUrl(baseUrl: string, issueKey: string): string {
  return `${baseUrl}/browse/${issueKey}`;
}

export function getJiraProjectUrl(baseUrl: string, projectKey: string): string {
  return `${baseUrl}/browse/${projectKey}`;
}
