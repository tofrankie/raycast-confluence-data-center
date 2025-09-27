import { access } from "node:fs/promises";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { downloadAvatar, getAvatarPath } from "../utils/avatar";
import { CONFLUENCE_AVATAR_DIR, JIRA_AVATAR_DIR, AVATAR_TYPES } from "../constants";
import { getAuthHeaders } from "../utils/request";
import { useConfluenceConfig } from "./use-confluence-config";
import type { AvatarType } from "../types";

export interface AvatarItem {
  url: string;
  filename: string;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function useAvatar(avatarList: AvatarItem[], type: AvatarType) {
  const config = useConfluenceConfig();

  const avatarDir = type === AVATAR_TYPES.CONFLUENCE ? CONFLUENCE_AVATAR_DIR : JIRA_AVATAR_DIR;

  if (!config?.cacheAvatar) {
    return null;
  }

  const avatarsToDownload = useMemo(() => {
    return avatarList.filter((avatar, index, self) => {
      const isUnique = self.findIndex((a) => a.url === avatar.url) === index;
      return isUnique;
    });
  }, [avatarList]);

  useQueries({
    queries: avatarsToDownload.map((avatar) => ({
      queryKey: ["avatar", type, avatar.url],
      queryFn: async () => {
        const localPath = getAvatarPath(avatar.filename, type);
        const headers = getAuthHeaders(config.token);

        return downloadAvatar({
          url: avatar.url,
          outputPath: localPath,
          headers,
        });
      },
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });

  return avatarDir;
}
