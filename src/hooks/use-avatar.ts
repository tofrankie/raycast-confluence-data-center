import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { downloadAvatar, getAvatarPath } from "../utils/avatar";
import { getAuthHeaders } from "../utils/request";
import { useConfluenceConfig } from "./use-confluence-config";
import type { AvatarType } from "../types";

export interface AvatarItem {
  url: string;
  filename: string;
}

export function useAvatar(avatarList: AvatarItem[], avatarType: AvatarType) {
  const config = useConfluenceConfig();

  if (!config?.cacheAvatar) {
    return;
  }

  const avatarsToDownload = useMemo(() => {
    return avatarList.filter((avatar, index, self) => {
      const isUnique = self.findIndex((a) => a.url === avatar.url) === index;
      return isUnique;
    });
  }, [avatarList]);

  useQueries({
    queries: avatarsToDownload.map((avatar) => ({
      queryKey: ["confluence-avatar", { type: avatarType, url: avatar.url }],
      queryFn: async () => {
        const localPath = getAvatarPath(avatar.filename, avatarType);
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
}
