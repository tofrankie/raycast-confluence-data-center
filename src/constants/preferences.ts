import { environment, getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();
const commandName = environment.commandName;

export const CONFLUENCE_BASE_URL = preferences.confluenceBaseUrl;
export const CONFLUENCE_PAT = preferences.confluencePAT;

export const JIRA_BASE_URL = preferences.jiraBaseUrl;
export const JIRA_PAT = preferences.jiraPAT;

const DEFAULT_PAGINATION_SIZE = 20;
export const PAGINATION_SIZE = formatPaginationSize(preferences.paginationSize) || DEFAULT_PAGINATION_SIZE;
export const DEBUG_ENABLE = preferences.debugEnable;
export const REPLACE_CURRENT_USER = preferences.replaceCurrentUser;

export const CURRENT_PAT = commandName?.startsWith("jira-") ? JIRA_PAT : CONFLUENCE_PAT;
export const CURRENT_BASE_URL = commandName?.startsWith("jira-") ? JIRA_BASE_URL : CONFLUENCE_BASE_URL;

function formatPaginationSize(paginationSize: string) {
  const size = parseInt(paginationSize);
  return size > 0 ? size : 0;
}
