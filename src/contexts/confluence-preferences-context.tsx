import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { getPreferenceValues } from "@raycast/api";
import { getBaseUrl } from "../utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { ConfluencePreferences } from "../types";

interface ConfluencePreferencesContextType {
  preferences: ConfluencePreferences;
}

const ConfluencePreferencesContext = createContext<ConfluencePreferencesContextType | null>(null);

interface ConfluencePreferencesProviderProps {
  children: ReactNode;
}

export function ConfluencePreferencesProvider({ children }: ConfluencePreferencesProviderProps) {
  const [preferences] = useState<ConfluencePreferences>(initPreferences);
  const contextValue = useMemo(() => ({ preferences }), [preferences]);

  return <ConfluencePreferencesContext.Provider value={contextValue}>{children}</ConfluencePreferencesContext.Provider>;
}

const defaultPreferences: ConfluencePreferences = {
  confluenceDomain: "",
  confluencePersonalAccessToken: "",
  confluenceCacheUserAvatar: false,
  confluenceDisplayRecentlyViewed: true,
  searchPageSize: DEFAULT_SEARCH_PAGE_SIZE,
  domain: "",
  token: "",
  baseUrl: "",
  cacheAvatar: false,
  displayRecentlyViewed: true,
};

export function useConfluencePreferencesContext() {
  const context = useContext(ConfluencePreferencesContext);
  return context?.preferences ?? defaultPreferences;
}

function initPreferences() {
  const rawPreferences = getPreferenceValues<Preferences.ConfluenceSearchContent>();

  return {
    // raw
    ...rawPreferences,

    // alias
    domain: rawPreferences.confluenceDomain,
    token: rawPreferences.confluencePersonalAccessToken,
    cacheAvatar: rawPreferences.confluenceCacheUserAvatar,
    searchPageSize: parseInt(rawPreferences.searchPageSize) || DEFAULT_SEARCH_PAGE_SIZE,
    displayRecentlyViewed: rawPreferences.confluenceDisplayRecentlyViewed,

    // computed
    baseUrl: getBaseUrl(rawPreferences.confluenceDomain),
  };
}
