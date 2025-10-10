import { COMMAND_NAMES } from "@/constants";
import type { DropdownItemIcon } from "@/types";

export type SearchBarAccessoryCommandName =
  | typeof COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT
  | typeof COMMAND_NAMES.CONFLUENCE_SEARCH_SPACE
  | typeof COMMAND_NAMES.JIRA_SEARCH_ISSUE;

export interface SearchBarAccessoryItem {
  id: string;
  title: string;
  /** Query string - CQL in Confluence, JQL in Jira */
  query: string;
  icon: DropdownItemIcon;
  transform?: (processedQuery: string, context?: { userInput: string; filter: SearchFilter }) => string;
  autoQuery?: boolean;
}

export type SearchFilter = Pick<SearchBarAccessoryItem, "id" | "query" | "transform" | "autoQuery">;
