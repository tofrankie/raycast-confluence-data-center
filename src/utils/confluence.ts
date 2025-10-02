import path from "node:path";
import { writeFile } from "node:fs/promises";
import { environment } from "@raycast/api";
import { confluenceRequest } from "./request";
import { CONFLUENCE_API, DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import type { ConfluenceSearchContentResponse, ConfluenceContentType } from "../types";

export async function searchContentWithFilters(
  query: string,
  filters: string[] = [],
  limit: number = DEFAULT_SEARCH_PAGE_SIZE,
  start: number = 0,
) {
  // 导入 CQL 构建工具
  const { buildSearchQuery, processSpecialFilters, optimizeCQLQuery, testQueryCombinations } = await import(
    "./cql-builder"
  );

  // 开发时运行测试（可以移除）
  if (process.env.NODE_ENV === "development") {
    testQueryCombinations();
  }

  // 构建 CQL 查询
  let cqlQuery = buildSearchQuery(query, filters);

  // 处理特殊过滤选项
  cqlQuery = processSpecialFilters(cqlQuery, filters);

  // 优化查询
  cqlQuery = optimizeCQLQuery(cqlQuery);

  const params = {
    cql: cqlQuery,
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
  const iconMap = {
    page: { source: "remade/icon-page.svg", tintColor: "#aaa" },
    blogpost: { source: "remade/icon-blogpost.svg", tintColor: "#aaa" },
    attachment: { source: "remade/icon-attachment.svg", tintColor: "#aaa" },
    comment: { source: "remade/icon-comment.svg", tintColor: "#aaa" },
    user: { source: "remade/icon-user.svg", tintColor: "#aaa" },
  } as const;

  return iconMap[type as keyof typeof iconMap] || { source: "remade/icon-unknown.svg", tintColor: "#aaa" };
}

export function getContentTypeLabel(type: ConfluenceContentType) {
  const typeMap = {
    page: "Page",
    blogpost: "Blog Post",
    attachment: "Attachment",
    comment: "Comment",
    user: "User",
  } as const;

  return typeMap[type as keyof typeof typeMap] || type;
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
