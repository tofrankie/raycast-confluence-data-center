import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { getPreferenceValues } from "@raycast/api";

import { formatSearchPageSize } from "@/utils";
import { DEFAULT_SEARCH_PAGE_SIZE } from "@/constants";
import type { ConfluencePreferences } from "@/types";

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
  confluenceBaseUrl: "",
  confluencePersonalAccessToken: "",
  searchPageSize: DEFAULT_SEARCH_PAGE_SIZE,
};

export function useConfluencePreferencesContext() {
  const context = useContext(ConfluencePreferencesContext);
  return context?.preferences ?? defaultPreferences;
}

function initPreferences() {
  const rawPreferences = getPreferenceValues<Preferences>();
  const searchPageSize = formatSearchPageSize(rawPreferences.searchPageSize);

  return {
    ...rawPreferences,
    searchPageSize: searchPageSize || DEFAULT_SEARCH_PAGE_SIZE,
  };
}
