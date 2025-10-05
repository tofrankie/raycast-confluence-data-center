import type { ConfluenceContentType, ConfluenceSearchContentResult, ProcessedContentFields } from "../types";
import { CONFLUENCE_CONTENT_TYPE, CONFLUENCE_AVATAR_DIR, CONTENT_ICONS, CONTENT_TYPE_LABELS } from "../constants";
import { Icon, Image } from "@raycast/api";

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
  const contentType = item.type as ConfluenceContentType;
  const icon = {
    value: CONTENT_ICONS[contentType] ?? "icon-unknown.svg",
    tooltip: CONTENT_TYPE_LABELS[contentType] ?? "Unknown",
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
  const creatorAvatarUrl = `${baseUrl}${item.history.createdBy.profilePicture.path}`;
  const creatorAvatar = CONFLUENCE_AVATAR_DIR
    ? `${CONFLUENCE_AVATAR_DIR}/${item.history.createdBy.userKey}.png`
    : creatorAvatarUrl;

  // 收藏状态
  const isFavourited = item.metadata.currentuser.favourited?.isFavourite ?? false;
  const favouritedAt = item.metadata.currentuser.favourited?.favouritedDate
    ? new Date(item.metadata.currentuser.favourited.favouritedDate).toISOString()
    : null;

  // 类型信息
  const type = item.type;
  const canEdit = item.type !== CONFLUENCE_CONTENT_TYPE.ATTACHMENT;
  const canFavorite = item.type !== CONFLUENCE_CONTENT_TYPE.ATTACHMENT;

  // 渲染信息 - accessories
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
        : `Updated at ${updatedAt.toLocaleString()} by ${updater}\nCreated at ${createdAt.toLocaleString()} by ${creator}`,
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
    accessories,
  };
}
