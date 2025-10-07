import { List } from "@raycast/api";
import { JIRA_ISSUE_TYPE_ICONS } from "../constants";
import { getAvatarUrl } from "./avatar";
import { getJiraIssueUrl } from "./jira";
import type { JiraIssue, ProcessedJiraIssueItem, JiraPreferences } from "../types";

export function processJiraIssue(issue: JiraIssue, preferences: JiraPreferences): ProcessedJiraIssueItem {
  const { baseUrl, cacheAvatar } = preferences;
  const { fields, key, id } = issue;

  // 基础信息
  const summary = fields.summary || "No Summary";
  const status = fields.status?.name || "Unknown";
  const priority = fields.priority?.name || "Medium";
  const issueType = fields.issuetype?.name || "Task";
  const projectKey = fields.project?.key || "";
  const projectName = fields.project?.name || "";

  // 时间信息
  const created = fields.created ? new Date(fields.created) : new Date();
  const updated = new Date(fields.updated);
  const dueDate = fields.duedate ? new Date(fields.duedate) : null;

  // 用户信息
  const assignee = fields.assignee?.displayName || null;
  const reporter = fields.reporter?.displayName || null;

  // 头像处理
  const assigneeAvatar = fields.assignee?.avatarUrls?.["48x48"]
    ? getAvatarUrl(fields.assignee.avatarUrls["48x48"], cacheAvatar, "jira")
    : null;
  const reporterAvatar = fields.reporter?.avatarUrls?.["48x48"]
    ? getAvatarUrl(fields.reporter.avatarUrls["48x48"], cacheAvatar, "jira")
    : null;

  // 时间跟踪
  const timeTracking = {
    originalEstimate: fields.timetracking?.originalEstimate || null,
    remainingEstimate: fields.timetracking?.remainingEstimate || null,
    timeSpent: fields.timetracking?.timeSpent || null,
  };

  // URL 信息
  const url = getJiraIssueUrl(baseUrl, key);

  // 图标处理
  const icon = {
    value: JIRA_ISSUE_TYPE_ICONS[issueType as keyof typeof JIRA_ISSUE_TYPE_ICONS] || "icon-unknown.svg",
    tooltip: `Issue Type: ${issueType}`,
  };

  // 渲染信息
  const subtitle = buildSubtitle(key, assignee, reporter);
  const accessories = buildAccessories({
    status,
    priority,
    created,
    updated,
    dueDate,
    timeTracking,
  });

  return {
    ...issue,
    // 基础信息
    id,
    key,
    summary,
    description: "", // 暂时为空字符串，因为当前 API 响应中没有 description
    status,
    priority,
    issueType,
    projectKey,
    projectName,

    // 图标和类型
    icon,

    // 时间信息
    created,
    updated,
    dueDate,

    // 用户信息
    assignee,
    reporter,
    assigneeAvatar,
    reporterAvatar,

    // 其他信息
    timeTracking,

    // URL 信息
    url,

    // 渲染信息
    subtitle,
    accessories,
  };
}

function buildSubtitle(
  issueKey: string,
  assignee: string | null,
  reporter: string | null,
): List.Item.Props["subtitle"] {
  const parts = [];

  if (issueKey) {
    parts.push(issueKey);
  }

  if (assignee) {
    parts.push(`@${assignee}`);
  }

  const subtitle = parts.join(" ");

  // 构建 tooltip
  const tooltipParts = [];
  if (issueKey) {
    tooltipParts.push(`Issue Key: ${issueKey}`);
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

interface BuildAccessoriesParams {
  status: string;
  priority: string;
  created: Date;
  updated: Date;
  dueDate: Date | null;
  timeTracking: { originalEstimate: string | null; remainingEstimate: string | null; timeSpent: string | null };
}

function buildAccessories({
  status,
  priority,
  created,
  updated,
  dueDate,
  timeTracking,
}: BuildAccessoriesParams): List.Item.Props["accessories"] {
  const accessories: List.Item.Props["accessories"] = [];

  // 优先级
  if (priority) {
    accessories.push({
      tag: priority,
      tooltip: `Priority: ${priority}`,
    });
  }

  // 状态
  if (status) {
    accessories.push({
      tag: status,
      tooltip: `Status: ${status}`,
    });
  }

  // 更新时间
  const timeTooltipParts = [];
  timeTooltipParts.push(`Updated: ${updated.toLocaleString()}`);

  if (created) {
    timeTooltipParts.push(`Created: ${created.toLocaleString()}`);
  }

  if (dueDate) {
    timeTooltipParts.push(`Due: ${dueDate.toLocaleString()}`);
  }

  if (timeTracking.originalEstimate) {
    timeTooltipParts.push(`Original Estimate: ${timeTracking.originalEstimate}`);
  }

  if (timeTracking.remainingEstimate) {
    timeTooltipParts.push(`Remaining Estimate: ${timeTracking.remainingEstimate}`);
  }

  if (timeTracking.timeSpent) {
    timeTooltipParts.push(`Time Spent: ${timeTracking.timeSpent}`);
  }

  accessories.push({
    text: formatRelativeTime(updated),
    tooltip: timeTooltipParts.join("\n"),
  });

  return accessories;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
