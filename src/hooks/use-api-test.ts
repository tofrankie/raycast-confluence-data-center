import { useEffect } from "react";

import { getAuthHeaders, writeResponseFile } from "@/utils";
import {
  APP_TYPE,
  CONFLUENCE_BASE_URL,
  CONFLUENCE_PERSONAL_ACCESS_TOKEN,
  JIRA_BASE_URL,
  JIRA_PERSONAL_ACCESS_TOKEN,
} from "@/constants";

const FETCH_CONFIG = {
  method: "GET",
  endpoint: "/rest/api/2/status",
  appType: APP_TYPE.JIRA as typeof APP_TYPE.JIRA | typeof APP_TYPE.CONFLUENCE,
} as const;

export function useApiTest() {
  useEffect(() => {
    const fetchData = async () => {
      const { endpoint, method, appType } = FETCH_CONFIG;

      if (!endpoint) return;

      try {
        const baseUrl = appType === APP_TYPE.CONFLUENCE ? CONFLUENCE_BASE_URL : JIRA_BASE_URL;
        const token = appType === APP_TYPE.CONFLUENCE ? CONFLUENCE_PERSONAL_ACCESS_TOKEN : JIRA_PERSONAL_ACCESS_TOKEN;

        const url = new URL(endpoint, baseUrl);

        const requestOptions: RequestInit = {
          method,
          headers: getAuthHeaders(token),
        };

        const response = await fetch(url.toString(), requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        writeResponseFile(JSON.stringify(result, null, 2), "test");
      } catch (err) {
        console.error("❌ Fetch Test Error:", err);
      }
    };

    fetchData();
  }, []);
}
