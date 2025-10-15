import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();

// Common
const DEFAULT_SEARCH_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE = formatSearchPageSize(preferences.searchPageSize) || DEFAULT_SEARCH_PAGE_SIZE;
export const DEBUG_ENABLE = preferences.debugEnable;
export const REPLACE_CURRENT_USER_IN_QUERY = preferences.replaceCurrentUserInQuery;

// Confluence
export const CONFLUENCE_BASE_URL = preferences.confluenceBaseUrl;
export const CONFLUENCE_PERSONAL_ACCESS_TOKEN = preferences.confluencePersonalAccessToken;

// Jira
export const JIRA_BASE_URL = preferences.jiraBaseUrl;
export const JIRA_PERSONAL_ACCESS_TOKEN = preferences.jiraPersonalAccessToken;

function formatSearchPageSize(searchPageSize: string) {
  const pageSize = parseInt(searchPageSize);
  return pageSize > 0 ? pageSize : 0;
}
