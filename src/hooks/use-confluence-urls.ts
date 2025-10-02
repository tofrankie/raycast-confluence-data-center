import { useCallback } from "react";
import type { ConfluenceSearchContentResult } from "../types";
import { useConfluenceConfig } from "./use-confluence-config";

export const useConfluenceUrls = () => {
  const config = useConfluenceConfig();

  const getContentUrl = useCallback(
    (contentResult: ConfluenceSearchContentResult) => {
      if (!config) return null;
      // Note: This link format is not valid for attachment type.
      // `${config.baseUrl}/pages/viewpage.action?pageId=${contentResult.id}`
      return `${config.baseUrl}${contentResult._links.webui}`;
    },
    [config],
  );

  const getContentEditUrl = useCallback(
    (contentResult: ConfluenceSearchContentResult) => {
      if (!config) return null;
      return `${config.baseUrl}/pages/editpage.action?pageId=${contentResult.id}`;
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
    getContentEditUrl,
    getAuthorAvatarUrl,
    baseUrl: config?.baseUrl || null,
  };
};
