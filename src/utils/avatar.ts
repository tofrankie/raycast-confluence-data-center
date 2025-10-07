import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CONFLUENCE_AVATAR_DIR, JIRA_AVATAR_DIR, AVATAR_TYPES } from "../constants";
import type { AvatarType } from "../types";

export function getAvatarPath(filename: string, avatarType: AvatarType) {
  const baseDir = avatarType === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;
  return join(baseDir, filename);
}

export interface DownloadOptions {
  url: string;
  outputPath: string;
  headers: Record<string, string>;
}

export interface DownloadResult {
  success: boolean;
  localPath?: string;
  error?: string;
}

export async function downloadAvatar(options: DownloadOptions): Promise<DownloadResult> {
  const { url, outputPath, headers } = options;

  try {
    await mkdir(dirname(outputPath), { recursive: true });

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 由于 Confluence 返回的头像链接没有提供扩展名，为了方便缓存展示处理，统一存为 .png 格式
    const finalPath = outputPath.includes(".") ? outputPath : `${outputPath}.png`;

    await writeFile(finalPath, buffer);

    return {
      success: true,
      localPath: finalPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getAvatarUrl(originalUrl: string, cacheAvatar: boolean, avatarType: AvatarType): string | null {
  if (!originalUrl) return null;

  if (!cacheAvatar) {
    return originalUrl;
  }

  // 生成缓存文件名
  const urlHash = Buffer.from(originalUrl)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  const filename = `${urlHash}.png`;
  const cachedPath = getAvatarPath(filename, avatarType);

  return `file://${cachedPath}`;
}

export function getCachedAvatarPath(originalUrl: string, avatarType: AvatarType): string {
  const urlHash = Buffer.from(originalUrl)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  const filename = `${urlHash}.png`;
  return getAvatarPath(filename, avatarType);
}
