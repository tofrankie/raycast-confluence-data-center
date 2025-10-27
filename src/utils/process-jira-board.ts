import { getIssueTypeIcon, getJiraIssueEditUrl, getJiraIssueUrl, getIssuePriorityIcon } from "@/utils";
import type {
  JiraBoardIssue,
  JiraBoardColumn,
  ProcessedJiraBoardIssueItem,
  ListItemAccessories,
  ListItemSubtitle,
  JiraSprintResponse,
  JiraSprint,
  JiraBoardResponse,
  JiraBoard,
  JiraBoardConfiguration,
} from "@/types";

export function processJiraBoardIssues(
  issues: JiraBoardIssue[],
  boardConfiguration?: JiraBoardConfiguration,
): ProcessedJiraBoardIssueItem[] {
  return issues.map((issue) => {
    const { fields, key, id } = issue;

    const summary = fields.summary;
    const title = { value: summary, tooltip: summary };
    const issueTypeName = fields.issuetype.name;

    const url = getJiraIssueUrl(key);
    const editUrl = getJiraIssueEditUrl(id);

    const issueTypeIcon = getIssueTypeIcon(issueTypeName);
    const icon = {
      value: issueTypeIcon || "icon-unknown.svg",
      tooltip: `Issue Type: ${issueTypeName}`,
    };

    const subtitle = buildSubtitle(issue);
    const accessories = buildAccessories(issue);
    const keywords = buildKeywords(issue, boardConfiguration);

    return {
      renderKey: id,
      title,
      key,
      summary,
      icon,
      subtitle,
      accessories,
      url,
      editUrl,
      keywords,
    };
  });
}

function buildSubtitle(issue: JiraBoardIssue): ListItemSubtitle {
  const { key: issueKey, fields } = issue;
  const assignee = fields.assignee?.displayName || "Unassigned";
  const reporter = fields.reporter?.displayName || null;

  const subtitle = `${issueKey}@${assignee}`;

  const tooltipParts = [];
  if (issueKey) {
    tooltipParts.push(`${issueKey}`);
  }
  if (reporter) {
    tooltipParts.push(`Reporter: ${reporter}`);
  }
  if (assignee) {
    tooltipParts.push(`Assignee: ${assignee}`);
  }

  return {
    value: subtitle,
    tooltip: tooltipParts.join("\n"),
  };
}

function buildAccessories(issue: JiraBoardIssue): ListItemAccessories {
  const { fields } = issue;
  const status = fields.status?.name || "Unknown";
  const priority = fields.priority?.name || "Unknown";
  const created = fields.created ? new Date(fields.created) : null;
  const updated = fields.updated ? new Date(fields.updated) : null;
  const dueDate = fields.duedate ? new Date(fields.duedate) : null;
  const timeTracking = {
    originalEstimate: fields.timetracking?.originalEstimate || null,
    remainingEstimate: fields.timetracking?.remainingEstimate || null,
    timeSpent: fields.timetracking?.timeSpent || null,
  };
  const accessories: ListItemAccessories = [];

  if (priority) {
    const priorityIcon = getIssuePriorityIcon(priority);

    if (priorityIcon) {
      accessories.push({
        icon: priorityIcon,
        tooltip: `Priority: ${priority}`,
      });
    } else {
      accessories.push({
        tag: priority,
        tooltip: `Priority: ${priority}`,
      });
    }
  }

  if (status) {
    accessories.push({
      tag: status,
      tooltip: `Status: ${status}`,
    });
  }

  const timeTooltipParts = [];
  if (created) {
    timeTooltipParts.push(`Created at ${created.toLocaleString()}`);
  }

  if (updated) {
    timeTooltipParts.push(`Updated at ${updated.toLocaleString()}`);
  }

  if (dueDate) {
    timeTooltipParts.push(`Due at ${dueDate.toLocaleString()}`);
  }

  if (timeTracking.originalEstimate) {
    timeTooltipParts.push(`Estimate Time: ${timeTracking.originalEstimate}`);
  }

  if (timeTracking.remainingEstimate) {
    timeTooltipParts.push(`Remaining Time: ${timeTracking.remainingEstimate}`);
  }

  if (timeTracking.timeSpent) {
    timeTooltipParts.push(`Logged Time: ${timeTracking.timeSpent}`);
  }

  accessories.unshift({
    date: updated ?? created,
    tooltip: timeTooltipParts.join("\n"),
  });

  return accessories;
}

function buildKeywords(issue: JiraBoardIssue, boardConfiguration?: JiraBoardConfiguration): string[] {
  const { key: issueKey, fields } = issue;
  const keywords: string[] = [issueKey, ...issueKey.split("-")[1]];

  if (fields.assignee?.displayName) {
    keywords.push(fields.assignee.displayName);
  }

  if (fields.epic?.name) {
    keywords.push(fields.epic.name);
  }

  if (fields.status?.name) {
    keywords.push(fields.status.name);
  }

  // Add column name from boardConfiguration
  if (boardConfiguration?.columnConfig?.columns && fields.status?.id) {
    const column = boardConfiguration.columnConfig.columns.find((col) =>
      col.statuses.some((status) => status.id === fields.status.id),
    );
    if (column?.name) {
      keywords.push(column.name);
    }
  }

  return keywords;
}

export function groupIssuesByColumn(
  issues: ProcessedJiraBoardIssueItem[],
  columns: JiraBoardColumn[],
  originalIssues: JiraBoardIssue[],
): Record<string, ProcessedJiraBoardIssueItem[]> {
  const grouped: Record<string, ProcessedJiraBoardIssueItem[]> = {};

  // Initialize all columns with empty arrays
  columns.forEach((column) => {
    grouped[column.name] = [];
  });

  // Group issues by their status
  issues.forEach((processedIssue, index) => {
    const originalIssue = originalIssues[index];
    const statusId = originalIssue.fields.status.id;

    // Find which column this status belongs to
    const column = columns.find((col) => col.statuses.some((status) => status.id === statusId));

    if (column) {
      grouped[column.name].push(processedIssue);
    }
  });

  return grouped;
}

export function processActiveSprint(sprintResponse: JiraSprintResponse): JiraSprint | null {
  // TODO: Handle multiple active sprints
  return sprintResponse.values?.[0] || null;
}

export function processBoards(boardResponse: JiraBoardResponse): JiraBoard[] {
  return boardResponse.values || [];
}
