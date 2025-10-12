import {
  APP_TYPE,
  CONFLUENCE_BASE_URL,
  CONFLUENCE_PERSONAL_ACCESS_TOKEN,
  JIRA_BASE_URL,
  JIRA_PERSONAL_ACCESS_TOKEN,
} from "@/constants";
import type { AppType } from "@/types";

type Method = "GET" | "POST" | "PUT" | "DELETE";

const SERVICE_CONFIGS = {
  [APP_TYPE.CONFLUENCE]: {
    baseUrl: CONFLUENCE_BASE_URL,
    token: CONFLUENCE_PERSONAL_ACCESS_TOKEN,
  },
  [APP_TYPE.JIRA]: {
    baseUrl: JIRA_BASE_URL,
    token: JIRA_PERSONAL_ACCESS_TOKEN,
  },
} as const;

export async function confluenceRequest<T>(
  method: Method,
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return apiRequest({
    appType: APP_TYPE.CONFLUENCE,
    method,
    endpoint,
    params,
  });
}

export async function jiraRequest<T>(method: Method, endpoint: string, params?: Record<string, unknown>): Promise<T> {
  return apiRequest({
    appType: APP_TYPE.JIRA,
    method,
    endpoint,
    params,
  });
}

export async function apiRequest<T>({
  appType,
  method,
  endpoint,
  params,
}: {
  appType: AppType;
  method: Method;
  endpoint: string;
  params?: Record<string, unknown>;
}): Promise<T> {
  const config = SERVICE_CONFIGS[appType];

  try {
    const url = new URL(endpoint, config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: getAuthHeaders(config.token),
    });

    if (!response.ok) {
      handleHttpError(response, appType);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const result = (await response.json()) as T;
    return result;
  } catch (error) {
    handleConnectionError(error, appType);
  }
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function handleHttpError(response: Response, appType: AppType): never {
  switch (response.status) {
    case 401:
      throw new Error(`Authentication failed. Please check your ${appType} Personal Access Token`);
    case 403:
      throw new Error(`Access denied. Please check your ${appType} permissions`);
    case 404:
      throw new Error(`${appType} instance not found. Please check your instance`);
    default:
      throw new Error(`HTTP error: ${response.status}`);
  }
}

function handleConnectionError(error: unknown, appType: AppType): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Failed to connect to ${appType}`);
}
