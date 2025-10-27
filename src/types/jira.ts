import { JIRA_ISSUE_TYPE_NAME, JIRA_PRIORITY } from "@/constants";

import type { ValueOf } from "./common";

export type JiraPriorityType = ValueOf<typeof JIRA_PRIORITY>;

export type JiraIssueTypeName = ValueOf<typeof JIRA_ISSUE_TYPE_NAME>;

export interface JiraAvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

export interface JiraPreferences {
  jiraBaseUrl: string;
  jiraPersonalAccessToken: string;
  paginationSize: number;
}

export interface JiraSearchIssueResponse {
  expand: string;
  issues: JiraIssue[];
  maxResults: number;
  startAt: number;
  total: number;
  names?: Record<string, string>;
}

export interface JiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: JiraIssueFields;
}

export interface JiraIssueFields {
  summary: string;
  issuetype: JiraIssueType;
  duedate: string | null;
  created: string;
  reporter: JiraUser;
  assignee: JiraUser;
  priority: JiraPriority;
  updated: string | null;
  timetracking?: JiraTimeTracking;
  status: JiraStatus;
  // TODO:
  epic?: JiraEpic;
  [key: string]: unknown; // TODO: custom field
}

export interface JiraUser {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
  timeZone: string;
}

export interface JiraCurrentUser {
  self: string;
  key: string;
  name: string;
  emailAddress: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
  deleted: boolean;
  timeZone: string;
  locale: string;
  groups: {
    size: number;
    items: unknown[];
  };
  applicationRoles: {
    size: number;
    items: unknown[];
  };
  expand: string;
}

export interface JiraProject {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: JiraAvatarUrls;
  projectCategory?: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
}

export interface JiraTimeTracking {
  timeSpent: string;
  timeSpentSeconds: number;
  originalEstimate?: string;
  remainingEstimate?: string;
  originalEstimateSeconds?: number;
  remainingEstimateSeconds?: number;
}

export interface JiraStatus {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  /**
   * Issue Status ID
   */
  id: string;
  statusCategory: {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
  };
}

export interface JiraIssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
}

export interface JiraPriority {
  self: string;
  iconUrl: string;
  name: string;
  id: string;
}

export interface JiraEpic {
  id: number;
  key: string;
  self: string;
  name: string;
  summary: string;
  color: {
    key: string;
  };
  done: boolean;
}

export interface JiraField {
  id: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  schema?: {
    type: string;
    system?: string;
    custom?: string;
    customId?: number;
    items?: string;
  };
}

export interface JiraWorklog {
  billableSeconds: number;
  timeSpent: string;
  tempoWorklogId: number;
  timeSpentSeconds: number;
  issue: {
    epicKey: string;
    epicIssue: {
      issueType: string;
      iconUrl: string;
      summary: string;
      estimatedRemainingSeconds?: number;
    };
    reporterKey: string;
    issueStatus: string;
    internalIssue: boolean;
    issueType: string;
    projectId: number;
    projectKey: string;
    iconUrl: string;
    summary: string;
    components: unknown[];
    versions: unknown[];
    key: string;
    id: number;
  };
  comment: string;
  location: {
    name: string;
    id: number;
  };
  attributes: Record<string, unknown>;
  worker?: string;
  updater: string;
  started: string;
  originTaskId: number;
  dateCreated: string;
  dateUpdated: string;
  originId: number;
}

export interface JiraTransition {
  /**
   * Transition ID
   */
  id: string;
  name: string;
  to: JiraStatus;
}

export interface JiraTransitionResponse {
  expand: string;
  transitions: JiraTransition[];
}

export interface JiraIssueTransitionRequest {
  transition: {
    id: string;
  };
}

export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: "scrum" | "kanban";
}

export interface JiraBoardResponse {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraBoard[];
}

export interface JiraSprint {
  id: number;
  self: string;
  state: "future" | "active" | "closed";
  name: string;
  startDate: string;
  endDate: string;
  activatedDate: string;
  originBoardId: number;
  goal: string;
}

export interface JiraSprintResponse {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: JiraSprint[];
}

export interface JiraBoardConfiguration {
  id: number;
  name: string;
  type: "scrum" | "kanban";
  self: string;
  filter: {
    id: string;
    self: string;
  };
  columnConfig: {
    columns: JiraBoardColumn[];
    constraintType: string;
  };
  estimation: {
    type: string;
    field: {
      fieldId: string;
      displayName: string;
    };
  };
  ranking: {
    rankCustomFieldId: number;
  };
}

export interface JiraBoardColumn {
  name: string;
  statuses: {
    id: string;
    self: string;
  }[];
}

export interface JiraBoardIssueResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}
