import { ActionPanel, Action, Icon, List, Image } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useState, useEffect, useMemo } from "react";
import { QueryProvider } from "./query-client";
import { useAvatar, useConfluenceSearch, useConfluenceUrls } from "./hooks";
import { getContentIcon, writeToSupportPathFile } from "./utils";
import { AVATAR_TYPES } from "./constants";
import type { ConfluenceContentType } from "./types";

function SearchContent() {
  const [searchText, setSearchText] = useState("");
  const { getContentUrl, getAuthorAvatarUrl } = useConfluenceUrls();

  const { data: results = [], isLoading, error, isError } = useConfluenceSearch(searchText, 20);

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
      showFailureToast(error, { title: "Search failed" });
    }
  }, [isError, error]);

  // TODO:
  useEffect(() => {
    if (results.length > 0) {
      writeToSupportPathFile(JSON.stringify(results[0], null, 2), "temp.json");
    }
  }, [results]);

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search Confluence..." throttle>
      {results.length === 0 && !isLoading && searchText.length >= 2 ? (
        <List.Item icon={Icon.MagnifyingGlass} title="No results found" subtitle="Try different keywords" />
      ) : (
        results.map((item) => {
          const icon = getContentIcon(item.type as ConfluenceContentType);
          const webUrl = getContentUrl(item.id) || "";
          const creator = item.history.createdBy.displayName;
          const updater = item.history.lastUpdated?.by.displayName || creator;
          const updatedAt = new Date(item.history.lastUpdated?.when || item.history.createdDate);
          const createdAt = new Date(item.history.createdDate);

          const creatorAvatar = avatarDir
            ? `${avatarDir}/${item.history.createdBy.userKey}.png`
            : getAuthorAvatarUrl(item.history.createdBy.profilePicture.path);

          const accessories = [
            {
              date: updatedAt,
              tooltip: `Created at: ${createdAt.toLocaleString()} by ${creator}\nUpdated at: ${updatedAt.toLocaleString()} by ${updater}`,
            },
            ...(creatorAvatar
              ? [
                  {
                    icon: { source: creatorAvatar, mask: Image.Mask.Circle },
                    tooltip: `Created by: ${creator}`,
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
                  <Action.OpenInBrowser title="Open in Browser" url={webUrl} />
                  <Action.CopyToClipboard title="Copy Link" content={webUrl} />
                  <Action.CopyToClipboard title="Copy Title" content={item.title} />
                </ActionPanel>
              }
            />
          );
        })
      )}
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
