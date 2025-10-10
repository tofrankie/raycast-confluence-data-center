import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { buildCQL } from "@/utils";
import { APP_TYPE, AVATAR_TYPE, COMMAND_NAMES } from "@/constants";
import { SearchBarAccessory, CQLWrapper } from "@/components";
import { useConfluenceSearchContentInfiniteQuery, useToggleFavorite, useAvatar } from "@/hooks";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "@/contexts";
import { avatarExtractors } from "@/utils";
import type { SearchFilter } from "@/types";

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
  const [filter, setFilter] = useState<SearchFilter | null>(null);
  const { searchPageSize, confluenceBaseUrl } = useConfluencePreferencesContext();

  const cql = useMemo(() => {
    if (!searchText && !filter) {
      return `id in recentlyViewedContent(${searchPageSize}, 0)`;
    }
    if (!searchText && filter?.autoQuery) {
      return filter.query;
    }
    if (!searchText || searchText.length < 2) {
      return "";
    }
    return buildCQL(searchText, filter ? [filter] : []);
  }, [searchText, filter, searchPageSize]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error } = useConfluenceSearchContentInfiniteQuery(
    cql,
    searchPageSize,
    confluenceBaseUrl,
  );

  const results = useMemo(() => data?.items ?? [], [data?.items]);

  const hasMore = data?.hasMore ?? false;

  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (contentId: string, isFavorited: boolean) => {
    toggleFavorite.mutate({ contentId, isFavorited });
  };

  useEffect(() => {
    if (toggleFavorite.error) {
      showFailureToast(toggleFavorite.error, { title: "Failed to Update Favorite Status" });
    }
  }, [toggleFavorite.error]);

  useAvatar({
    items: results,
    appType: APP_TYPE.CONFLUENCE,
    avatarType: AVATAR_TYPE.CONFLUENCE_USER,
    extractAvatarData: avatarExtractors.confluenceContentCreator,
  });

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Search Failed" });
    }
  }, [error]);

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = !isLoading && searchText.length >= 2 && !results.length;

  const sectionTitle = !searchText && !filter && results.length ? `Recently Viewed (${results.length})` : undefined;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Content..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT}
          value={filter?.id || ""}
          onChange={setFilter}
        />
      }
      pagination={{
        hasMore,
        onLoadMore: handleLoadMore,
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
          <List.Section title={sectionTitle}>
            {results.map((item) => {
              return (
                <List.Item
                  key={item.renderKey}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
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
            })}
          </List.Section>
        )}
      </CQLWrapper>
    </List>
  );
}
