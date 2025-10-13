import { useState, useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { SearchBarAccessory } from "@/components";
import { clearAllCacheWithToast, buildJQL, getSectionTitle } from "@/utils";
import { COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";
import { useJiraProjectQuery, useJiraSearchIssueInfiniteQuery } from "@/hooks";
import type { SearchFilter } from "@/types";

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

  const jql = useMemo(() => {
    const trimmedText = searchText.trim();
    const filters = filter ? [filter] : [];

    if (!trimmedText && filter?.autoQuery) {
      return filter.query;
    }

    if (!trimmedText.length) {
      return "";
    }

    if (ISSUE_KEY_REGEX.test(trimmedText)) {
      filters.push({
        id: "issue_key",
        query: `key in (${trimmedText}) ORDER BY updated DESC, created DESC`,
      });
    } else if (PURE_NUMBER_REGEX.test(trimmedText) && projectKeys?.length) {
      const keys = projectKeys.map((key) => `${key}-${trimmedText}`).join(", ");
      filters.push({
        id: "issue_key",
        query: `key in (${keys}) ORDER BY updated DESC, created DESC`,
      });
    }
    // TODO:
    // else if (trimmedText && !isJQLSyntax(trimmedText)) {
    //   filters.push({
    //     id: "text",
    //     query: "ORDER BY updated DESC, created DESC",
    //   });
    // }

    return buildJQL(trimmedText, filters);
  }, [searchText, filter, projectKeys]);

  const jiraIssueEnabled = useMemo(() => {
    return (isJiraProjectFetched || !!jiraProjectError) && jql.length >= 2;
  }, [isJiraProjectFetched, jiraProjectError, jql]);

  const { data, error, isLoading, isFetched, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useJiraSearchIssueInfiniteQuery(jql, {
      enabled: jiraIssueEnabled,
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

  const sectionTitle = getSectionTitle(filter, {
    fetchedCount: issues.length,
    totalCount: data?.totalCount || 0,
  });

  const isEmpty = isFetched && !issues.length && jql.length;

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
      {isEmpty ? (
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
