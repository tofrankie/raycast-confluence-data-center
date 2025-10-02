import { ActionPanel, Action, Icon, List, Image } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useState, useEffect, useMemo } from "react";
import { QueryProvider } from "./query-client";
import { useAvatar, useConfluenceSearchWithFilters, useConfluenceUrls, useToggleFavorite } from "./hooks";
import {
  getContentIcon,
  writeToSupportPathFile,
  buildSearchQuery,
  processSpecialFilters,
  optimizeCQLQuery,
} from "./utils";
import { AVATAR_TYPES, CONFLUENCE_CONTENT_TYPE } from "./constants";
import { SearchFilters } from "./components/search-filters";
import { CQLWrapper } from "./components/cql-wrapper";
import { useSearchFilters } from "./hooks/use-search-filters";
import type { ConfluenceContentType } from "./types";

function SearchContent() {
  const [searchText, setSearchText] = useState("");
  const { filters, setFilters } = useSearchFilters();
  const { getContentUrl, getAuthorAvatarUrl, getContentEditUrl } = useConfluenceUrls();
  const toggleFavorite = useToggleFavorite();

  const { data: results = [], isLoading, error, isError } = useConfluenceSearchWithFilters(searchText, filters, 20);

  // 生成当前的 CQL 查询
  const currentCQL = useMemo(() => {
    if (!searchText || searchText.length < 2) {
      return "";
    }

    let cqlQuery = buildSearchQuery(searchText, filters);
    cqlQuery = processSpecialFilters(cqlQuery, filters);
    cqlQuery = optimizeCQLQuery(cqlQuery);

    return cqlQuery;
  }, [searchText, filters]);

  const avatarList = useMemo(() => {
    return results
      .map((item) => ({
        url: getAuthorAvatarUrl(item.history.createdBy.profilePicture.path) || "",
        filename: item.history.createdBy.userKey,
      }))
      .filter((avatar) => avatar.url);
  }, [results]);

  const avatarDir = useAvatar(avatarList, AVATAR_TYPES.CONFLUENCE);

  useEffect(() => {
    if (isError && error) {
      showFailureToast(error, { title: "Search Failed" });
    }
  }, [isError, error]);

  useEffect(() => {
    if (toggleFavorite.isError && toggleFavorite.error) {
      showFailureToast(toggleFavorite.error, { title: "Failed to Update Favorite Status" });
    }
  }, [toggleFavorite.isError, toggleFavorite.error]);

  // TODO:
  useEffect(() => {
    if (results.length > 0) {
      writeToSupportPathFile(JSON.stringify(results[0], null, 2), "temp.json");
    }
  }, [results]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Content..."
      searchBarAccessory={<SearchFilters filters={filters} onFiltersChange={setFilters} />}
      throttle
    >
      <CQLWrapper query={searchText}>
        {results.length === 0 && !isLoading && searchText.length >= 2 ? (
          <List.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No results"
            description="Try adjusting your search filters or check your CQL syntax"
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  icon={Icon.Globe}
                  title="Open CQL Documentation"
                  url="https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql"
                />
                {currentCQL && (
                  <Action.CopyToClipboard
                    title="Copy CQL Query"
                    content={currentCQL}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                )}
              </ActionPanel>
            }
          />
        ) : (
          results.map((item) => {
            const icon = getContentIcon(item.type as ConfluenceContentType);
            const contentUrl = getContentUrl(item) || "";
            const editUrl = getContentEditUrl(item) || "";
            const creator = item.history.createdBy.displayName;
            const updater = item.history.lastUpdated.by.displayName;
            const updatedAt = new Date(item.history.lastUpdated.when);
            const createdAt = new Date(item.history.createdDate);

            const isSingleVersion = item.history.lastUpdated?.when === item.history.createdDate;
            const isFavourited = item.metadata.currentuser.favourited?.isFavourite ?? false;
            const favouritedAt = item.metadata.currentuser.favourited?.favouritedDate
              ? new Date(item.metadata.currentuser.favourited.favouritedDate).toISOString()
              : null;

            const creatorAvatar = avatarDir
              ? `${avatarDir}/${item.history.createdBy.userKey}.png`
              : getAuthorAvatarUrl(item.history.createdBy.profilePicture.path);

            const accessories = [
              ...(isFavourited
                ? [
                    {
                      icon: Icon.Star,
                      tooltip: `Favourited at ${favouritedAt ? new Date(favouritedAt).toLocaleString() : ""}`,
                    },
                  ]
                : []),
              {
                date: updatedAt,
                tooltip: isSingleVersion
                  ? `Created at ${createdAt.toLocaleString()} by ${creator}`
                  : `Created at ${createdAt.toLocaleString()} by ${creator}\nUpdated at ${updatedAt.toLocaleString()} by ${updater}`,
              },
              ...(creatorAvatar
                ? [
                    {
                      icon: { source: creatorAvatar, mask: Image.Mask.Circle },
                      tooltip: `Created by ${creator}`,
                    },
                  ]
                : []),
            ];

            return (
              <List.Item
                key={item.id}
                icon={icon}
                title={item.title}
                subtitle={{ value: item.space.name, tooltip: `Space: ${item.space.name}` }}
                accessories={accessories}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open in Browser" url={contentUrl} />
                    <Action.CopyToClipboard title="Copy Link" content={contentUrl} />
                    {item.type !== CONFLUENCE_CONTENT_TYPE.ATTACHMENT && (
                      <Action.OpenInBrowser icon={Icon.Pencil} title="Edit in Browser" url={editUrl} />
                    )}
                    {currentCQL && (
                      <Action.CopyToClipboard
                        icon={Icon.Code}
                        title="Copy CQL Query"
                        content={currentCQL}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      />
                    )}
                    <Action
                      icon={isFavourited ? Icon.StarDisabled : Icon.Star}
                      title={isFavourited ? "Remove from Favorites" : "Add to Favorites"}
                      onAction={() => toggleFavorite.mutate({ contentId: item.id, isFavorited: isFavourited })}
                      shortcut={{ modifiers: ["cmd"], key: "f" }}
                    />
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

export default function SearchConfluence() {
  return (
    <QueryProvider>
      <SearchContent />
    </QueryProvider>
  );
}
