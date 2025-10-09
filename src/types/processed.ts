import type { List } from "@raycast/api";
import type { ConfluenceSearchContentResult, ConfluenceUser, ConfluenceSpace } from "./confluence";
import type { JiraIssue } from "./jira";

export type ProcessedConfluenceContentItem = ConfluenceSearchContentResult & ProcessedContentFields;

export type ProcessedConfluenceUserItem = ConfluenceUser & ProcessedUserFields;

export type ProcessedConfluenceSpaceItem = ConfluenceSpace & ProcessedSpaceFields;

export type ProcessedJiraIssueItem = JiraIssue & ProcessedJiraIssueFields;

export interface ProcessedContentFields {
  // 基础信息
  id: string;
  title: string;
  spaceName: string;

  // 图标和类型
  icon: List.Item.Props["icon"];

  // 时间信息
  updatedAt: Date;
  createdAt: Date;
  isSingleVersion: boolean;

  // 用户信息
  creator: string;
  updater: string;
  // Anonymous user may not have userKey
  creatorAvatarCacheKey?: string;
  creatorAvatarUrl?: string;
  creatorAvatar: string;

  // 收藏状态
  isFavourited: boolean;
  favouritedAt: string | null;

  // URL 信息
  url: string;
  editUrl: string;
  spaceUrl: string;

  // 类型信息
  type: string;
  canEdit: boolean;
  canFavorite: boolean;

  // 渲染信息
  subtitle: List.Item.Props["subtitle"];
  accessories: List.Item.Props["accessories"];
}

export interface ProcessedUserFields {
  // 基础信息
  title: string;
  username: string;
  userKey?: string;
  displayName: string;

  // 图标和头像
  icon: List.Item.Props["icon"];
  avatarCacheKey?: string;
  avatarUrl?: string;
  avatar: string;

  // URL 信息
  url: string;

  // 渲染信息
  subtitle: List.Item.Props["subtitle"];
  accessories: List.Item.Props["accessories"];
}

export interface ProcessedSpaceFields {
  // 基础信息
  spaceKey: string;
  spaceName: string;
  spaceType: string;

  // 图标和头像
  icon: List.Item.Props["icon"];
  avatarUrl?: string;
  avatarCacheKey?: string;
  avatar: string;

  // URL 信息
  url: string;

  // 渲染信息
  subtitle: List.Item.Props["subtitle"];
  accessories: List.Item.Props["accessories"];
}

// Jira 处理后的字段类型
export interface ProcessedJiraIssueFields {
  // 基础信息
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  issueType: string;
  projectKey: string;
  projectName: string;

  // 图标和类型
  icon: List.Item.Props["icon"];

  // 时间信息
  created: Date;
  updated: Date;
  dueDate: Date | null;

  // 用户信息
  assignee: string | null;
  reporter: string | null;

  // 其他信息
  timeTracking: {
    originalEstimate: string | null;
    remainingEstimate: string | null;
    timeSpent: string | null;
  };
  customFieldValue: Record<string, string>;

  // URL 信息
  url: string;

  // 渲染信息
  subtitle: List.Item.Props["subtitle"];
  accessories: List.Item.Props["accessories"];
}
