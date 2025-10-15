import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { avatarExtractors, clearAllCacheWithToast, processUserInputAndFilter, buildQuery } from "@/utils";
import { IGNORE_FILTER, QUERY_TYPE } from "@/constants";
import { APP_TYPE, AVATAR_TYPE, COMMAND_NAME, SEARCH_PAGE_SIZE } from "@/constants";
import { SearchBarAccessory, QueryWrapper } from "@/components";
import { useConfluenceSearchSpaceInfiniteQuery, useAvatar } from "@/hooks";
import type { SearchFilter } from "@/types";

export default function ConfluenceSearchSpaceProvider() {
  return (
    <QueryProvider>
      <ConfluenceSearchSpace />
    </QueryProvider>
  );
}

function ConfluenceSearchSpace() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const cql = useMemo(() => {
    if (!searchText) return "";

    const effectiveFilter = IGNORE_FILTER ? undefined : filter || undefined;
    const result = processUserInputAndFilter({
      userInput: searchText,
      filter: effectiveFilter,
      buildClauseFromText: (input) => `space.title ~ "${input}"`,
      queryType: "CQL",
    });

    if (typeof result === "string") {
      return result;
    }

    const finalResult = buildQuery({
      ...result,
      clauses: [...result.clauses, "type = space"],
      orderBy: result.orderBy || "lastmodified DESC",
      queryType: "CQL",
    });

    return finalResult;
  }, [searchText, filter]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error, refetch } =
    useConfluenceSearchSpaceInfiniteQuery(cql);

  const results = useMemo(() => data?.items ?? [], [data?.items]);
  const hasMore = useMemo(() => data?.hasMore ?? false, [data?.hasMore]);

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

  useAvatar({
    items: results,
    appType: APP_TYPE.CONFLUENCE,
    avatarType: AVATAR_TYPE.CONFLUENCE_SPACE,
    extractAvatarData: avatarExtractors.confluenceSpace,
  });

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = !isLoading && searchText.trim() && !results.length;

  const searchTitle = `Results (${results.length}/${data?.totalCount})`;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Space..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAME.CONFLUENCE_SEARCH_SPACE}
          value={filter?.id || ""}
          onChange={setFilter}
        />
      }
      pagination={{
        hasMore,
        onLoadMore: handleLoadMore,
        pageSize: SEARCH_PAGE_SIZE,
      }}
    >
      <QueryWrapper query={searchText} queryType={QUERY_TYPE.CQL}>
        {isEmpty ? (
          <List.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No Results"
            description="Try adjusting your search filters or check your CQL syntax"
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  icon={Icon.Book}
                  title="Open CQL Documentation"
                  url="https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql"
                />
                {cql && <Action.CopyToClipboard title="Copy CQL" content={cql} />}
              </ActionPanel>
            }
          />
        ) : (
          <List.Section title={searchTitle}>
            {results.map((item) => {
              return (
                <List.Item
                  key={item.renderKey}
                  icon={item.icon}
                  title={item.name}
                  subtitle={item.subtitle}
                  accessories={item.accessories}
                  actions={
                    <ActionPanel>
                      <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                      <Action.CopyToClipboard
                        title="Copy Link"
                        content={item.url}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      />
                      <Action.CopyToClipboard title="Copy Space Key" content={item.key} />
                      {cql && <Action.CopyToClipboard title="Copy CQL" content={cql} />}
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
              );
            })}
          </List.Section>
        )}
      </QueryWrapper>
    </List>
  );
}
