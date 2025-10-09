export const JIRA_ISSUE_TYPE_NAME = {
  BUG: "Bug",
  TASK: "Task",
  STORY: "Story",
  EPIC: "Epic",
  SUB_TASK: "Sub-task",
} as const;

export const JIRA_ISSUE_TYPE_ICONS = {
  [JIRA_ISSUE_TYPE_NAME.BUG]: "icon-bug.svg",
  [JIRA_ISSUE_TYPE_NAME.TASK]: "icon-task.svg",
  [JIRA_ISSUE_TYPE_NAME.STORY]: "icon-story.svg",
  [JIRA_ISSUE_TYPE_NAME.EPIC]: "icon-epic.svg",
  [JIRA_ISSUE_TYPE_NAME.SUB_TASK]: "icon-subtask.svg",
} as const;

export const JIRA_PRIORITY = {
  BLOCKER: "Blocker",
  CRITICAL: "Critical",
  MAJOR: "Major",
  MINOR: "Minor",
  TRIVIAL: "Trivial",
} as const;

// TODO:
export const JIRA_PRIORITY_ICONS = {
  [JIRA_PRIORITY.BLOCKER]: "icon-star.svg",
  [JIRA_PRIORITY.CRITICAL]: "icon-star.svg",
  [JIRA_PRIORITY.MAJOR]: "icon-star.svg",
  [JIRA_PRIORITY.MINOR]: "icon-star.svg",
  [JIRA_PRIORITY.TRIVIAL]: "icon-star.svg",
  default: "icon-star.svg",
} as const;
