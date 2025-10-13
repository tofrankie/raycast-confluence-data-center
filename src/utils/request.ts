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
      await handleHttpError(response, appType);
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

async function handleHttpError(response: Response, appType: AppType): Promise<never> {
  let errorMessage = "";

  try {
    const errorBody = await response.json();

    if (errorBody.errorMessages && Array.isArray(errorBody.errorMessages)) {
      errorMessage = errorBody.errorMessages.join("; ");
    } else if (errorBody.message) {
      errorMessage = errorBody.message;
    } else if (errorBody.error) {
      errorMessage =
        typeof errorBody.error === "string"
          ? errorBody.error
          : errorBody.error.message || JSON.stringify(errorBody.error);
    } else if (errorBody.errors && typeof errorBody.errors === "object") {
      const errorDetails = Object.entries(errorBody.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join("; ");
      errorMessage = errorDetails;
    }
  } catch {
    // If we can't parse the response body, fall back to status-based messages
  }

  // Combine status-based message with detailed error message
  const baseMessage = getBaseErrorMessage(response.status, appType);
  const fullMessage = errorMessage ? `${baseMessage} Details: ${errorMessage}` : baseMessage;

  throw new Error(fullMessage);
}

function getBaseErrorMessage(status: number, appType: AppType): string {
  switch (status) {
    case 400:
      return `Bad request to ${appType}. Please check your request parameters`;
    case 401:
      return `Authentication failed. Please check your ${appType} Personal Access Token`;
    case 403:
      return `Access denied. Please check your ${appType} permissions`;
    case 404:
      return `${appType} instance not found. Please check your instance URL`;
    case 429:
      return `Rate limit exceeded for ${appType}. Please try again later`;
    case 500:
      return `${appType} server error. Please try again later`;
    case 502:
    case 503:
    case 504:
      return `${appType} service is temporarily unavailable. Please try again later`;
    default:
      return `HTTP error ${status} from ${appType}`;
  }
}

function handleConnectionError(error: unknown, appType: AppType): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Failed to connect to ${appType}`);
}
