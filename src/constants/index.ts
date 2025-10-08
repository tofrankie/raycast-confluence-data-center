import { Icon, List } from "@raycast/api";
import { SearchFilter } from "../types";
import type { ConfluenceSpaceType, IconType, LabelType } from "../types";

export const DEFAULT_AVATAR = "avatar-default.svg";

export const COMMAND_NAMES = {
  CONFLUENCE_SEARCH_CONTENT: "confluence-search-content",
  CONFLUENCE_SEARCH_USER: "confluence-search-user",
  CONFLUENCE_SEARCH_SPACE: "confluence-search-space",
  JIRA_SEARCH_ISSUE: "jira-search-issue",
} as const;

export const CONFLUENCE_API = {
  SEARCH: "/rest/api/search",
  SEARCH_CONTENT: "/rest/api/content/search",
  CONTENT_FAVOURITE: "/rest/experimental/relation/user/current/favourite/toContent/",
} as const;

export const JIRA_API = {
  SEARCH: "/rest/api/2/search",
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
  [CONFLUENCE_ENTITY_TYPE.GROUP]: "icon-group.svg",
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

export const SPACE_TYPE_LABELS = {
  [CONFLUENCE_SPACE_TYPE.PERSONAL]: "Personal Space",
  [CONFLUENCE_SPACE_TYPE.GLOBAL]: "Global Space",
  [CONFLUENCE_SPACE_TYPE.FAVOURITE]: "Favourite",
} as const satisfies Record<ConfluenceSpaceType, string>;

export const AVATAR_TYPES = {
  CONFLUENCE: "confluence",
  JIRA: "jira",
} as const;

export const CONFLUENCE_AVATAR_DIR = "/tmp/raycast-confluence-data-center/confluence/avatars";

export const JIRA_AVATAR_DIR = "/tmp/raycast-confluence-data-center/jira/avatars";

export const DEFAULT_SEARCH_PAGE_SIZE = 20;

export const JIRA_ISSUE_TYPE_NAME = {
  BUG: "Bug",
  TASK: "Task",
  STORY: "Story",
  EPIC: "Epic",
  SUB_TASK: "Sub-task",
} as const;

export const JIRA_ISSUE_TYPE_ICONS = {
  [JIRA_ISSUE_TYPE_NAME.BUG]: "icon-bug.svg",
  [JIRA_ISSUE_TYPE_NAME.TASK]: "icon-task.svg",
  [JIRA_ISSUE_TYPE_NAME.STORY]: "icon-story.svg",
  [JIRA_ISSUE_TYPE_NAME.EPIC]: "icon-epic.svg",
  [JIRA_ISSUE_TYPE_NAME.SUB_TASK]: "icon-subtask.svg",
} as const;

export const JIRA_PRIORITY = {
  BLOCKER: "Blocker",
  CRITICAL: "Critical",
  MAJOR: "Major",
  MINOR: "Minor",
  TRIVIAL: "Trivial",
} as const;

// TODO:
export const JIRA_PRIORITY_ICONS = {
  [JIRA_PRIORITY.BLOCKER]: "icon-star.svg",
  [JIRA_PRIORITY.CRITICAL]: "icon-star.svg",
  [JIRA_PRIORITY.MAJOR]: "icon-star.svg",
  [JIRA_PRIORITY.MINOR]: "icon-star.svg",
  [JIRA_PRIORITY.TRIVIAL]: "icon-star.svg",
  default: "icon-star.svg",
} as const;

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

export const SPACE_TYPE_FILTERS: SearchFilter[] = [
  {
    id: "all",
    label: "All Space",
    cql: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "personal",
    label: "Personal Space",
    cql: "space.type = personal",
    icon: Icon.Person,
  },
  {
    id: "global",
    label: "Global Space",
    cql: "space.type = global",
    icon: Icon.Globe,
  },
  {
    id: "favourite",
    label: "Favourite Space",
    cql: "space.type = favourite",
    icon: Icon.Star,
  },
];

export const JIRA_SEARCH_FILTERS: SearchFilter[] = [
  {
    id: "assignee",
    label: "Assigned to Me",
    cql: "assignee = currentUser()",
    icon: Icon.Person,
  },
  {
    id: "reporter",
    label: "Reported by Me",
    cql: "reporter = currentUser()",
    icon: Icon.Pencil,
  },
  {
    id: "watcher",
    label: "Watched by Me",
    cql: "watcher = currentUser()",
    icon: Icon.Eye,
  },
  {
    id: "recent",
    label: "Recently Updated",
    cql: "updated >= -7d",
    icon: Icon.Clock,
  },
  {
    id: "open",
    label: "Open Issues",
    cql: 'status in (Open, "In Progress", Reopened)',
    icon: Icon.Circle,
  },
  {
    id: "resolved",
    label: "Resolved Issues",
    cql: "status in (Resolved, Closed)",
    icon: Icon.CheckCircle,
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
