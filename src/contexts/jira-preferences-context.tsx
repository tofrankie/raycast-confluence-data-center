import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { getPreferenceValues } from "@raycast/api";
import { getBaseUrl } from "../utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { JiraPreferences } from "../types";

interface JiraPreferencesContextType {
  preferences: JiraPreferences;
}

const JiraPreferencesContext = createContext<JiraPreferencesContextType | null>(null);

interface JiraPreferencesProviderProps {
  children: ReactNode;
}

export function JiraPreferencesProvider({ children }: JiraPreferencesProviderProps) {
  const [preferences] = useState<JiraPreferences>(initPreferences);
  const contextValue = useMemo(() => ({ preferences }), [preferences]);

  return <JiraPreferencesContext.Provider value={contextValue}>{children}</JiraPreferencesContext.Provider>;
}

const defaultPreferences: JiraPreferences = {
  jiraDomain: "",
  jiraPersonalAccessToken: "",
  jiraCacheUserAvatar: false,
  searchPageSize: DEFAULT_SEARCH_PAGE_SIZE,
  domain: "",
  token: "",
  baseUrl: "",
  cacheAvatar: false,
};

export function useJiraPreferencesContext() {
  const context = useContext(JiraPreferencesContext);
  return context?.preferences ?? defaultPreferences;
}

function initPreferences() {
  const rawPreferences = getPreferenceValues<Preferences.JiraSearchIssue>();

  return {
    // raw
    ...rawPreferences,

    // alias
    domain: rawPreferences.jiraDomain,
    token: rawPreferences.jiraPersonalAccessToken,
    cacheAvatar: rawPreferences.jiraCacheUserAvatar,
    searchPageSize: parseInt(rawPreferences.searchPageSize) || DEFAULT_SEARCH_PAGE_SIZE,

    // computed
    baseUrl: getBaseUrl(rawPreferences.jiraDomain),
  };
}
