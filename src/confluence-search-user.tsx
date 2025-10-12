import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { APP_TYPE, AVATAR_TYPE, SEARCH_PAGE_SIZE } from "@/constants";
import { useConfluenceSearchUserInfiniteQuery, useAvatar } from "@/hooks";
import { avatarExtractors, clearAllCacheWithToast } from "@/utils";

export default function ConfluenceSearchUserProvider() {
  return (
    <QueryProvider>
      <ConfluenceSearchUser />
    </QueryProvider>
  );
}

function ConfluenceSearchUser() {
  const [searchText, setSearchText] = useState("");

  const cql = useMemo(() => {
    if (!searchText) return "";
    return `user.fullname ~ "${searchText}" AND type = user`;
  }, [searchText]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error, refetch } =
    useConfluenceSearchUserInfiniteQuery(cql);

  const results = useMemo(() => data?.items ?? [], [data?.items]);
  const hasMore = useMemo(() => data?.hasMore ?? false, [data?.hasMore]);

  useAvatar({
    items: results,
    appType: APP_TYPE.CONFLUENCE,
    avatarType: AVATAR_TYPE.CONFLUENCE_USER,
    extractAvatarData: avatarExtractors.confluenceUser,
  });

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

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = !isLoading && searchText.length >= 2 && !results.length;

  const searchTitle = `Results (${results.length}/${data?.totalCount})`;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search User..."
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
          description="Try adjusting your search filters"
        />
      ) : (
        <List.Section title={searchTitle}>
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
                    <Action.CopyToClipboard
                      title="Copy Link"
                      content={item.url}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    />
                    {!!item.userKey && <Action.CopyToClipboard title="Copy User Key" content={item.userKey} />}
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
    </List>
  );
}
