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
    const title = { value: summary, tooltip: `Summary: ${summary}` };
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
  const accessories: ListItemAccessories = [];

  const priority = fields.priority?.name;
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

  const status = fields.status?.name;
  if (status) {
    accessories.push({
      tag: status,
      tooltip: `Status: ${status}`,
    });
  }

  accessories.unshift({
    text: fields.epic?.name || "No Epic",
    tooltip: fields.epic?.name ? `Epic: ${fields.epic.name}` : "Issue not linked to Epic",
  });

  return accessories;
}

function buildKeywords(issue: JiraBoardIssue, boardConfiguration?: JiraBoardConfiguration): string[] {
  const { key: issueKey, fields } = issue;
  const keywords: string[] = [issueKey, ...issueKey.split("-")[1]];

  if (fields.assignee?.displayName) {
    keywords.push(fields.assignee.displayName);
  }

  keywords.push(fields.epic?.name || "No Epic");

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

export function processAndGroupIssues(
  issues: JiraBoardIssue[],
  columns: JiraBoardColumn[],
): Record<string, ProcessedJiraBoardIssueItem[]> {
  const processedIssues = processJiraBoardIssues(issues);

  const grouped: Record<string, ProcessedJiraBoardIssueItem[]> = {};

  columns.forEach((column) => {
    grouped[column.name] = [];
  });

  // Initialize Unmapped Statuses column
  grouped["Unmapped"] = [];

  // Group processed issues by their status
  processedIssues.forEach((processedIssue, index) => {
    const originalIssue = issues[index];
    const statusId = originalIssue.fields.status.id;

    // Find which column this status belongs to
    const column = columns.find((col) => col.statuses.some((status) => status.id === statusId));

    if (column) {
      grouped[column.name].push(processedIssue);
    } else {
      // If status is not mapped to any column, add to Unmapped
      grouped["Unmapped"].push(processedIssue);
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
