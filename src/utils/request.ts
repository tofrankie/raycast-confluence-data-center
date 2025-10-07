import { getPreferenceValues } from "@raycast/api";
import type { JiraPreferences } from "../types";

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
      handleHttpError(response, "Confluence");
    }

    // For PUT/DELETE requests, there may be no response body
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const result = (await response.json()) as T;
    return result;
  } catch (error) {
    handleConnectionError(error, "Confluence");
  }
}

export function getBaseUrl(domain: string) {
  return `https://${domain}`;
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function jiraRequest<T>(
  method: Method,
  endpoint: string,
  params?: Record<string, unknown>,
  preferences?: JiraPreferences,
): Promise<T> {
  const jiraPrefs = preferences || getPreferenceValues<Preferences.JiraSearchIssue>();
  const { jiraDomain, jiraPersonalAccessToken } = jiraPrefs;

  if (!jiraDomain || !jiraPersonalAccessToken) {
    throw new Error("Please configure Jira domain and Personal Access Token in preferences");
  }

  try {
    const baseUrl = getBaseUrl(jiraDomain);
    const url = new URL(endpoint, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: getAuthHeaders(jiraPersonalAccessToken),
    });

    if (!response.ok) {
      handleHttpError(response, "Jira");
    }

    // For PUT/DELETE requests, there may be no response body
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const result = (await response.json()) as T;
    return result;
  } catch (error) {
    handleConnectionError(error, "Jira");
  }
}

function handleHttpError(response: Response, service: string = "Service"): never {
  switch (response.status) {
    case 401:
      throw new Error(`Authentication failed. Please check your ${service} Personal Access Token`);
    case 403:
      throw new Error(`Access denied. Please check your ${service} permissions`);
    case 404:
      throw new Error(`${service} instance not found. Please check your domain`);
    default:
      throw new Error(`HTTP error: ${response.status}`);
  }
}

function handleConnectionError(error: unknown, service: string): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Failed to connect to ${service}`);
}
