import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { downloadAvatar, getAuthHeaders, getAvatarPath } from "../utils";
import { useConfluencePreferencesContext } from "../contexts";
import type { AvatarType } from "../types";

type AvatarItem = {
  url: string;
  filename: string;
};

export function useAvatar(avatarList: AvatarItem[], avatarType: AvatarType) {
  const { cacheAvatar, token } = useConfluencePreferencesContext();

  if (!cacheAvatar) {
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
        const headers = getAuthHeaders(token);

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
