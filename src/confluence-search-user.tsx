import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import QueryProvider from "./query-provider";
import { AVATAR_TYPES } from "./constants";
import { useConfluenceSearchUser, useAvatar } from "./hooks";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "./contexts";
import { AvatarList } from "./types";

export default function ConfluenceSearchUserProvider() {
  return (
    <ConfluencePreferencesProvider>
      <QueryProvider>
        <ConfluenceSearchUser />
      </QueryProvider>
    </ConfluencePreferencesProvider>
  );
}

function ConfluenceSearchUser() {
  const [searchText, setSearchText] = useState("");
  const { searchPageSize, baseUrl } = useConfluencePreferencesContext();

  const cql = useMemo(() => {
    if (!searchText) return "";
    return `user.fullname ~ "${searchText}"`;
  }, [searchText]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error } = useConfluenceSearchUser(
    cql,
    searchPageSize,
    baseUrl,
  );

  const results = useMemo(() => data?.items ?? [], [data?.items]);
  const hasMore = useMemo(() => data?.hasMore ?? false, [data?.hasMore]);

  const avatarList = useMemo(() => {
    return results
      .filter((item) => !!(item.avatarCacheKey && item.avatarUrl))
      .map((item) => ({
        url: item.avatarUrl,
        key: item.avatarCacheKey,
      })) as AvatarList;
  }, [results]);

  useAvatar(avatarList, AVATAR_TYPES.CONFLUENCE);

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

  const isEmpty = !isLoading && searchText.length >= 2 && results.length === 0;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search User..."
      pagination={{
        onLoadMore: handleLoadMore,
        hasMore,
        pageSize: searchPageSize,
      }}
    >
      {isEmpty ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Results"
          description="Try adjusting your search filters"
        />
      ) : (
        results.map((user) => {
          return (
            <List.Item
              key={user.userKey}
              icon={user.icon}
              title={user.title}
              subtitle={user.subtitle}
              accessories={user.accessories}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open in Browser" url={user.url} />
                  <Action.CopyToClipboard
                    title="Copy Link"
                    content={user.url}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                  {!!user.userKey && <Action.CopyToClipboard title="Copy User Key" content={user.userKey} />}
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
