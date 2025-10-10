import { Icon, Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import { CONFLUENCE_CONTENT_TYPE, DEFAULT_AVATAR, TYPE_ICONS, TYPE_LABELS } from "@/constants";
import type { ConfluenceSearchContentResult, IconType, ProcessedConfluenceContentItem } from "@/types";

export function processConfluenceSearchContentItems(
  items: ConfluenceSearchContentResult[],
  baseUrl: string,
): ProcessedConfluenceContentItem[] {
  return items.map((item) => processConfluenceSearchContentItem(item, baseUrl));
}

function processConfluenceSearchContentItem(
  item: ConfluenceSearchContentResult,
  baseUrl: string,
): ProcessedConfluenceContentItem {
  const id = item.id;
  const title = item.title;
  const spaceName = item.space?.name || "";

  const iconType = item.type as IconType;
  const icon = {
    value: TYPE_ICONS[iconType] ?? "icon-unknown.svg",
    tooltip: TYPE_LABELS[iconType] ?? "Unknown",
  };

  const url = `${baseUrl}${item._links.webui}`;
  const editUrl = `${baseUrl}/pages/editpage.action?pageId=${item.id}`;
  const spaceUrl = `${baseUrl}${item.space._links.webui}`;

  const createdAt = new Date(item.history.createdDate);
  const updatedAt = new Date(item.history.lastUpdated.when);
  const isSingleVersion = item.history.lastUpdated?.when === item.history.createdDate;

  const creator = item.history.createdBy.displayName;
  const updater = item.history.lastUpdated.by.displayName;
  // Anonymous user may not have userKey
  const creatorUserKey = item.history.createdBy.userKey;

  const creatorAvatarUrl = `${baseUrl}${item.history.createdBy.profilePicture.path}`;
  const creatorAvatarCacheKey = creatorUserKey;
  const creatorAvatar = (creatorAvatarCacheKey && avatarCache.get(creatorAvatarCacheKey)) ?? DEFAULT_AVATAR;

  const isFavourited = item.metadata.currentuser.favourited?.isFavourite ?? false;
  const favouritedAt = item.metadata.currentuser.favourited?.favouritedDate
    ? new Date(item.metadata.currentuser.favourited.favouritedDate).toISOString()
    : null;

  const EDITABLE_TYPES = [CONFLUENCE_CONTENT_TYPE.PAGE, CONFLUENCE_CONTENT_TYPE.BLOGPOST] as const;
  const type = item.type as (typeof EDITABLE_TYPES)[number];
  const canEdit = EDITABLE_TYPES.includes(type);
  const canFavorite = EDITABLE_TYPES.includes(type);

  const subtitle = { value: spaceName, tooltip: "Space" };
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
    renderKey: id,
    title,
    id,
    icon,
    subtitle,
    accessories,
    canEdit,
    canFavorite,
    isFavourited,
    url,
    editUrl,
    spaceUrl,
    spaceName,
    creatorAvatarUrl,
    creatorAvatarCacheKey,
  };
}
