import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useState, useEffect, useMemo } from "react";
import QueryProvider from "./query-provider";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "./contexts";
import { useSearchFilters, useConfluenceSearchContent, useToggleFavorite, useAvatar } from "./hooks";
import { writeToSupportPathFile, buildCQL } from "./utils";
import { SearchFilters, CQLWrapper } from "./components";
import { AVATAR_TYPES } from "./constants";

export default function ConfluenceSearchContentProvider() {
  return (
    <ConfluencePreferencesProvider>
      <QueryProvider>
        <ConfluenceSearchContent />
      </QueryProvider>
    </ConfluencePreferencesProvider>
  );
}

function ConfluenceSearchContent() {
  const [searchText, setSearchText] = useState("");
  const { filters, setFilters } = useSearchFilters();
  const { searchPageSize, displayRecentlyViewed, baseUrl } = useConfluencePreferencesContext();

  const cql = useMemo(() => {
    if (!searchText && displayRecentlyViewed) {
      return `id in recentlyViewedContent(${searchPageSize}, 0)`;
    }
    if (!searchText || searchText.length < 2) {
      return "";
    }
    return buildCQL(searchText, filters);
  }, [searchText, filters, displayRecentlyViewed, searchPageSize]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error } = useConfluenceSearchContent(
    cql,
    searchPageSize,
    baseUrl,
  );

  const results = useMemo(() => data?.items ?? [], [data?.items]);

  const hasMore = useMemo(() => {
    // 对于最近查看的内容，不进行分页
    if (!searchText && displayRecentlyViewed) {
      return false;
    }
    return data?.hasMore ?? false;
  }, [data?.hasMore, searchText, displayRecentlyViewed]);

  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (contentId: string, isFavorited: boolean) => {
    toggleFavorite.mutate({ contentId, isFavorited });
  };

  useEffect(() => {
    if (toggleFavorite.error) {
      showFailureToast(toggleFavorite.error, { title: "Failed to Update Favorite Status" });
    }
  }, [toggleFavorite.error]);

  const avatarList = useMemo(() => {
    const userMap = new Map<string, { url: string; filename: string }>();

    results.forEach((item) => {
      const userKey = item.history.createdBy.userKey;
      if (userMap.has(userKey)) return;

      const avatarUrl = item.creatorAvatar;
      if (!avatarUrl) return;
      userMap.set(userKey, {
        url: avatarUrl,
        filename: userKey,
      });
    });

    return [...userMap.values()];
  }, [results]);

  useAvatar(avatarList, AVATAR_TYPES.CONFLUENCE);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Search Failed" });
    }
  }, [error]);

  // TODO: 调试
  useEffect(() => {
    if (results.length > 0) {
      writeToSupportPathFile(JSON.stringify(results[0], null, 2), "temp.json");
    }
  }, [results]);

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
      searchBarPlaceholder="Search Content..."
      searchBarAccessory={<SearchFilters filters={filters} onFiltersChange={setFilters} />}
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
          results.map((item) => {
            return (
              <List.Item
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={{ value: item.spaceName, tooltip: `Space: ${item.spaceName}` }}
                accessories={item.accessories}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                    {item.canEdit && (
                      <Action.OpenInBrowser icon={Icon.Pencil} title="Edit in Browser" url={item.editUrl} />
                    )}
                    <Action.CopyToClipboard
                      title="Copy Link"
                      content={item.url}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    />
                    {item.canFavorite && (
                      <Action
                        icon={item.isFavourited ? Icon.StarDisabled : Icon.Star}
                        title={item.isFavourited ? "Remove from Favorites" : "Add to Favorites"}
                        onAction={() => handleToggleFavorite(item.id, item.isFavourited)}
                        shortcut={{ modifiers: ["cmd"], key: "f" }}
                      />
                    )}
                    {item.spaceUrl && (
                      <Action.OpenInBrowser
                        icon={Icon.House}
                        title={`Open Space Homepage${item.spaceName ? ` (${item.spaceName})` : ""}`}
                        url={item.spaceUrl}
                      />
                    )}
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
