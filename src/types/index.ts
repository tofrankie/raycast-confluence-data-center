import type { List } from "@raycast/api";
import { CONFLUENCE_ENTITY_TYPE, AVATAR_TYPES, CONFLUENCE_CONTENT_TYPE } from "../constants";

export type ConfluenceEntityType = (typeof CONFLUENCE_ENTITY_TYPE)[keyof typeof CONFLUENCE_ENTITY_TYPE];

export type ConfluenceContentType = (typeof CONFLUENCE_CONTENT_TYPE)[keyof typeof CONFLUENCE_CONTENT_TYPE];

export type IconType = ConfluenceEntityType | ConfluenceContentType;

export type LabelType = ConfluenceEntityType | ConfluenceContentType;

export type AvatarType = (typeof AVATAR_TYPES)[keyof typeof AVATAR_TYPES];

export interface ConfluenceSearchLinks {
  self?: string;
  next?: string;
  base: string;
  context: string;
}

export interface ConfluenceSearchContentResponse {
  results: ConfluenceSearchContentResult[];
  start: number;
  limit: number;
  size: number;
  cqlQuery: string;
  searchDuration: number;
  totalSize: number; // TODO: totalCount?
  _links: ConfluenceSearchLinks;
}

export interface ConfluenceSearchResponse {
  results: ConfluenceSearchResult[];
  start: number;
  limit: number;
  size: number;
  totalSize: number;
  cqlQuery: string;
  searchDuration: number;
  _links: ConfluenceSearchLinks;
}

export interface ConfluenceSearchContentResult {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    id: number;
    key: string;
    name: string;
    type: string;
    status: string;
    _links: {
      webui: string;
      self: string;
    };
    _expandable: {
      metadata: string;
      icon: string;
      description: string;
      retentionPolicy: string;
      homepage: string;
    };
  };
  position: number;
  extensions: {
    position: string;
  };
  _links: {
    webui: string;
    edit: string;
    tinyui: string;
    self: string;
  };
  history: {
    latest: boolean;
    createdBy: {
      type: string;
      username: string;
      userKey: string;
      profilePicture: Icon;
      displayName: string;
      _links: {
        self: string;
      };
      _expandable: {
        status: string;
      };
    };
    createdDate: string;
    lastUpdated: {
      by: {
        type: string;
        username: string;
        userKey: string;
        profilePicture: Icon;
        displayName: string;
        _links: {
          self: string;
        };
        _expandable: {
          status: string;
        };
      };
      when: string;
      message: string;
      number: number;
      minorEdit: boolean;
      hidden: boolean;
      _links: {
        self: string;
      };
      _expandable: {
        content: string;
      };
    };
    _links: {
      self: string;
    };
    _expandable: {
      lastUpdated: string;
      previousVersion: string;
      contributors: string;
      nextVersion: string;
    };
  };
  metadata: {
    currentuser: {
      favourited?: {
        isFavourite: boolean;
        favouritedDate: number;
      };
      _expandable: {
        lastmodified: string;
        viewed: string;
        lastcontributed: string;
      };
    };
    _expandable: {
      properties: string;
      frontend: string;
      editorHtml: string;
      labels: string;
    };
  };
  _expandable: {
    container: string;
    metadata: string;
    operations: string;
    children: string;
    restrictions: string;
    history: string;
    ancestors: string;
    descendants: string;
  };
}

export interface ConfluenceSearchResult {
  content?: ConfluenceSearchContentResult;
  user?: ConfluenceUser;
  space?: ConfluenceSpace;
  title: string;
  excerpt: string;
  url: string;
  resultGlobalContainer?: {
    title: string;
    displayUrl: string;
  };
  entityType: ConfluenceEntityType;
  iconCssClass: string;
  lastModified: string;
  friendlyLastModified: string;
  timestamp: number;
}

export interface Icon {
  path: string;
  width: number;
  height: number;
  isDefault: boolean;
}

export interface ConfluencePreferences {
  confluenceDomain: string;
  confluencePersonalAccessToken: string;
  confluenceCacheUserAvatar: boolean;
  confluenceDisplayRecentlyViewed: boolean;
  domain: string;
  token: string;
  baseUrl: string;
  cacheAvatar: boolean;
  searchPageSize: number;
  displayRecentlyViewed: boolean;
}

export interface SearchFilter {
  id: string;
  label: string;
  cql: string;
  icon?: List.Dropdown.Item.Props["icon"];
  transform?: (processedCql: string, context?: { userInput: string; filter: SearchFilter }) => string;
}

export interface CQLQuery {
  raw: string;
  isCQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}

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
  creatorAvatar: string | null;

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

export interface ConfluenceUser {
  type: string;
  username: string;
  userKey: string;
  profilePicture: Icon;
  displayName: string;
  _links: {
    self: string;
  };
  _expandable: {
    status: string;
  };
}

export interface ConfluenceSpace {
  key: string;
  name: string;
  type: string;
  metadata: Record<string, unknown>;
  _links: {
    self: string;
  };
  _expandable: {
    description: string;
  };
}

export interface ProcessedUserFields {
  // 基础信息
  title: string;
  username: string;
  userKey: string;
  displayName: string;

  // 图标和头像
  icon: List.Item.Props["icon"];
  avatarUrl: string | null;
  avatar: string | null;

  // URL 信息
  url: string;

  // 渲染信息
  subtitle: List.Item.Props["subtitle"];
  accessories: List.Item.Props["accessories"];
}

export type ProcessedContentItem = ConfluenceSearchContentResult & ProcessedContentFields;
export type ProcessedUserItem = ConfluenceUser & ProcessedUserFields;
