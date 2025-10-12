import { Icon } from "@raycast/api";

import { COMMAND_NAME } from "@/constants";

import type { SearchBarAccessoryItem, SearchBarAccessoryCommandName } from "@/types";

const CONFLUENCE_SEARCH_CONTENT_FILTERS: SearchBarAccessoryItem[] = [
  {
    id: "default",
    title: "All Content",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "created_by_me",
    title: "Created by Me",
    query: "creator = currentUser() order by created desc",
    icon: Icon.Person,
    autoQuery: true,
  },
  {
    id: "contributed_by_me",
    title: "Contributed by Me",
    query: "contributor = currentUser() order by lastModified desc",
    icon: Icon.Pencil,
    autoQuery: true,
  },
  {
    id: "mentions_me",
    title: "Mentions Me",
    query: "mention = currentUser()",
    icon: Icon.AtSymbol,
    autoQuery: true,
  },
  {
    id: "my_favourites",
    title: "My Favourites",
    query: "favourite = currentUser() order by favourite desc",
    icon: Icon.Star,
    autoQuery: true,
  },
  {
    id: "watched_by_me",
    title: "Watched by Me",
    query: "watcher = currentUser()",
    icon: Icon.Eye,
    autoQuery: true,
  },
  {
    id: "title_only",
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
    id: "personal_space",
    title: "Personal Space",
    query: "space.type = personal",
    icon: Icon.Person,
  },
  {
    id: "global_space",
    title: "Global Space",
    query: "space.type = global",
    icon: Icon.Globe,
  },
  {
    id: "favourite_space",
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
    id: "my_open_issues",
    title: "My Open Issues",
    query: "assignee = currentUser() AND resolution = Unresolved ORDER BY priority DESC,updated DESC, created DESC",
    icon: Icon.Circle,
    autoQuery: true,
  },
  {
    id: "open_issues",
    title: "Open Issues",
    query: "resolution = Unresolved ORDER BY updated DESC, priority DESC, created DESC",
    icon: Icon.Circle,
    autoQuery: true,
  },
  {
    id: "assigned_to_me",
    title: "Assigned to Me",
    query: "assignee = currentUser() ORDER BY created DESC",
    icon: Icon.Person,
    autoQuery: true,
  },
  {
    id: "reported_by_me",
    title: "Reported by Me",
    query: "reporter = currentUser() ORDER BY created DESC",
    icon: Icon.Person,
    autoQuery: true,
  },
  {
    id: "created_recently",
    title: "Created Recently",
    query: "created >= -1w ORDER BY created DESC",
    icon: Icon.Clock,
    autoQuery: true,
  },
  {
    id: "updated_recently",
    title: "Updated Recently",
    query: "updated >= -1w ORDER BY updated DESC",
    icon: Icon.Clock,
    autoQuery: true,
  },
  {
    id: "resolved_recently",
    title: "Resolved Recently",
    query: "resolutiondate >= -1w ORDER BY updated DESC",
    icon: Icon.CheckCircle,
    autoQuery: true,
  },
  {
    id: "viewed_recently",
    title: "Viewed Recently",
    query: "issuekey in issueHistory() ORDER BY lastViewed DESC",
    icon: Icon.Eye,
    autoQuery: true,
  },
  {
    id: "watched_by_me",
    title: "Watched by Me",
    query: "watcher = currentUser() ORDER BY updated DESC",
    icon: Icon.Eye,
    autoQuery: true,
  },
  {
    id: "summary_only",
    title: "Summary Only",
    query: "",
    icon: Icon.Text,
    transform: (processedQuery: string) => processedQuery.replace(/text ~ "/g, 'summary ~ "'),
  },
];

export const SEARCH_BAR_ACCESSORY_CONFIGS: Record<SearchBarAccessoryCommandName, SearchBarAccessoryItem[]> = {
  [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT]: CONFLUENCE_SEARCH_CONTENT_FILTERS,
  [COMMAND_NAME.CONFLUENCE_SEARCH_SPACE]: CONFLUENCE_SEARCH_SPACE_FILTERS,
  [COMMAND_NAME.JIRA_SEARCH_ISSUE]: JIRA_SEARCH_ISSUE_FILTERS,
};
