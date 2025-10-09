import { Icon } from "@raycast/api";
import { SearchFilter } from "../types";

export const CONFLUENCE_SEARCH_CONTENT_FILTERS: SearchFilter[] = [
  {
    id: "creator",
    label: "Created by Me",
    cql: "creator = currentUser() order by created desc",
    icon: Icon.Person,
    autoQuery: true,
  },
  {
    id: "contributor",
    label: "Contributed by Me",
    cql: "contributor = currentUser() order by lastModified desc",
    icon: Icon.Pencil,
    autoQuery: true,
  },
  {
    id: "mention",
    label: "Mentions Me",
    cql: "mention = currentUser()",
    icon: Icon.AtSymbol,
    autoQuery: true,
  },
  {
    id: "favourite",
    label: "My Favorites",
    cql: "favourite = currentUser() order by favourite desc",
    icon: Icon.Star,
    autoQuery: true,
  },
  {
    id: "watcher",
    label: "Watched by Me",
    cql: "watcher = currentUser()",
    icon: Icon.Eye,
    autoQuery: true,
  },
  {
    id: "title-only",
    label: "Title Only",
    cql: "",
    icon: Icon.Text,
    transform: (processedCql: string) => processedCql.replace(/text ~ "/g, 'title ~ "'),
  },
];

export const CONFLUENCE_SPACE_TYPE_FILTERS: SearchFilter[] = [
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

export const JIRA_SEARCH_ISSUE_FILTERS: SearchFilter[] = [
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
