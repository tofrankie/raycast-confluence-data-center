import type { ListItemIcon, ListItemSubtitle, ListItemAccessories, ListItemTitle } from "@/types";

export interface BaseProcessedItem {
  renderKey: string;
  title: ListItemTitle;
}

export interface ProcessedConfluenceContentItem extends BaseProcessedItem {
  id: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  canEdit: boolean;
  canFavorite: boolean;
  isFavourited: boolean;
  url: string;
  editUrl: string;
  spaceUrl: string;
  spaceName: string;
  creatorAvatarUrl: string;
  creatorAvatarCacheKey?: string;
}

export interface ProcessedConfluenceUserItem extends BaseProcessedItem {
  userKey: string;
  displayName: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  avatarUrl: string;
  avatarCacheKey?: string;
}

export interface ProcessedConfluenceSpaceItem extends BaseProcessedItem {
  key: string;
  name: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  avatarUrl: string;
  avatarCacheKey?: string;
}

export interface ProcessedJiraFieldItem extends BaseProcessedItem {
  id: string;
  name: string;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  custom: boolean;
  isAdded: boolean;
  keywords: string[];
  schema?: {
    type: string;
  };
}

export interface ProcessedJiraIssueItem extends BaseProcessedItem {
  key: string;
  summary: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  editUrl: string;
}

export interface ProcessedWorklogItem extends BaseProcessedItem {
  keywords: string[];
  subtitle: string;
  icon: string;
  accessories: ListItemAccessories;
  url: string;
  timeSpent: string;
  timeSpentSeconds: number;
  comment: string;
  date: string;
  issueKey: string;
}

export interface WorklogGroup {
  date: string;
  totalTimeSpent: string;
  totalTimeSpentSeconds: number;
  items: ProcessedWorklogItem[];
  title: string;
  subtitle: string;
}
