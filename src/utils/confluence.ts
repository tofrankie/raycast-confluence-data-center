import path from "node:path";
import { writeFile } from "node:fs/promises";
import { environment } from "@raycast/api";
import { confluenceRequest } from "./request";
import { CONFLUENCE_API, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { ConfluenceSearchContentResponse, ConfluenceSearchResponse } from "../types";

export async function searchContent(cql: string, limit: number = DEFAULT_SEARCH_PAGE_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "space,history.createdBy,history.lastUpdated,metadata.currentuser.favourited",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>("GET", CONFLUENCE_API.SEARCH_CONTENT, params);

  // TODO: 调试
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-content-response.json");

  return data;
}

export async function addToFavorites(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>("PUT", endpoint);
}

export async function removeFromFavorites(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>("DELETE", endpoint);
}

export async function searchUsers(cql: string, limit: number = DEFAULT_SEARCH_PAGE_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "user",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>("GET", CONFLUENCE_API.SEARCH, params);

  // TODO: 调试
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-user-response.json");

  return data;
}

export async function searchSpaces(cql: string, limit: number = DEFAULT_SEARCH_PAGE_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "space,space.description.plain,space.icon",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>("GET", CONFLUENCE_API.SEARCH, params);

  // TODO: 调试
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-space-response.json");

  return data;
}

export async function writeToSupportPathFile(content: string, filename: string) {
  const filePath = path.join(environment.supportPath, filename);
  await writeFile(filePath, content, "utf8");
  // TODO:
  console.log("🚀 ~ File written to:", filePath);
}
