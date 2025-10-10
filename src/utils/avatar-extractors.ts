import type {
  AvatarList,
  ProcessedConfluenceUserItem,
  ProcessedConfluenceSpaceItem,
  ProcessedConfluenceContentItem,
} from "@/types";

export const extractUserAvatar = <T extends { avatarUrl: string; avatarCacheKey?: string }>(items: T[]): AvatarList =>
  items
    .filter((item) => item.avatarUrl && item.avatarCacheKey)
    .map((item) => ({ url: item.avatarUrl, key: item.avatarCacheKey! }));

export const extractCreatorAvatar = <T extends { creatorAvatarUrl: string; creatorAvatarCacheKey?: string }>(
  items: T[],
): AvatarList =>
  items
    .filter((item) => item.creatorAvatarUrl && item.creatorAvatarCacheKey)
    .map((item) => ({ url: item.creatorAvatarUrl, key: item.creatorAvatarCacheKey! }));

export const avatarExtractors = {
  confluenceUser: (items: ProcessedConfluenceUserItem[]): AvatarList => extractUserAvatar(items),
  confluenceSpace: (items: ProcessedConfluenceSpaceItem[]): AvatarList => extractUserAvatar(items),
  confluenceContentCreator: (items: ProcessedConfluenceContentItem[]): AvatarList => extractCreatorAvatar(items),
} as const;
