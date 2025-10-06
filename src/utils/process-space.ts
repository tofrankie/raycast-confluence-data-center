import { CONFLUENCE_ENTITY_TYPE, SPACE_TYPE_LABELS, TYPE_ICONS } from "../constants";
import type { ConfluenceSearchResult, ConfluenceSpaceType, ProcessedSpaceItem } from "../types";

export function processSpaceItems(results: ConfluenceSearchResult[], baseUrl: string): ProcessedSpaceItem[] {
  return results
    .filter((result) => result.space && result.entityType === "space")
    .map((result) => processSpaceItem(result, baseUrl));
}

function processSpaceItem(result: ConfluenceSearchResult, baseUrl: string): ProcessedSpaceItem {
  const space = result.space!;

  // 基础信息
  const spaceKey = space.key || "";
  const spaceName = space.name || "";
  const spaceType = space.type || "";

  // 图标
  const icon = {
    value: TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.SPACE],
    tooltip: "Space",
  };

  // URL 信息
  const url = result.url ? `${baseUrl}${result.url}` : "";

  // 头像信息
  const avatarUrl = null; // 空间通常没有头像，使用默认图标
  const avatar = null;

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
    url,
    subtitle,
    accessories,
  };
}
