import { COMMAND_NAME } from "@/constants";
import type { DropdownItemIcon } from "@/types";

export type SearchBarAccessoryCommandName =
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_SPACE
  | typeof COMMAND_NAME.JIRA_SEARCH_ISSUE;

export interface SearchBarAccessoryItem {
  id: string;
  title: string;
  /** Query string - CQL in Confluence, JQL in Jira */
  query: string;
  icon: DropdownItemIcon;
  autoQuery?: boolean;
  transform?: (processedQuery: string, context?: { userInput: string; filter: SearchFilter }) => string;
  sectionTitle?: string | ((params: { fetchedCount: number; totalCount: number }) => string);
}

export type SearchFilter = Pick<SearchBarAccessoryItem, "id" | "query" | "transform" | "autoQuery" | "sectionTitle">;
