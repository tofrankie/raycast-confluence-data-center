import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { APP_TYPE, AVATAR_TYPE } from "@/constants";
import { useConfluenceSearchUserInfiniteQuery, useAvatar } from "@/hooks";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "@/contexts";
import { avatarExtractors } from "@/utils";

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
  const { searchPageSize, confluenceBaseUrl } = useConfluencePreferencesContext();

  const cql = useMemo(() => {
    if (!searchText) return "";
    return `user.fullname ~ "${searchText}"`;
  }, [searchText]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, error } = useConfluenceSearchUserInfiniteQuery(
    cql,
    searchPageSize,
    confluenceBaseUrl,
  );

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

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = !isLoading && searchText.length >= 2 && !results.length;

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
              key={user.renderKey}
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
