export const CONFLUENCE_API = {
  SEARCH_CONTENT: "/rest/api/content/search",
  CONTENT_FAVOURITE: "/rest/experimental/relation/user/current/favourite/toContent/",
} as const;

export const CONFLUENCE_CONTENT_TYPE = {
  PAGE: "page",
  BLOGPOST: "blogpost",
  ATTACHMENT: "attachment",
  COMMENT: "comment",
  USER: "user",
  SPACE: "space",
} as const;

export const AVATAR_TYPES = {
  CONFLUENCE: "confluence",
  JIRA: "jira",
} as const;

export const CONFLUENCE_AVATAR_DIR = "/tmp/raycast-confluence-data-center/confluence/avatars";

export const JIRA_AVATAR_DIR = "/tmp/raycast-confluence-data-center/jira/avatars";

export const DEFAULT_SEARCH_PAGE_SIZE = 20;
