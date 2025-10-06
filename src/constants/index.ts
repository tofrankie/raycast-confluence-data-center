import { Icon, List } from "@raycast/api";
import { SearchFilter } from "../types";
import type { IconType, LabelType } from "../types";

export const COMMAND_NAMES = {
  CONFLUENCE_SEARCH_CONTENT: "confluence-search-content",
} as const;

export const CONFLUENCE_API = {
  SEARCH: "/rest/api/search",
  SEARCH_CONTENT: "/rest/api/content/search",
  CONTENT_FAVOURITE: "/rest/experimental/relation/user/current/favourite/toContent/",
} as const;

export const CONFLUENCE_ENTITY_TYPE = {
  CONTENT: "content",
  SPACE: "space",
  USER: "user",
  GROUP: "group",
} as const;

export const CONFLUENCE_CONTENT_TYPE = {
  PAGE: "page",
  BLOGPOST: "blogpost",
  ATTACHMENT: "attachment",
  COMMENT: "comment",
} as const;

export const CONFLUENCE_SPACE_TYPE = {
  PERSONAL: "personal",
  GLOBAL: "global",
  FAVOURITE: "favourite",
} as const;

export const TYPE_ICONS = {
  [CONFLUENCE_ENTITY_TYPE.CONTENT]: "icon-content.svg",
  [CONFLUENCE_ENTITY_TYPE.SPACE]: "icon-space.svg",
  [CONFLUENCE_ENTITY_TYPE.USER]: "icon-user.svg",
  [CONFLUENCE_ENTITY_TYPE.GROUP]: "icon-user-group.svg", // TODO:
  [CONFLUENCE_CONTENT_TYPE.PAGE]: "icon-page.svg",
  [CONFLUENCE_CONTENT_TYPE.BLOGPOST]: "icon-blogpost.svg",
  [CONFLUENCE_CONTENT_TYPE.ATTACHMENT]: "icon-attachment.svg",
  [CONFLUENCE_CONTENT_TYPE.COMMENT]: "icon-comment.svg",
} as const satisfies Record<IconType, List.Item.Props["icon"]>;

export const TYPE_LABELS = {
  [CONFLUENCE_ENTITY_TYPE.CONTENT]: "Content",
  [CONFLUENCE_ENTITY_TYPE.SPACE]: "Space",
  [CONFLUENCE_ENTITY_TYPE.USER]: "User",
  [CONFLUENCE_ENTITY_TYPE.GROUP]: "Group",
  [CONFLUENCE_CONTENT_TYPE.PAGE]: "Page",
  [CONFLUENCE_CONTENT_TYPE.BLOGPOST]: "Blog Post",
  [CONFLUENCE_CONTENT_TYPE.ATTACHMENT]: "Attachment",
  [CONFLUENCE_CONTENT_TYPE.COMMENT]: "Comment",
} as const satisfies Record<LabelType, string>;

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
    transform: (processedCql: string) => processedCql.replace(/text ~ "/g, 'title ~ "'),
  },
];

export const CQL_PATTERNS = [
  // field operator
  /^\s*\w+\s*[=~!<>]/,

  // currentUser function
  /currentUser\(\)/,

  // now function
  /now\(\)/,

  // logical operators
  /\b(AND|OR|NOT)\b/,

  // official fields
  /(ancestor|container|content|created|creator|contributor|favourite|id|label|lastModified|macro|mention|parent|space|text|title|type|watcher)\s*[=~!<>]/,

  // entityType values
  /type\s*=\s*["']?(content|page|blogpost|attachment|comment|space|user|group)["']?/i,
] as const;
