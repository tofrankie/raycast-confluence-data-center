import { Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import { CONFLUENCE_ENTITY_TYPE, SPACE_TYPE_LABELS, TYPE_ICONS, DEFAULT_AVATAR } from "@/constants";
import type { ConfluenceSearchResult, ConfluenceSpaceType, ProcessedConfluenceSpaceItem } from "@/types";

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

  const spaceKey = space.key || "";
  const spaceType = space.type || "";

  const url = space._links?.webui ? `${baseUrl}${space._links.webui}` : "";

  const avatarUrl = space.icon.path ? `${baseUrl}${space.icon.path}` : "";
  const avatarCacheKey = spaceKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : TYPE_ICONS[CONFLUENCE_ENTITY_TYPE.SPACE];

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
    renderKey: space.key,
    title: space.name,
    key: space.key,
    name: space.name,
    icon,
    subtitle,
    accessories,
    url,
    avatarUrl,
    avatarCacheKey,
  };
}
