import { getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import { getBaseUrl } from "../utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { ConfluenceConfig } from "../types";

export const useConfluencePreferences = (): ConfluenceConfig => {
  return useMemo(() => {
    const preferences = getPreferenceValues<Preferences.ConfluenceSearchContent>();

    return {
      domain: preferences.confluenceDomain,
      token: preferences.confluencePersonalAccessToken,
      baseUrl: getBaseUrl(preferences.confluenceDomain),
      cacheAvatar: preferences.confluenceCacheUserAvatar,
      searchPageSize: parseInt(preferences.searchPageSize) || DEFAULT_SEARCH_PAGE_SIZE,
      displayRecentlyViewed: preferences.confluenceDisplayRecentlyViewed,
    };
  }, []);
};
