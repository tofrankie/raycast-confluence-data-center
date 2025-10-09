import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import QueryProvider from "./query-provider";
import { APP_TYPE } from "./constants";
import { ConfluenceSearchSpaceFilter, CQLWrapper } from "./components";
import { buildCQL } from "./utils";
import { useConfluenceSearchSpaceInfiniteQuery, useAvatar } from "./hooks";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "./contexts";
import type { AvatarList, SearchFilter as SearchFilterType } from "./types";

export default function ConfluenceSearchSpaceProvider() {
  return (
    <ConfluencePreferencesProvider>
      <QueryProvider>
        <ConfluenceSearchSpace />
      </QueryProvider>
    </ConfluencePreferencesProvider>
  );
}

function ConfluenceSearchSpace() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilterType | null>(null);
  const { searchPageSize, confluenceBaseUrl } = useConfluencePreferencesContext();

  const cql = useMemo(() => {
    if (!searchText) return "";
    const extraFilter = {
      id: "type",
      label: "Space",
      cql: `type = space`,
      // transform: (processedCql: string) => processedCql.replace("text ~ ", "space.title ~ "),
    };
    return buildCQL(searchText, filter ? [filter, extraFilter] : []);
  }, [searchText, filter]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error } = useConfluenceSearchSpaceInfiniteQuery(
    cql,
    searchPageSize,
    confluenceBaseUrl,
  );

  const results = useMemo(() => data?.items ?? [], [data?.items]);
  const hasMore = useMemo(() => data?.hasMore ?? false, [data?.hasMore]);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Search Failed" });
    }
  }, [error]);

  const avatarList = useMemo(() => {
    return results
      .filter((item) => !!(item.avatarCacheKey && item.avatarUrl))
      .map((item) => ({
        url: item.avatarUrl,
        key: item.avatarCacheKey,
      })) as AvatarList;
  }, [results]);

  useAvatar(avatarList, APP_TYPE.CONFLUENCE);

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = !isLoading && searchText.length >= 2 && results.length === 0;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Space..."
      searchBarAccessory={<ConfluenceSearchSpaceFilter value={filter?.id || ""} onChange={setFilter} />}
      pagination={{
        onLoadMore: handleLoadMore,
        hasMore,
        pageSize: searchPageSize,
      }}
    >
      <CQLWrapper query={searchText}>
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
          results.map((space) => {
            return (
              <List.Item
                key={space.key}
                icon={space.icon}
                title={space.name}
                subtitle={space.subtitle}
                accessories={space.accessories}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open in Browser" url={space.url} />
                    <Action.CopyToClipboard
                      title="Copy Link"
                      content={space.url}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    />
                    <Action.CopyToClipboard title="Copy Space Key" content={space.spaceKey} />
                    {cql && <Action.CopyToClipboard title="Copy CQL" content={cql} />}
                  </ActionPanel>
                }
              />
            );
          })
        )}
      </CQLWrapper>
    </List>
  );
}
