import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CONFLUENCE_AVATAR_DIR, JIRA_AVATAR_DIR, AVATAR_TYPES } from "../constants";
import type { AvatarType } from "../types";

export function getAvatarPath(filename: string, type: AvatarType) {
  const baseDir = type === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;
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
