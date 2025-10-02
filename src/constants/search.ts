import { SearchFilter } from "../types/search";

export const SEARCH_FILTERS: SearchFilter[] = [
  {
    id: "creator",
    label: "Created by Me",
    cql: "creator = currentUser()",
    icon: "icon-user.svg",
  },
  {
    id: "contributor",
    label: "Contributed by Me",
    cql: "contributor = currentUser()",
    icon: "icon-pencil.svg",
  },
  {
    id: "mention",
    label: "Mentions Me",
    cql: "mention = currentUser()",
    icon: "icon-at.svg",
  },
  {
    id: "favourite",
    label: "My Favorites",
    cql: "favourite = currentUser()",
    icon: "icon-star.svg",
  },
  {
    id: "watcher",
    label: "Watched by Me",
    cql: "watcher = currentUser()",
    icon: "icon-eye.svg",
  },
  {
    id: "title-only",
    label: "Title Only",
    cql: "title-only", // 特殊标记，需要特殊处理
    icon: "icon-text.svg",
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
