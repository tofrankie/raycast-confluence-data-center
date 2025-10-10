import { useState, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";

import QueryProvider from "@/query-provider";
import { parseJQL } from "@/utils";
import { COMMAND_NAMES } from "@/constants";
import { SearchBarAccessory } from "@/components";
import { useJiraSearchIssueInfiniteQuery } from "@/hooks";
import { JiraPreferencesProvider, useJiraPreferencesContext } from "@/contexts";
import type { SearchFilter } from "@/types";

// for test: ORDER BY updated DESC
const DEFAULT_JQL =
  "assignee = currentUser() AND resolution = unresolved ORDER BY summary ASC, key ASC, priority DESC, created ASC";

const ISSUE_KEY_REGEX = /^[A-Z][A-Z0-9_]+-\d+$/;

export default function JiraSearchIssueProvider() {
  return (
    <JiraPreferencesProvider>
      <QueryProvider>
        <JiraSearchIssueContent />
      </QueryProvider>
    </JiraPreferencesProvider>
  );
}

function JiraSearchIssueContent() {
  const preferences = useJiraPreferencesContext();
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const jql = useMemo(() => {
    let query = searchText.trim();

    if (!query) {
      query = DEFAULT_JQL;
    } else {
      const parsed = parseJQL(query);
      if (!parsed.isCQL) {
        if (ISSUE_KEY_REGEX.test(query)) {
          query = `issuekey = "${query}" OR text ~ "${query}"`;
        } else {
          query = `text ~ "${query}"`;
        }
      }
    }

    if (filter && filter.query) {
      if (query.includes("ORDER BY")) {
        const orderByPart = query.match(/ORDER BY .+$/)?.[0] || "";
        const baseQuery = query.replace(/ORDER BY .+$/, "").trim();
        query = `${baseQuery} AND ${filter.query} ${orderByPart}`;
      } else {
        query = `${query} AND ${filter.query}`;
      }
    }

    return query;
  }, [searchText, filter]);

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useJiraSearchIssueInfiniteQuery(jql, preferences.jiraBaseUrl, preferences.searchPageSize);

  const issues = data?.issues || [];

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // const hasMore = data?.hasMore || false;
  const hasMore = false;

  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Search Failed",
      message: error.message,
    });
  }

  const sectionTitle = !searchText && issues.length ? `Assigned to Me (${issues.length})` : undefined;

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={handleSearchTextChange}
      searchBarPlaceholder="Search Issue..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAMES.JIRA_SEARCH_ISSUE}
          value={filter?.id || ""}
          onChange={setFilter}
        />
      }
      throttle
      pagination={{
        onLoadMore: handleLoadMore,
        hasMore,
        pageSize: preferences.searchPageSize,
      }}
    >
      {issues.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Results"
          description="Try adjusting your search filters or check your JQL syntax"
        />
      ) : (
        <List.Section title={sectionTitle}>
          {issues.map((item) => (
            <List.Item
              key={item.renderKey}
              title={item.summary}
              subtitle={item.subtitle}
              icon={item.icon}
              accessories={item.accessories}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                  <Action.CopyToClipboard
                    title="Copy URL"
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                    content={item.url}
                  />
                  <Action.CopyToClipboard
                    title="Copy Key"
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    content={item.key}
                  />
                  <Action.CopyToClipboard
                    title="Copy Summary"
                    shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
                    content={item.summary}
                  />
                  <Action.CopyToClipboard title="Copy JQL" content={jql} />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                    onAction={() => refetch()}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
