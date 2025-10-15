import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { CURRENT_PAT } from "@/constants";
import { avatarCache, downloadAvatar } from "@/utils";
import type { AvatarList, AppType, AvatarType } from "@/types";

export function useAvatar<T>({
  items,
  extractAvatarData,
  appType,
  avatarType,
}: {
  items: T[];
  appType: AppType;
  avatarType: AvatarType;
  extractAvatarData: (items: T[]) => AvatarList;
}) {
  const avatarList = useMemo(() => extractAvatarData(items), [items, extractAvatarData]);

  const uniqueList = useMemo(() => {
    return avatarList.filter(
      (item, index, self) => !avatarCache.has(item.key) && self.findIndex((a) => a.url === item.url) === index,
    );
  }, [avatarList]);

  const queries = useMemo(() => {
    return uniqueList.map((item) => ({
      queryKey: [`${appType}-avatar`, { url: item.url }],
      queryFn: async () => {
        return downloadAvatar({
          token: CURRENT_PAT,
          type: avatarType,
          url: item.url,
          key: item.key,
        });
      },
      staleTime: Infinity,
      gcTime: Infinity,
    }));
  }, [uniqueList, appType]);

  useQueries({ queries });
}
