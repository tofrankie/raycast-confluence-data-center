import path from "node:path";
import fs from "node:fs/promises";
import { CONFLUENCE_AVATAR_DIR, JIRA_AVATAR_DIR, AVATAR_TYPES } from "../constants";
import type { AvatarType } from "../types";

export function getAvatarPath(filename: string, avatarType: AvatarType) {
  const baseDir = avatarType === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;
  return path.join(baseDir, filename);
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
    const avatarPathInfo = parseAvatarPath(outputPath);

    const avatarExists = await pathExists(avatarPathInfo.finalPath);
    if (avatarExists) {
      return {
        success: true,
        localPath: avatarPathInfo.finalPath,
      };
    }

    await ensureDirExists(avatarPathInfo.dir);

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

    await fs.writeFile(avatarPathInfo.finalPath, buffer);

    return {
      success: true,
      localPath: avatarPathInfo.finalPath,
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

export function parseAvatarPath(outputPath: string) {
  const dir = path.dirname(outputPath);
  let ext = path.extname(outputPath);
  const name = path.basename(outputPath, ext);

  // Since Confluence avatar URLs do not provide a file extension, we save all avatars as .png for consistent caching and display.
  ext = ".png";

  const finalPath = path.join(dir, `${name}${ext}`);

  return {
    dir,
    name,
    ext,
    finalPath,
  };
}

async function ensureDirExists(dir: string) {
  const isExists = await pathExists(dir);
  if (!isExists) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function pathExists(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
