import type { List } from "@raycast/api";
import {
  CONFLUENCE_ENTITY_TYPE,
  APP_TYPE,
  CONFLUENCE_CONTENT_TYPE,
  CONFLUENCE_SPACE_TYPE,
  JIRA_PRIORITY,
  JIRA_ISSUE_TYPE_NAME,
} from "../constants";

export type AppType = (typeof APP_TYPE)[keyof typeof APP_TYPE];

export type ConfluenceEntityType = (typeof CONFLUENCE_ENTITY_TYPE)[keyof typeof CONFLUENCE_ENTITY_TYPE];

export type ConfluenceContentType = (typeof CONFLUENCE_CONTENT_TYPE)[keyof typeof CONFLUENCE_CONTENT_TYPE];

export type ConfluenceSpaceType = (typeof CONFLUENCE_SPACE_TYPE)[keyof typeof CONFLUENCE_SPACE_TYPE];

export type IconType = ConfluenceEntityType | ConfluenceContentType;

export type LabelType = ConfluenceEntityType | ConfluenceContentType;

export type SpaceType = ConfluenceSpaceType;

export type JiraPriorityType = (typeof JIRA_PRIORITY)[keyof typeof JIRA_PRIORITY];

export type JiraIssueTypeName = (typeof JIRA_ISSUE_TYPE_NAME)[keyof typeof JIRA_ISSUE_TYPE_NAME];

export interface Icon {
  path: string;
  width: number;
  height: number;
  isDefault: boolean;
}

export interface AvatarItem {
  key: string;
  url: string;
}

export type AvatarList = AvatarItem[];

export interface SearchFilter {
  id: string;
  label: string;
  cql: string;
  icon?: List.Dropdown.Item.Props["icon"];
  transform?: (processedCql: string, context?: { userInput: string; filter: SearchFilter }) => string;
  autoQuery?: boolean;
}

export interface CQLQuery {
  raw: string;
  isCQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}
