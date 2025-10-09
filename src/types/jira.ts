export interface JiraPreferences {
  jiraBaseUrl: string;
  jiraPersonalAccessToken: string;
  searchPageSize: number;
}

export interface JiraSearchIssueResponse {
  expand: string;
  issues: JiraIssue[];
  maxResults: number;
  startAt: number;
  total: number;
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
  project: JiraProject;
  reporter: JiraUser;
  assignee: JiraUser;
  priority: JiraPriority;
  updated: string;
  timetracking?: JiraTimeTracking;
  status: JiraStatus;
  [key: string]: unknown; // TODO: custom field
}

export interface JiraUser {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
}

export interface JiraProject {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
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

export interface ProcessedJiraField extends JiraField {
  subtitle: {
    value: string;
    tooltip: string;
  };
  accessories: Array<{
    icon?: any;
    text?: string;
    tooltip: string;
  }>;
  isAdded: boolean;
}
