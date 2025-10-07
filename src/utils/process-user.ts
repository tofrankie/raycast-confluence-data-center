import { Image } from "@raycast/api";
import type { ConfluenceSearchResult, ProcessedUserFields } from "../types";
import { CONFLUENCE_AVATAR_DIR, CONFLUENCE_ENTITY_TYPE, TYPE_ICONS } from "../constants";

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
  const userKey = user.userKey;
  const displayName = user.displayName;

  // 图标和头像
  const avatarUrl = user.profilePicture.path ? `${baseUrl}${user.profilePicture.path}` : null;
  const avatar = CONFLUENCE_AVATAR_DIR ? `${CONFLUENCE_AVATAR_DIR}/${userKey}.png` : avatarUrl;
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

    // URL 信息
    url,

    // 渲染信息
    subtitle,
    accessories,
  };
}
