import type { Icon } from "./common";

export interface ConfluencePreferences {
  confluenceBaseUrl: string;
  confluencePersonalAccessToken: string;
  searchPageSize: number;
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
  entityType: import("./common").ConfluenceEntityType;
  iconCssClass: string;
  lastModified: string;
  friendlyLastModified: string;
  timestamp: number;
}

export interface ConfluenceUser {
  type: string;
  username: string;
  userKey?: string;
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
  id: number;
  key: string;
  name: string;
  status: string;
  type: string;
  icon: {
    path: string;
    width: number;
    height: number;
    isDefault: boolean;
  };
  description?: {
    plain: {
      value: string;
      representation: string;
    };
    _expandable: {
      view: string;
    };
  };
  metadata?: {
    _expandable: {
      labels: string;
    };
  };
  _links: {
    self: string;
    webui: string;
  };
  _expandable: {
    metadata: string;
    icon: string;
    retentionPolicy: string;
    homepage: string;
  };
}

export interface ConfluenceSearchLinks {
  self?: string;
  next?: string;
  base: string;
  context: string;
}
