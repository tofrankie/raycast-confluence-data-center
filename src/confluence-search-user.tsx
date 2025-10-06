import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useState, useEffect, useMemo } from "react";
import QueryProvider from "./query-provider";
import { ConfluencePreferencesProvider, useConfluencePreferencesContext } from "./contexts";
import { useConfluenceSearchUser } from "./hooks";

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
      searchBarPlaceholder="Search Users..."
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
                  <Action.CopyToClipboard title="Copy User Key" content={user.userKey} />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
