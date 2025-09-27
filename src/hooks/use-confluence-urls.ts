import { useCallback } from "react";
import { useConfluenceConfig } from "./use-confluence-config";

export const useConfluenceUrls = () => {
  const config = useConfluenceConfig();

  const getContentUrl = useCallback(
    (contentId: string) => {
      if (!config) return null;
      return `${config.baseUrl}/pages/viewpage.action?pageId=${contentId}`;
    },
    [config],
  );

  const getAuthorAvatarUrl = useCallback(
    (profilePicturePath: string) => {
      if (!config) return null;
      return `${config.baseUrl}${profilePicturePath}`;
    },
    [config],
  );

  return {
    getContentUrl,
    getAuthorAvatarUrl,
    baseUrl: config?.baseUrl || null,
  };
};
