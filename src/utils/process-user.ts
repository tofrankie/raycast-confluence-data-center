import { Image } from "@raycast/api";
import { avatarCache } from "./avatar";
import { CONFLUENCE_ENTITY_TYPE, DEFAULT_AVATAR, TYPE_ICONS } from "../constants";
import type { ConfluenceSearchResult, ProcessedUserFields } from "../types";

export function processUserItems(items: ConfluenceSearchResult[], baseUrl: string) {
  return items.map((item) => ({
    ...item.user!,
    ...processUserItem(item, baseUrl),
  }));
}

function processUserItem(item: ConfluenceSearchResult, baseUrl: string): ProcessedUserFields {
  const user = item.user!;

  // 基础信息
  const title = user.displayName;
  const username = user.username;
  // Anonymous users may not have userKey
  const userKey = user.userKey;
  const displayName = user.displayName;

  // 图标和头像
  const avatarUrl = user.profilePicture.path ? `${baseUrl}${user.profilePicture.path}` : "";
  const avatarCacheKey = userKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.USER];

  // URL 信息 TODO: 打开空间主页
  const url = `${baseUrl}${item.url}`;

  // 渲染信息
  const subtitle = { value: username, tooltip: `Username` };
  const accessories = undefined;

  return {
    // 基础信息
    title,
    username,
    userKey,
    displayName,

    // 图标和头像
    icon,
    avatarUrl,
    avatar,
    avatarCacheKey,

    // URL 信息
    url,

    // 渲染信息
    subtitle,
    accessories,
  };
}
