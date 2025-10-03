import path from "node:path";
import { writeFile } from "node:fs/promises";
import { environment } from "@raycast/api";
import { confluenceRequest } from "./request";
import { CONFLUENCE_API, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import { contentTypeRegistry } from "./index";
import type { ConfluenceSearchContentResponse, ConfluenceContentType } from "../types";

export async function searchContent(cql: string, limit: number = DEFAULT_SEARCH_PAGE_SIZE, start: number = 0) {
  const params = {
    cql: cql,
    start: start.toString(),
    limit: limit.toString(),
    expand: "space,history.createdBy,history.lastUpdated,metadata.currentuser.favourited",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>(CONFLUENCE_API.SEARCH_CONTENT, params);

  // TODO: 调试
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-content-response.json");

  return data;
}

export function getContentIcon(type: ConfluenceContentType) {
  const config = contentTypeRegistry.get(type);
  return config?.icon || { source: "remade/icon-unknown.svg", tintColor: "#aaa" };
}

export function getContentTypeLabel(type: ConfluenceContentType) {
  const config = contentTypeRegistry.get(type);
  return config?.label || type;
}

export async function writeToSupportPathFile(content: string, filename: string) {
  const filePath = path.join(environment.supportPath, filename);
  await writeFile(filePath, content, "utf8");
  // TODO:
  console.log("🚀 ~ File written to:", filePath);
}

export async function addToFavorites(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>(endpoint, undefined, "PUT");
}

export async function removeFromFavorites(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>(endpoint, undefined, "DELETE");
}
