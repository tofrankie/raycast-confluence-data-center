import { useCallback } from "react";
import type { ConfluenceSearchContentResult } from "../types";
import { useConfluencePreferences } from "./use-confluence-preferences";

export const useConfluenceUrls = () => {
  const { baseUrl } = useConfluencePreferences();

  const getContentUrl = useCallback(
    (contentResult: ConfluenceSearchContentResult) => {
      // Note: This link format is not valid for attachment type.
      // `${baseUrl}/pages/viewpage.action?pageId=${contentResult.id}`
      return `${baseUrl}${contentResult._links.webui}`;
    },
    [baseUrl],
  );

  const getContentEditUrl = useCallback(
    (contentResult: ConfluenceSearchContentResult) => {
      return `${baseUrl}/pages/editpage.action?pageId=${contentResult.id}`;
    },
    [baseUrl],
  );

  const getAuthorAvatarUrl = useCallback(
    (profilePicturePath: string) => {
      return `${baseUrl}${profilePicturePath}`;
    },
    [baseUrl],
  );

  return {
    getContentUrl,
    getContentEditUrl,
    getAuthorAvatarUrl,
    baseUrl,
  };
};
