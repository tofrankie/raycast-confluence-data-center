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
        url: getAuthorAvatarUrl(item.version.by.profilePicture.path) || "",
        filename: item.version.by.userKey,
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
          const webUrl = getContentUrl(item.id) || "";
          const authorName = item.version.by.displayName;
          const icon = getContentIcon(item.type as ConfluenceContentType);
          const lastModifiedDate = new Date(item.version.when);

          const authorAvatar = avatarDir
            ? `${avatarDir}/${item.version.by.userKey}.png`
            : getAuthorAvatarUrl(item.version.by.profilePicture.path);

          const accessories = [
            {
              date: lastModifiedDate,
              tooltip: `Last modified: ${lastModifiedDate.toLocaleString()}`,
            },
            ...(authorAvatar
              ? [
                  {
                    icon: { source: authorAvatar, mask: Image.Mask.Circle },
                    tooltip: `Last updated by: ${authorName}`,
                  },
                ]
              : []),
          ];

          return (
            <List.Item
              key={item.id}
              icon={icon}
              title={item.title}
              subtitle={item.space.name}
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
