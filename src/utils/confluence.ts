import path from "node:path";
import { writeFile } from "node:fs/promises";
import { environment } from "@raycast/api";
import { confluenceRequest } from "./request";
import { API } from "../constants";
import type { ConfluenceSearchContentResult, ConfluenceSearchContentResponse, ConfluenceContentType } from "../types";

export async function searchContent(query: string, limit: number = 5) {
  const params = {
    cql: `text ~ "${query}"`,
    limit: limit.toString(),
    expand: "space,version,body.storage,body.view",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>(API.SEARCH_CONTENT, params);

  // TODO:
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-content-response.json");

  return data.results;
}

export function getContentIcon(type: ConfluenceContentType) {
  const iconMap = {
    page: { source: "icon-page.svg", tintColor: "#505258" },
    blogpost: { source: "icon-blogpost.svg", tintColor: "#505258" },
    attachment: { source: "icon-attachment.svg", tintColor: "#505258" },
  };

  return iconMap[type] || { source: "icon-document.svg", tintColor: "#505258" };
}

export function getContentTypeLabel(type: ConfluenceContentType) {
  const typeMap = {
    page: "Page",
    blogpost: "Blog Post",
    attachment: "Attachment",
  };

  return typeMap[type] || type;
}

export function getContentPreview(body: ConfluenceSearchContentResult["body"]) {
  if (!body) return "";

  const content = body.storage?.value || body.view?.value || "";
  // Remove HTML tags and get first 100 characters
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  return textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;
}

export async function writeToSupportPathFile(content: string, filename: string) {
  const filePath = path.join(environment.supportPath, filename);
  await writeFile(filePath, content, "utf8");
  // TODO:
  console.log("🚀 ~ File written to:", filePath);
}
