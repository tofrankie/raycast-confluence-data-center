import { Icon } from "@raycast/api";

import { COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";

import type { SearchBarAccessoryItem, SearchBarAccessoryCommandName } from "@/types";

const CONFLUENCE_SEARCH_CONTENT_FILTERS: SearchBarAccessoryItem[] = [
  {
    id: "default",
    title: "All Content",
    query: "",
    icon: Icon.MagnifyingGlass,
  },
  {
    id: "viewed_recently",
    title: "Viewed Recently",
    query: `id in recentlyViewedContent(${SEARCH_PAGE_SIZE}, 0)`,
    icon: Icon.Eye,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Viewed Recently (${fetchedCount}/${totalCount})`,
  },
  {
    id: "created_by_me",
    title: "Created by Me",
    query: "creator = currentUser() order by created desc",
    icon: Icon.Person,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Created by Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "contributed_by_me",
    title: "Contributed by Me",
    query: "contributor = currentUser() order by lastModified desc",
    icon: Icon.Pencil,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Contributed by Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "mentions_me",
    title: "Mentions Me",
    query: "mention = currentUser()",
    icon: Icon.AtSymbol,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Mentions Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "my_favourites",
    title: "My Favourites",
    query: "favourite = currentUser() order by favourite desc",
    icon: Icon.Star,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `My Favourites (${fetchedCount}/${totalCount})`,
  },
  {
    id: "watched_by_me",
    title: "Watched by Me",
    query: "watcher = currentUser()",
    icon: Icon.Eye,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Watched by Me (${fetchedCount}/${totalCount})`,
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
    sectionTitle: ({ fetchedCount, totalCount }) => `My Open Issues (${fetchedCount}/${totalCount})`,
  },
  {
    id: "open_issues",
    title: "Open Issues",
    query: "resolution = Unresolved ORDER BY updated DESC, priority DESC, created DESC",
    icon: Icon.Circle,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Open Issues (${fetchedCount}/${totalCount})`,
  },
  {
    id: "assigned_to_me",
    title: "Assigned to Me",
    query: "assignee = currentUser() ORDER BY created DESC",
    icon: Icon.Person,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Assigned to Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "reported_by_me",
    title: "Reported by Me",
    query: "reporter = currentUser() ORDER BY created DESC",
    icon: Icon.Person,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Reported by Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "created_recently",
    title: "Created Recently",
    query: "created >= -1w ORDER BY created DESC",
    icon: Icon.Clock,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Created Recently (${fetchedCount}/${totalCount})`,
  },
  {
    id: "updated_recently",
    title: "Updated Recently",
    query: "updated >= -1w ORDER BY updated DESC",
    icon: Icon.Clock,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Updated Recently (${fetchedCount}/${totalCount})`,
  },
  {
    id: "resolved_recently",
    title: "Resolved Recently",
    query: "resolutiondate >= -1w ORDER BY updated DESC",
    icon: Icon.CheckCircle,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Resolved Recently (${fetchedCount}/${totalCount})`,
  },
  {
    id: "viewed_recently",
    title: "Viewed Recently",
    query: "issuekey in issueHistory() ORDER BY lastViewed DESC",
    icon: Icon.Eye,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Viewed Recently (${fetchedCount}/${totalCount})`,
  },
  {
    id: "watched_by_me",
    title: "Watched by Me",
    query: "watcher = currentUser() ORDER BY updated DESC",
    icon: Icon.Eye,
    autoQuery: true,
    sectionTitle: ({ fetchedCount, totalCount }) => `Watched by Me (${fetchedCount}/${totalCount})`,
  },
  {
    id: "summary_only",
    title: "Summary Only",
    query: "",
    icon: Icon.Text,
    transform: (processedQuery: string) => processedQuery.replace(/text ~ "/g, 'summary ~ "'),
  },
];

export const SEARCH_BAR_ACCESSORY_CONFIGS = {
  [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT]: CONFLUENCE_SEARCH_CONTENT_FILTERS,
  [COMMAND_NAME.CONFLUENCE_SEARCH_SPACE]: CONFLUENCE_SEARCH_SPACE_FILTERS,
  [COMMAND_NAME.JIRA_SEARCH_ISSUE]: JIRA_SEARCH_ISSUE_FILTERS,
} as const satisfies Record<SearchBarAccessoryCommandName, SearchBarAccessoryItem[]>;
