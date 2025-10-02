import { getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import { getBaseUrl } from "../utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { ConfluenceConfig } from "../types";

export const useConfluenceConfig = (): ConfluenceConfig => {
  return useMemo(() => {
    const preferences = getPreferenceValues<Preferences.ConfluenceSearchContent>();

    return {
      domain: preferences.confluenceDomain,
      token: preferences.confluencePersonalAccessToken,
      baseUrl: getBaseUrl(preferences.confluenceDomain),
      cacheAvatar: preferences.cacheConfluenceUserAvatar,
      searchPageSize: parseInt(preferences.searchPageSize) || DEFAULT_SEARCH_PAGE_SIZE,
    };
  }, []);
};
