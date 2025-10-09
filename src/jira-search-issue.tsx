import { useState, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast, open, Clipboard, showHUD } from "@raycast/api";
import QueryProvider from "./query-provider";
import { parseJQL } from "./utils/cql-parser";
import { JIRA_SEARCH_ISSUE_FILTERS } from "./constants";
import { useJiraSearchIssueInfiniteQuery } from "./hooks/use-jira-query";
import { JiraPreferencesProvider, useJiraPreferencesContext } from "./contexts/jira-preferences-context";
import type { ProcessedJiraIssueItem } from "./types";

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
  const [selectedFilterId, setSelectedFilterId] = useState<string>("");

  const jql = useMemo(() => {
    let query = searchText.trim();

    if (!query) {
      query =
        "assignee = currentUser() AND resolution = unresolved ORDER BY summary ASC, key ASC, priority DESC, created ASC";
    } else {
      const parsed = parseJQL(query);
      if (!parsed.isCQL) {
        query = `text ~ "${query}"`;
      }
    }

    const selectedFilter = JIRA_SEARCH_ISSUE_FILTERS.find((filter) => filter.id === selectedFilterId);
    if (selectedFilter && selectedFilter.cql) {
      if (query.includes("ORDER BY")) {
        const orderByPart = query.match(/ORDER BY .+$/)?.[0] || "";
        const baseQuery = query.replace(/ORDER BY .+$/, "").trim();
        query = `${baseQuery} AND ${selectedFilter.cql} ${orderByPart}`;
      } else {
        query = `${query} AND ${selectedFilter.cql}`;
      }
    }

    return query;
  }, [searchText, selectedFilterId]);

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useJiraSearchIssueInfiniteQuery(
    jql,
    preferences.jiraBaseUrl,
    preferences.searchPageSize,
  );

  const issues = data?.issues || [];

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilterId(filterId);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const hasMore = data?.hasMore || false;

  const handleOpenIssue = (issue: ProcessedJiraIssueItem) => {
    open(issue.url);
  };

  const handleCopyIssueKey = async (issue: ProcessedJiraIssueItem) => {
    await Clipboard.copy(issue.key);
    await showHUD(`Copied ${issue.key}`);
  };

  const handleCopyIssueUrl = async (issue: ProcessedJiraIssueItem) => {
    await Clipboard.copy(issue.url);
    await showHUD("Copied issue URL");
  };

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
        <List.Dropdown tooltip="Filter Issue" value={selectedFilterId} onChange={handleFilterChange}>
          <List.Dropdown.Item title="All Issue" value="" />
          {JIRA_SEARCH_ISSUE_FILTERS.map((filter) => (
            <List.Dropdown.Item key={filter.id} title={filter.label} value={filter.id} icon={filter.icon} />
          ))}
        </List.Dropdown>
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
          {issues.map((issue) => (
            <List.Item
              key={issue.id}
              title={issue.summary}
              subtitle={issue.subtitle}
              icon={issue.icon}
              accessories={issue.accessories}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action title="Open Issue" icon={Icon.Globe} onAction={() => handleOpenIssue(issue)} />
                    <Action
                      title="Copy Issue Key"
                      icon={Icon.Clipboard}
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                      onAction={() => handleCopyIssueKey(issue)}
                    />
                    <Action
                      title="Copy Issue URL"
                      icon={Icon.Link}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      onAction={() => handleCopyIssueUrl(issue)}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action
                      title="Refresh"
                      icon={Icon.ArrowClockwise}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                      onAction={() => window.location.reload()}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
