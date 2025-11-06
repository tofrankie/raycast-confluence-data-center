import type { ProcessedWorklog } from "@/types";

export interface JiraWorklogCreateParams extends Record<string, unknown> {
  attributes?: Record<string, unknown>;
  billableSeconds?: string;
  worker: string;
  comment: string;
  started: string;
  originTaskId: string;
  timeSpentSeconds: number;
  remainingEstimate: number | null;
  endDate: string | null;
  includeNonWorkingDays: boolean;
}

export interface JiraWorklogUpdateParams extends Record<string, unknown> {
  originTaskId: string;
  originId: number;
  started: string;
  timeSpentSeconds: number;
  remainingEstimate: number | null;
  endDate: string | null;
  includeNonWorkingDays: boolean;
}

export interface JiraWorklogFormData {
  date: Date | null;
  timeSpent: string;
  comment: string;
  remainingEstimate: string;
}

export interface WorklogGroup {
  date: string;
  totalTimeSpent: string;
  totalTimeSpentSeconds: number;
  items: ProcessedWorklog[];
  title: string;
  subtitle: string;
}
