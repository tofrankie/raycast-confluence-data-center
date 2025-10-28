import type { JiraWorklog } from "./jira-common";

export interface JiraWorklogCreateParams extends Record<string, unknown> {
  attributes?: Record<string, unknown>;
  billableSeconds?: string;
  worker: string;
  comment: string;
  started: string;
  timeSpentSeconds: number;
  originTaskId: string;
  remainingEstimate: string | null;
  endDate: string | null;
  includeNonWorkingDays: boolean;
}

export interface JiraWorklogUpdateParams extends Record<string, unknown> {
  originId: number;
  started: string;
  timeSpentSeconds: number;
  originTaskId: string;
  remainingEstimate: string | null;
  endDate: string | null;
  includeNonWorkingDays: boolean;
}

export interface JiraWorklogFormData {
  date: Date | null;
  timeSpent: string;
  comment: string;
  remainingEstimate: string;
}

export type { JiraWorklog };
