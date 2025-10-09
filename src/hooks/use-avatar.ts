import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { avatarCache, downloadAvatar } from "../utils";
import type { AvatarList, AppType } from "../types";
import { getPreferenceValues } from "@raycast/api";
import { APP_TYPE } from "../constants";

export function useAvatar(avatarList: AvatarList, appType: AppType) {
  const { confluencePersonalAccessToken, jiraPersonalAccessToken } = useMemo(
    () => getPreferenceValues<Preferences>(),
    [],
  );

  const uniqueList = useMemo(() => {
    return avatarList.filter(
      (item, index, self) => !avatarCache.has(item.key) && self.findIndex((a) => a.url === item.url) === index,
    );
  }, [avatarList]);

  const queries = useMemo(() => {
    const token = appType === APP_TYPE.CONFLUENCE ? confluencePersonalAccessToken : jiraPersonalAccessToken;
    return uniqueList.map((item) => ({
      queryKey: [`${appType}-avatar`, { type: appType, url: item.url }],
      queryFn: async () => {
        return downloadAvatar({
          token,
          type: appType,
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
