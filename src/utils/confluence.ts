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
    expand: "space,history.createdBy,history.lastUpdated",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>(API.SEARCH_CONTENT, params);

  // TODO:
  writeToSupportPathFile(JSON.stringify(data, null, 2), "search-content-response.json");

  return data.results;
}

export function getContentIcon(type: ConfluenceContentType) {
  const iconMap = {
    page: { source: "remade/icon-page.svg", tintColor: "#aaa" },
    blogpost: { source: "remade/icon-blogpost.svg", tintColor: "#aaa" },
    attachment: { source: "icon-attachment.svg", tintColor: "#aaa" },
    comment: { source: "remade/icon-comment.svg", tintColor: "#aaa" },
  };

  return iconMap[type] || { source: "icon-document.svg", tintColor: "#aaa" };
}

export function getContentTypeLabel(type: ConfluenceContentType) {
  const typeMap = {
    page: "Page",
    blogpost: "Blog Post",
    attachment: "Attachment",
    comment: "Comment",
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
