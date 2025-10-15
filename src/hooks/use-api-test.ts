import { useEffect } from "react";

import { CURRENT_BASE_URL, CURRENT_PAT } from "@/constants";
import { getAuthHeaders, writeResponseFile } from "@/utils";

const FETCH_CONFIG = {
  method: "GET",
  endpoint: "/rest/api/user/current",
} as const;

export function useApiTest() {
  useEffect(() => {
    fetchApi();
  }, []);
}

async function fetchApi() {
  const { endpoint, method } = FETCH_CONFIG;

  if (!endpoint) return;

  try {
    const url = new URL(endpoint, CURRENT_BASE_URL);

    const requestOptions: RequestInit = {
      method,
      headers: getAuthHeaders(CURRENT_PAT),
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
}
