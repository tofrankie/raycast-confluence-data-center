import { useQuery } from "@tanstack/react-query";
import { searchContent } from "../utils";
import type { ConfluenceSearchContentResult } from "../types";

export const useConfluenceSearch = (query: string, limit: number = 20) => {
  return useQuery<ConfluenceSearchContentResult[], Error>({
    queryKey: ["confluence-search", query],
    queryFn: () => searchContent(query, limit),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};
