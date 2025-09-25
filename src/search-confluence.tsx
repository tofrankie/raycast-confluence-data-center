import { ActionPanel, Action, Icon, List, showToast, Toast, getPreferenceValues, Image } from "@raycast/api";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConfluenceAPI } from "./confluence-api";
import { QueryProvider } from "./query-client";

interface Preferences {
  confluenceDomain: string;
  personalAccessToken: string;
}

interface ConfluenceSearchResult {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    id: string;
    key: string;
    name: string;
    type: string;
  };
  version: {
    when: string;
    friendlyWhen: string;
    by: {
      type: string;
      username: string;
      userKey: string;
      profilePicture: {
        path: string;
        width: number;
        height: number;
        isDefault: boolean;
      };
      displayName: string;
      _links: {
        base: string;
        context: string;
      };
    };
  };
  body: {
    storage?: {
      value: string;
      representation: string;
    };
    view?: {
      value: string;
      representation: string;
    };
  };
  _links: {
    webui: string;
    edit: string;
    tinyui: string;
    self: string;
  };
}

function SearchContent() {
  const [searchText, setSearchText] = useState("");
  const preferences = getPreferenceValues<Preferences>();

  const {
    data: results = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["confluence-search", searchText, preferences.confluenceDomain],
    queryFn: async () => {
      if (!preferences.confluenceDomain || !preferences.personalAccessToken) {
        throw new Error("Please configure your Confluence domain and Personal Access Token in preferences");
      }

      if (searchText.length < 2) {
        return [];
      }

      const api = new ConfluenceAPI();
      return await api.searchContent(searchText, 20);
    },
    enabled: searchText.length >= 2 && !!preferences.confluenceDomain && !!preferences.personalAccessToken,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Show error toast when there's an error
  if (isError && error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to search Confluence";
    showToast({
      style: Toast.Style.Failure,
      title: "Search Failed",
      message: errorMessage,
    });
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "page":
        return { source: "icon-page.svg", tintColor: "#57B6D5" };
      case "blogpost":
        return Icon.Document;
      case "comment":
        return Icon.Message;
      default:
        return Icon.Document;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "page":
        return "Page";
      case "blogpost":
        return "Blog Post";
      case "comment":
        return "Comment";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getContentPreview = (body: ConfluenceSearchResult["body"]) => {
    if (!body) return "";

    const content = body.storage?.value || body.view?.value || "";
    // Remove HTML tags and get first 100 characters
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    return textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;
  };

  // Show configuration error if preferences are missing
  if (!preferences.confluenceDomain || !preferences.personalAccessToken) {
    return (
      <List>
        <List.Item
          icon={Icon.ExclamationMark}
          title="Configuration Required"
          subtitle="Please configure your Confluence domain and Personal Access Token in preferences"
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Raycast Preferences" url="raycast://preferences" />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Confluence documents..."
      throttle
    >
      {results.length === 0 && !isLoading && searchText.length >= 2 ? (
        <List.Item icon={Icon.MagnifyingGlass} title="No results found" subtitle="Try different search terms" />
      ) : (
        results.map((item) => {
          const instance = new ConfluenceAPI();
          const webUrl = instance.getContentUrl(item.id);
          const baseUrl = instance.getBaseUrl();
          const authorAvatar = `${baseUrl}${item.version.by.profilePicture.path}`;
          const authorName = item.version.by.displayName;
          const icon = getContentIcon(item.type);

          return (
            <List.Item
              key={item.id}
              icon={icon}
              title={item.title}
              subtitle={item.space.name}
              accessories={[
                {
                  icon: { source: authorAvatar, mask: Image.Mask.Circle },
                  tooltip: authorName,
                },
                { text: getContentTypeLabel(item.type) },
                { text: formatDate(item.version.when) },
              ]}
              detail={
                <List.Item.Detail
                  markdown={`# ${item.title}

**Space:** ${item.space.name}
**Type:** ${getContentTypeLabel(item.type)}
**Last Modified:** ${formatDate(item.version.when)} by ${item.version.by.displayName}

## Content Preview
${getContentPreview(item.body)}`}
                />
              }
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open in Browser" url={webUrl} />
                  <Action.CopyToClipboard title="Copy URL" content={webUrl} />
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
