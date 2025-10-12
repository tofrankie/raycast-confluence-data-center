import { useState, useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { parseJQL, clearAllCacheWithToast } from "@/utils";
import { COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";
import { SearchBarAccessory } from "@/components";
import { useJiraProjectQuery, useJiraSearchIssueInfiniteQuery } from "@/hooks";
import type { SearchFilter } from "@/types";

// for test: ORDER BY updated DESC
const DEFAULT_JQL = "assignee = currentUser() AND resolution = unresolved";
const DEFAULT_ORDER_BY = "ORDER BY updated DESC, created DESC, summary ASC, key ASC, priority DESC";

const ISSUE_KEY_REGEX = /^[A-Z][A-Z0-9_]+-\d+$/;
const PURE_NUMBER_REGEX = /^\d+$/;

export default function JiraSearchIssueProvider() {
  return (
    <QueryProvider>
      <JiraSearchIssueContent />
    </QueryProvider>
  );
}

function JiraSearchIssueContent() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const {
    data: projectKeys,
    isFetched: isJiraProjectFetched,
    error: jiraProjectError,
  } = useJiraProjectQuery({
    select: (list) => list.map((item) => item.key),
  });

  const jiraIssueEnabled = useMemo(() => {
    return isJiraProjectFetched || !!jiraProjectError;
  }, [isJiraProjectFetched, jiraProjectError]);

  const jql = useMemo(() => {
    let query = searchText.trim();

    if (!query) {
      query = DEFAULT_JQL;
    } else {
      const parsed = parseJQL(query);
      if (!parsed.isCQL) {
        if (ISSUE_KEY_REGEX.test(query)) {
          query = `key = "${query}" OR summary ~ "${query}"`;
        } else if (PURE_NUMBER_REGEX.test(query) && projectKeys?.length) {
          const issueKeys = projectKeys.map((key) => `${key}-${query}`).join(", ");
          query = `summary ~ "${query}" OR key in (${issueKeys})`;
        } else {
          query = `summary ~ "${query}"`;
        }
      }
    }

    query = `${query} ${DEFAULT_ORDER_BY}`;

    return query;
  }, [searchText, filter, projectKeys]);

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useJiraSearchIssueInfiniteQuery(jql, {
      enabled: jiraIssueEnabled && jql.length >= 2,
    });

  const issues = data?.issues || [];

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const hasMore = data?.hasMore || false;

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Search Failed" });
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      showToast(Toast.Style.Success, "Refresh successful");
    } catch {
      // Error handling is done by useEffect
    }
  };

  const sectionTitle = !searchText && issues.length ? `Assigned to Me (${issues.length})` : undefined;

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={handleSearchTextChange}
      searchBarPlaceholder="Search Issue..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAME.JIRA_SEARCH_ISSUE}
          value={filter?.id || ""}
          onChange={setFilter}
        />
      }
      throttle
      pagination={{
        hasMore,
        onLoadMore: handleLoadMore,
        pageSize: SEARCH_PAGE_SIZE,
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
                    onAction={handleRefresh}
                  />
                  <Action title="Clear Cache" icon={Icon.Trash} onAction={clearAllCacheWithToast} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
