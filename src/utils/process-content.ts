import { Icon, Image } from "@raycast/api";
import { avatarCache } from "./avatar";
import { CONFLUENCE_CONTENT_TYPE, DEFAULT_AVATAR, TYPE_ICONS, TYPE_LABELS } from "../constants";
import type { ConfluenceSearchContentResult, IconType, ProcessedContentFields } from "../types";

export function processContentItems(items: ConfluenceSearchContentResult[], baseUrl: string) {
  return items.map((item) => ({
    ...item,
    ...processContentItem(item, baseUrl),
  }));
}

function processContentItem(item: ConfluenceSearchContentResult, baseUrl: string): ProcessedContentFields {
  // 基础信息
  const id = item.id;
  const title = item.title;
  const spaceName = item.space?.name || "";

  // 图标和类型
  const iconType = item.type as IconType;
  const icon = {
    value: TYPE_ICONS[iconType] ?? "icon-unknown.svg",
    tooltip: TYPE_LABELS[iconType] ?? "Unknown",
  };

  // URL 字段
  const url = `${baseUrl}${item._links.webui}`;
  const editUrl = `${baseUrl}/pages/editpage.action?pageId=${item.id}`;
  const spaceUrl = `${baseUrl}${item.space._links.webui}`;

  // 时间字段
  const createdAt = new Date(item.history.createdDate);
  const updatedAt = new Date(item.history.lastUpdated.when);
  const isSingleVersion = item.history.lastUpdated?.when === item.history.createdDate;

  // 用户信息
  const creator = item.history.createdBy.displayName;
  const updater = item.history.lastUpdated.by.displayName;
  // Anonymous users may not have userKey
  const creatorUserKey = item.history.createdBy.userKey;

  // 头像信息
  const creatorAvatarUrl = `${baseUrl}${item.history.createdBy.profilePicture.path}`;
  const creatorAvatarCacheKey = creatorUserKey;
  const creatorAvatar = (creatorAvatarCacheKey && avatarCache.get(creatorAvatarCacheKey)) ?? DEFAULT_AVATAR;

  // 收藏状态
  const isFavourited = item.metadata.currentuser.favourited?.isFavourite ?? false;
  const favouritedAt = item.metadata.currentuser.favourited?.favouritedDate
    ? new Date(item.metadata.currentuser.favourited.favouritedDate).toISOString()
    : null;

  // 类型信息
  const EDITABLE_TYPES = [CONFLUENCE_CONTENT_TYPE.PAGE, CONFLUENCE_CONTENT_TYPE.BLOGPOST] as const;
  const type = item.type as (typeof EDITABLE_TYPES)[number];
  const canEdit = EDITABLE_TYPES.includes(type);
  const canFavorite = EDITABLE_TYPES.includes(type);

  // 渲染信息
  const subtitle = { value: spaceName, tooltip: `Space ${spaceName}` };
  const accessories = [
    ...(isFavourited
      ? [
          {
            icon: Icon.Star,
            tooltip: `Favourited at ${favouritedAt ? new Date(favouritedAt).toLocaleString() : ""}`,
          },
        ]
      : []),
    {
      date: updatedAt,
      tooltip: isSingleVersion
        ? `Created at ${createdAt.toLocaleString()} by ${creator}`
        : `Created at ${createdAt.toLocaleString()} by ${creator}\nUpdated at ${updatedAt.toLocaleString()} by ${updater}`,
    },
    ...(creatorAvatar
      ? [
          {
            icon: { source: creatorAvatar, mask: Image.Mask.Circle },
            tooltip: `Created by ${creator}`,
          },
        ]
      : []),
  ];

  return {
    // 基础信息
    id,
    title,
    spaceName,

    // 图标和类型
    icon,

    // 时间信息
    updatedAt,
    createdAt,
    isSingleVersion,

    // 用户信息
    creator,
    updater,
    creatorAvatar,
    creatorAvatarUrl,
    creatorAvatarCacheKey,

    // 收藏状态
    isFavourited,
    favouritedAt,

    // URL 信息
    url,
    editUrl,
    spaceUrl,

    // 类型信息
    type,
    canEdit,
    canFavorite,

    // 渲染信息
    subtitle,
    accessories,
  };
}
