import { Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import { CONFLUENCE_ENTITY_TYPE, CONFLUENCE_USER_STATUS, DEFAULT_AVATAR, TYPE_ICONS } from "@/constants";
import type { ConfluenceSearchResult, ProcessedConfluenceUserItem } from "@/types";

export function processConfluenceSearchUserItems(
  items: ConfluenceSearchResult[],
  baseUrl: string,
): ProcessedConfluenceUserItem[] {
  return items.map((item) => processConfluenceSearchUserItem(item, baseUrl));
}

function processConfluenceSearchUserItem(item: ConfluenceSearchResult, baseUrl: string): ProcessedConfluenceUserItem {
  const user = item.user!;

  const title = user.displayName;
  const username = user.username;
  // Anonymous user may not have userKey, use username as fallback
  const userKey = user.userKey || user.username;

  const avatarUrl = user.profilePicture.path ? `${baseUrl}${user.profilePicture.path}` : "";
  const avatarCacheKey = userKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.USER];

  // TODO: 打开空间主页
  const url = `${baseUrl}${item.url}`;

  const subtitle = { value: username, tooltip: `Username` };

  const accessories =
    user.status !== CONFLUENCE_USER_STATUS.CURRENT
      ? [{ text: user.status.charAt(0).toUpperCase() + user.status.slice(1), tooltip: "User Status" }]
      : undefined;

  return {
    renderKey: userKey,
    title,
    userKey,
    displayName: title,
    icon,
    subtitle,
    accessories,
    url,
    avatarUrl,
    avatarCacheKey,
  };
}
