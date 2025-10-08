import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { avatarCache, downloadAvatar } from "../utils";
import { useConfluencePreferencesContext } from "../contexts";
import type { AvatarList, AvatarType } from "../types";

export function useAvatar(avatarList: AvatarList, avatarType: AvatarType) {
  const { token } = useConfluencePreferencesContext();

  const uniqueList = useMemo(() => {
    return avatarList.filter(
      (item, index, self) => !avatarCache.has(item.key) && self.findIndex((a) => a.url === item.url) === index,
    );
  }, [avatarList]);

  const queries = useMemo(() => {
    return uniqueList.map((item) => ({
      queryKey: [`${avatarType}-avatar`, { type: avatarType, url: item.url }],
      queryFn: async () => {
        return downloadAvatar({
          type: avatarType,
          token,
          url: item.url,
          key: item.key,
        });
      },
      staleTime: Infinity,
      gcTime: Infinity,
    }));
  }, [uniqueList]);

  useQueries({ queries });
}
