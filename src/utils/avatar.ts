import path from "node:path";
import fs from "node:fs/promises";
import { CONFLUENCE_AVATAR_DIR, JIRA_AVATAR_DIR, AVATAR_TYPES } from "../constants";
import type { AvatarType } from "../types";
import { Cache } from "@raycast/api";
import { getAuthHeaders } from "./request";

type DownloadAvatarOptions = {
  type: AvatarType;
  token: string;
  url: string;
  key: string;
};

export const avatarCache = new Cache();

export async function downloadAvatar(options: DownloadAvatarOptions) {
  const { type, token, url, key } = options;

  try {
    const outputDir = getAvatarDir(type);
    await ensureDirExists(outputDir);

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = response.headers.get("content-type");
    const ext = getImageExtension(url, contentType);
    const finalPath = path.join(outputDir, `${key}${ext}`);

    await fs.writeFile(finalPath, buffer);
    avatarCache.set(key, finalPath);

    return finalPath;
  } catch (error) {
    return error instanceof Error ? error.message : "Unknown error";
  }
}

export function getAvatarDir(avatarType: AvatarType) {
  return avatarType === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;
}

export function getAvatarPath(filename: string, avatarType: AvatarType) {
  const baseDir = avatarType === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;
  return path.join(baseDir, filename);
}

// TODO:
export function getAvatarUrl(originalUrl: string, cacheAvatar: boolean, avatarType: AvatarType) {
  if (!originalUrl) return null;

  if (!cacheAvatar) {
    return originalUrl;
  }

  const urlHash = Buffer.from(originalUrl)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  const filename = `${urlHash}.png`;
  const cachedPath = getAvatarPath(filename, avatarType);

  return `file://${cachedPath}`;
}

export function getImageExtension(remoteUrl: string, contentType?: string | null) {
  const url = new URL(remoteUrl);
  const pathname = url.pathname;
  const ext = path.extname(pathname);

  if (ext) {
    return ext;
  }

  if (contentType) {
    return getExtensionFromContentType(contentType);
  }

  return ".png";
}

function getExtensionFromContentType(contentType: string) {
  const mimeType = contentType.split(";")[0].trim().toLowerCase();
  const mimeToExtMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return mimeToExtMap[mimeType] || ".png";
}

const dirExists: Record<string, boolean> = {};

async function ensureDirExists(dir: string) {
  if (dirExists[dir]) return;

  const isExists = await pathExists(dir);
  if (isExists) {
    dirExists[dir] = true;
    return;
  }

  await fs.mkdir(dir, { recursive: true });
  dirExists[dir] = true;
}

export async function pathExists(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
