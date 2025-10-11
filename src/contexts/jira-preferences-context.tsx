import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { getPreferenceValues } from "@raycast/api";

import { formatSearchPageSize } from "@/utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "@/constants";
import type { JiraPreferences } from "@/types";

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
  jiraBaseUrl: "",
  jiraPersonalAccessToken: "",
  searchPageSize: DEFAULT_SEARCH_PAGE_SIZE,
};

export function useJiraPreferencesContext() {
  const context = useContext(JiraPreferencesContext);
  return context?.preferences ?? defaultPreferences;
}

function initPreferences() {
  const rawPreferences = getPreferenceValues<Preferences.JiraSearchIssue>();
  const searchPageSize = formatSearchPageSize(rawPreferences.searchPageSize);

  return {
    ...rawPreferences,
    searchPageSize: searchPageSize || DEFAULT_SEARCH_PAGE_SIZE,
  };
}
