import { Icon, List } from "@raycast/api";
import { SearchFilter } from "../types";
import type { ConfluenceContentType } from "../types";

export const COMMAND_NAMES = {
  CONFLUENCE_SEARCH_CONTENT: "confluence-search-content",
} as const;

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

export const CONTENT_ICONS = {
  [CONFLUENCE_CONTENT_TYPE.PAGE]: "icon-page.svg",
  [CONFLUENCE_CONTENT_TYPE.BLOGPOST]: "icon-blogpost.svg",
  [CONFLUENCE_CONTENT_TYPE.ATTACHMENT]: "icon-attachment.svg",
  [CONFLUENCE_CONTENT_TYPE.COMMENT]: "icon-comment.svg",
  [CONFLUENCE_CONTENT_TYPE.USER]: "icon-user.svg",
  [CONFLUENCE_CONTENT_TYPE.SPACE]: "icon-space.svg",
} as const satisfies Record<ConfluenceContentType, List.Item.Props["icon"]>;

export const CONTENT_TYPE_LABELS = {
  [CONFLUENCE_CONTENT_TYPE.PAGE]: "Page",
  [CONFLUENCE_CONTENT_TYPE.BLOGPOST]: "Blog Post",
  [CONFLUENCE_CONTENT_TYPE.ATTACHMENT]: "Attachment",
  [CONFLUENCE_CONTENT_TYPE.COMMENT]: "Comment",
  [CONFLUENCE_CONTENT_TYPE.USER]: "User",
  [CONFLUENCE_CONTENT_TYPE.SPACE]: "Space",
} as const satisfies Record<ConfluenceContentType, string>;

export const AVATAR_TYPES = {
  CONFLUENCE: "confluence",
  JIRA: "jira",
} as const;

export const CONFLUENCE_AVATAR_DIR = "/tmp/raycast-confluence-data-center/confluence/avatars";

export const JIRA_AVATAR_DIR = "/tmp/raycast-confluence-data-center/jira/avatars";

export const DEFAULT_SEARCH_PAGE_SIZE = 20;

export const SEARCH_FILTERS: SearchFilter[] = [
  {
    id: "creator",
    label: "Created by Me",
    cql: "creator = currentUser()",
    icon: Icon.Person,
  },
  {
    id: "contributor",
    label: "Contributed by Me",
    cql: "contributor = currentUser()",
    icon: Icon.Pencil,
  },
  {
    id: "mention",
    label: "Mentions Me",
    cql: "mention = currentUser()",
    icon: Icon.AtSymbol,
  },
  {
    id: "favourite",
    label: "My Favorites",
    cql: "favourite = currentUser()",
    icon: Icon.Star,
  },
  {
    id: "watcher",
    label: "Watched by Me",
    cql: "watcher = currentUser()",
    icon: Icon.Eye,
  },
  {
    id: "title-only",
    label: "Title Only",
    cql: "",
    icon: Icon.Text,
    transform: (query: string) => query.replace(/text ~ "/g, 'title ~ "'),
  },
];

export const CQL_PATTERNS = [
  /^\s*\w+\s*[=~!<>]/, // field operator
  /currentUser\(\)/, // currentUser function
  /now\(\)/, // now function
  /\b(AND|OR|NOT)\b/, // logical operators
  // 官方支持的字段模式
  /(ancestor|container|content|created|creator|contributor|favourite|id|label|lastModified|macro|mention|parent|space|text|title|type|watcher)\s*[=~!<>]/, // official fields
] as const;
