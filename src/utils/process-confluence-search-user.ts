import { Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import {
  CONFLUENCE_BASE_URL,
  CONFLUENCE_ENTITY_TYPE,
  CONFLUENCE_USER_STATUS,
  DEFAULT_AVATAR,
  CONFLUENCE_TYPE_ICON,
} from "@/constants";
import type { ConfluenceSearchResult, ProcessedConfluenceUserItem } from "@/types";

export function processConfluenceSearchUserItems(items: ConfluenceSearchResult[]): ProcessedConfluenceUserItem[] {
  return items.map((item) => processConfluenceSearchUserItem(item));
}

function processConfluenceSearchUserItem(item: ConfluenceSearchResult): ProcessedConfluenceUserItem {
  const user = item.user!;

  const title = user.displayName;
  const username = user.username;
  // Anonymous user may not have userKey, use username as fallback
  const userKey = user.userKey || user.username;

  const avatarUrl = user.profilePicture.path ? `${CONFLUENCE_BASE_URL}${user.profilePicture.path}` : "";
  const avatarCacheKey = userKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : CONFLUENCE_TYPE_ICON[CONFLUENCE_ENTITY_TYPE.USER];

  // TODO: 打开空间主页
  const url = `${CONFLUENCE_BASE_URL}${item.url}`;

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
