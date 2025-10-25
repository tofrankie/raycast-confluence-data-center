import { COMMAND_NAME } from "@/constants";
import type { DropdownItemIcon } from "@/types";

export type SearchBarAccessoryCommandName =
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_SPACE
  | typeof COMMAND_NAME.JIRA_SEARCH_ISSUE;

export interface SearchBarAccessoryItem {
  value: string;
  title: string;
  icon: DropdownItemIcon;
  /** Query string - CQL in Confluence, JQL in Jira */
  query: string;
  autoQuery?: boolean;
  logicOperator?: "AND" | "OR" | "NOT";
  orderBy?: string;
  transform?: (processedQuery: string, context?: { userInput: string; filter: SearchFilter }) => string;
  sectionTitle?: string | ((params: { fetchedCount: number; totalCount: number }) => string);
}

export type SearchFilter = Pick<
  SearchBarAccessoryItem,
  "value" | "query" | "autoQuery" | "logicOperator" | "orderBy" | "transform" | "sectionTitle"
>;
