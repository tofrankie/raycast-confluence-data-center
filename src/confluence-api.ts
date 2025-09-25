import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  confluenceDomain: string;
  personalAccessToken: string;
}

interface ConfluenceSearchResult {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    id: string;
    key: string;
    name: string;
    type: string;
  };
  version: {
    when: string;
    friendlyWhen: string;
    by: {
      type: string;
      username: string;
      userKey: string;
      profilePicture: {
        path: string;
        width: number;
        height: number;
        isDefault: boolean;
      };
      displayName: string;
      _links: {
        base: string;
        context: string;
      };
    };
  };
  body: {
    storage?: {
      value: string;
      representation: string;
    };
    view?: {
      value: string;
      representation: string;
    };
  };
  _links: {
    webui: string;
    edit: string;
    tinyui: string;
    self: string;
  };
}

interface ConfluenceSearchResponse {
  results: ConfluenceSearchResult[];
  start: number;
  limit: number;
  size: number;
  _links: {
    base: string;
    context: string;
    self: string;
  };
}

export class ConfluenceAPI {
  private domain: string;
  private token: string;

  constructor() {
    const preferences = getPreferenceValues<Preferences>();
    this.domain = preferences.confluenceDomain;
    this.token = preferences.personalAccessToken;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async searchContent(query: string, limit: number = 20): Promise<ConfluenceSearchResult[]> {
    if (!this.domain || !this.token) {
      throw new Error("Confluence domain and Personal Access Token must be configured in preferences");
    }

    try {
      const baseUrl = this.getBaseUrl();
      const searchUrl = `${baseUrl}/rest/api/content/search`;

      const params = new URLSearchParams({
        cql: `text ~ "${query}"`,
        limit: limit.toString(),
        expand: "space,version,body.storage,body.view",
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please check your Personal Access Token.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Please check your permissions.");
        } else if (response.status === 404) {
          throw new Error("Confluence instance not found. Please check your domain.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConfluenceSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to search Confluence content");
    }
  }

  async searchBySpace(query: string, spaceKey: string, limit: number = 20): Promise<ConfluenceSearchResult[]> {
    if (!this.domain || !this.token) {
      throw new Error("Confluence domain and Personal Access Token must be configured in preferences");
    }

    try {
      const baseUrl = this.getBaseUrl();
      const searchUrl = `${baseUrl}/rest/api/content/search`;

      const params = new URLSearchParams({
        cql: `space = "${spaceKey}" AND text ~ "${query}"`,
        limit: limit.toString(),
        expand: "space,version,body.storage,body.view",
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConfluenceSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to search Confluence content by space");
    }
  }

  getContentUrl(contentId: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/pages/viewpage.action?pageId=${contentId}`;
  }

  getSpaceUrl(spaceKey: string) {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/spaces/${spaceKey}`;
  }

  getBaseUrl() {
    return `https://${this.domain}`;
  }
}
