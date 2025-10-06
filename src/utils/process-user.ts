import { Image } from "@raycast/api";
import type { ConfluenceSearchResult, ProcessedUserFields } from "../types";
import { CONFLUENCE_AVATAR_DIR, CONFLUENCE_ENTITY_TYPE, TYPE_ICONS, TYPE_LABELS } from "../constants";

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
  const icon = {
    value: TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.USER],
    tooltip: TYPE_LABELS[CONFLUENCE_ENTITY_TYPE.USER],
  };
  const avatarUrl = user.profilePicture.path ? `${baseUrl}${user.profilePicture.path}` : null;
  const avatar = CONFLUENCE_AVATAR_DIR ? `${CONFLUENCE_AVATAR_DIR}/${userKey}.png` : avatarUrl;

  // URL 信息 TODO: 打开空间主页
  const url = `${baseUrl}${item.url}`;

  // 渲染信息
  const subtitle = { value: username, tooltip: `Username ${username}` };
  const accessories = [
    ...(avatar
      ? [
          {
            icon: { source: avatar, mask: Image.Mask.Circle },
          },
        ]
      : []),
  ];

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
