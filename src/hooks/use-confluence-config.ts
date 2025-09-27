import { getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import { getBaseUrl } from "../utils";
import type { ConfluenceConfig } from "../types";

export const useConfluenceConfig = (): ConfluenceConfig | null => {
  return useMemo(() => {
    const preferences = getPreferenceValues<Preferences.SearchConfluence>();

    return {
      domain: preferences.confluenceDomain,
      token: preferences.confluencePersonalAccessToken,
      baseUrl: getBaseUrl(preferences.confluenceDomain),
      cacheAvatar: preferences.cacheConfluenceUserAvatar,
    };
  }, []);
};
