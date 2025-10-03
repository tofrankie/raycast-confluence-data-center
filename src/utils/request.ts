import { getPreferenceValues } from "@raycast/api";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function confluenceRequest<T>(
  method: Method,
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const { confluenceDomain, confluencePersonalAccessToken } =
    getPreferenceValues<Preferences.ConfluenceSearchContent>();

  if (!confluenceDomain || !confluencePersonalAccessToken) {
    throw new Error("Please configure Confluence domain and Personal Access Token in preferences");
  }

  try {
    const baseUrl = getBaseUrl(confluenceDomain);
    const url = new URL(endpoint, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: getAuthHeaders(confluencePersonalAccessToken),
    });

    if (!response.ok) {
      handleHttpError(response);
    }

    // For PUT/DELETE requests, there may be no response body
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const result = (await response.json()) as T;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to connect to Confluence");
  }
}

export function getBaseUrl(domain: string): string {
  return `https://${domain}`;
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function handleHttpError(response: Response): never {
  switch (response.status) {
    case 401:
      throw new Error("Authentication failed. Please check your Personal Access Token");
    case 403:
      throw new Error("Access denied. Please check your permissions");
    case 404:
      throw new Error("Confluence instance not found. Please check your domain");
    default:
      throw new Error(`HTTP error: ${response.status}`);
  }
}
