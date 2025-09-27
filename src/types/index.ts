export type ConfluenceContentType = "page" | "blogpost" | "attachment";

export type AvatarType = "confluence" | "jira";

export interface ConfluenceSearchContentResponse {
  results: ConfluenceSearchContentResult[];
  start: number;
  limit: number;
  size: number;
  cqlQuery: string;
  searchDuration: number;
  totalSize: number;
  _links: {
    self: string;
    next: string;
    base: string;
    context: string;
  };
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
  body: {
    storage: {
      value: string;
      representation: string;
      _expandable: {
        content: string;
      };
    };
    view: {
      value: string;
      representation: string;
      _expandable: {
        webresource: string;
        content: string;
      };
    };
    _expandable: {
      editor: string;
      export_view: string;
      styled_view: string;
      anonymous_export_view: string;
    };
  };
  version: {
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

export interface Icon {
  path: string;
  width: number;
  height: number;
  isDefault: boolean;
}

export interface ConfluenceConfig {
  domain: string;
  token: string;
  baseUrl: string;
  cacheAvatar: boolean;
}
