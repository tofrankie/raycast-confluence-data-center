import { Image } from "@raycast/api";
import { avatarCache } from "./avatar";
import { CONFLUENCE_ENTITY_TYPE, SPACE_TYPE_LABELS, TYPE_ICONS, DEFAULT_AVATAR } from "../constants";
import type { ConfluenceSearchResult, ConfluenceSpaceType, ProcessedConfluenceSpaceItem } from "../types";

export function processConfluenceSearchSpaceItems(
  results: ConfluenceSearchResult[],
  baseUrl: string,
): ProcessedConfluenceSpaceItem[] {
  return results
    .filter((result) => result.space && result.entityType === "space")
    .map((result) => processConfluenceSearchSpaceItem(result, baseUrl));
}

function processConfluenceSearchSpaceItem(
  result: ConfluenceSearchResult,
  baseUrl: string,
): ProcessedConfluenceSpaceItem {
  const space = result.space!;

  // 基础信息
  const spaceKey = space.key || "";
  const spaceName = space.name || "";
  const spaceType = space.type || "";

  // URL 信息
  const url = space._links?.webui ? `${baseUrl}${space._links.webui}` : "";

  // 头像信息
  const avatarUrl = space.icon.path ? `${baseUrl}${space.icon.path}` : "";
  const avatarCacheKey = spaceKey ? `space-${spaceKey}` : undefined;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  // 图标
  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.SPACE];

  // 渲染信息
  const description = space.description?.plain?.value || "";
  const subtitle = {
    value: description || spaceKey,
    tooltip: description ? `Space Description` : `Space Key`,
  };
  const spaceTypeLabel = SPACE_TYPE_LABELS[spaceType as ConfluenceSpaceType] ?? spaceType;
  const accessories = [
    {
      text: spaceTypeLabel,
      tooltip: `Space Type`,
    },
  ];

  return {
    ...space,
    spaceKey,
    spaceName,
    spaceType,
    icon,
    avatarUrl,
    avatar,
    avatarCacheKey,
    url,
    subtitle,
    accessories,
  } as ProcessedConfluenceSpaceItem;
}
