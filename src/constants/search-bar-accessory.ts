import { Icon } from "@raycast/api";

import { COMMAND_NAMES } from "@/constants";

import type { SearchBarAccessoryItem, SearchBarAccessoryCommandName } from "@/types";

const CONFLUENCE_SEARCH_CONTENT_FILTERS: SearchBarAccessoryItem[] = [
  {
    id: "default",
    title: "All Content",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "creator",
    title: "Created by Me",
    query: "creator = currentUser() order by created desc",
    icon: Icon.Person,
    autoQuery: true,
  },
  {
    id: "contributor",
    title: "Contributed by Me",
    query: "contributor = currentUser() order by lastModified desc",
    icon: Icon.Pencil,
    autoQuery: true,
  },
  {
    id: "mention",
    title: "Mentions Me",
    query: "mention = currentUser()",
    icon: Icon.AtSymbol,
    autoQuery: true,
  },
  {
    id: "favourite",
    title: "My Favorites",
    query: "favourite = currentUser() order by favourite desc",
    icon: Icon.Star,
    autoQuery: true,
  },
  {
    id: "watcher",
    title: "Watched by Me",
    query: "watcher = currentUser()",
    icon: Icon.Eye,
    autoQuery: true,
  },
  {
    id: "title-only",
    title: "Title Only",
    query: "",
    icon: Icon.Text,
    transform: (processedQuery: string) => processedQuery.replace(/text ~ "/g, 'title ~ "'),
  },
];

const CONFLUENCE_SEARCH_SPACE_FILTERS: SearchBarAccessoryItem[] = [
  {
    id: "default",
    title: "All Space",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "all",
    title: "All Space",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "personal",
    title: "Personal Space",
    query: "space.type = personal",
    icon: Icon.Person,
  },
  {
    id: "global",
    title: "Global Space",
    query: "space.type = global",
    icon: Icon.Globe,
  },
  {
    id: "favourite",
    title: "Favourite Space",
    query: "space.type = favourite",
    icon: Icon.Star,
  },
];

const JIRA_SEARCH_ISSUE_FILTERS: SearchBarAccessoryItem[] = [
  {
    id: "default",
    title: "All Issue",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "assignee",
    title: "Assigned to Me",
    query: "assignee = currentUser()",
    icon: Icon.Person,
  },
  {
    id: "reporter",
    title: "Reported by Me",
    query: "reporter = currentUser()",
    icon: Icon.Pencil,
  },
  {
    id: "watcher",
    title: "Watched by Me",
    query: "watcher = currentUser()",
    icon: Icon.Eye,
  },
  {
    id: "recent",
    title: "Recently Updated",
    query: "updated >= -7d",
    icon: Icon.Clock,
  },
  {
    id: "open",
    title: "Open Issues",
    query: 'status in (Open, "In Progress", Reopened)',
    icon: Icon.Circle,
  },
  {
    id: "resolved",
    title: "Resolved Issues",
    query: "status in (Resolved, Closed)",
    icon: Icon.CheckCircle,
  },
];

export const SEARCH_BAR_ACCESSORY_CONFIGS: Record<SearchBarAccessoryCommandName, SearchBarAccessoryItem[]> = {
  [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT]: CONFLUENCE_SEARCH_CONTENT_FILTERS,
  [COMMAND_NAMES.CONFLUENCE_SEARCH_SPACE]: CONFLUENCE_SEARCH_SPACE_FILTERS,
  [COMMAND_NAMES.JIRA_SEARCH_ISSUE]: JIRA_SEARCH_ISSUE_FILTERS,
};
