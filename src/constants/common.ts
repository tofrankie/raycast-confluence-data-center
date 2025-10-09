export const APP_TYPE = {
  CONFLUENCE: "confluence",
  JIRA: "jira",
} as const;

export const COMMAND_NAMES = {
  CONFLUENCE_SEARCH_CONTENT: "confluence-search-content",
  CONFLUENCE_SEARCH_USER: "confluence-search-user",
  CONFLUENCE_SEARCH_SPACE: "confluence-search-space",
  JIRA_SEARCH_ISSUE: "jira-search-issue",
  JIRA_MANAGE_FIELD: "jira-manage-field",
} as const;

export const CONFLUENCE_API = {
  SEARCH: "/rest/api/search",
  SEARCH_CONTENT: "/rest/api/content/search",
  CONTENT_FAVOURITE: "/rest/experimental/relation/user/current/favourite/toContent/",
} as const;

export const JIRA_API = {
  SEARCH: "/rest/api/2/search",
  FIELD: "/rest/api/2/field",
} as const;

export const DEFAULT_AVATAR = "avatar-default.svg";

export const CONFLUENCE_AVATAR_DIR = "/tmp/raycast-confluence-data-center/confluence/avatars";

export const JIRA_AVATAR_DIR = "/tmp/raycast-confluence-data-center/jira/avatars";

export const DEFAULT_SEARCH_PAGE_SIZE = 20;

export const CACHE_KEY = {
  JIRA_SELECTED_CUSTOM_FIELD: "jira-selected-custom-field",
} as const;
