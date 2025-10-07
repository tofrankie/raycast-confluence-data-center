import { useState, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast, open, Clipboard, showHUD } from "@raycast/api";
import { useJiraSearchIssue } from "./hooks/use-jira-queries";
import { JiraPreferencesProvider, useJiraPreferencesContext } from "./contexts/jira-preferences-context";
import { JIRA_SEARCH_FILTERS } from "./constants";
import { parseJQL } from "./utils/cql-parser";
import QueryProvider from "./query-provider";
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

  // 构建 JQL 查询
  const jql = useMemo(() => {
    let query = searchText.trim();

    // 如果没有输入文本，使用默认查询
    if (!query) {
      query = "ORDER BY updated DESC";
    } else {
      // 检查是否是 JQL 查询
      const parsed = parseJQL(query);
      if (!parsed.isCQL) {
        // 如果不是 JQL，则作为文本搜索
        query = `text ~ "${query}" OR summary ~ "${query}" OR description ~ "${query}"`;
      }
    }

    // 应用过滤器
    const selectedFilter = JIRA_SEARCH_FILTERS.find((filter) => filter.id === selectedFilterId);
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

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useJiraSearchIssue(
    preferences,
    jql,
    true,
    // preferences.searchPageSize,
    3,
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

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={handleSearchTextChange}
      searchBarPlaceholder="Search Jira issues or enter JQL query..."
      searchBarAccessory={
        <List.Dropdown tooltip="Filter Issues" value={selectedFilterId} onChange={handleFilterChange}>
          <List.Dropdown.Item title="All Issues" value="" />
          {JIRA_SEARCH_FILTERS.map((filter) => (
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
          title="No Issues Found"
          description="Try adjusting your search terms or filters"
        />
      ) : (
        issues.map((issue) => (
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
        ))
      )}
    </List>
  );
}
