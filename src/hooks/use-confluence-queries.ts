import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchContent, searchContentWithFilters, addToFavorites, removeFromFavorites } from "../utils";
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

export const useConfluenceSearchWithFilters = (query: string, filters: string[] = [], limit: number = 20) => {
  return useQuery<ConfluenceSearchContentResult[], Error>({
    queryKey: ["confluence-search-with-filters", query, filters],
    queryFn: () => searchContentWithFilters(query, filters, limit),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    retry: 0,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, isFavorited }: { contentId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeFromFavorites(contentId);
      } else {
        await addToFavorites(contentId);
      }
    },
    onMutate: async ({ contentId, isFavorited }) => {
      // 取消所有正在进行的查询，避免冲突
      await queryClient.cancelQueries({ queryKey: ["confluence-search"] });

      // 获取当前查询的缓存数据
      const previousData = queryClient.getQueriesData({ queryKey: ["confluence-search"] });

      // 乐观更新所有相关的查询缓存
      queryClient.setQueriesData(
        { queryKey: ["confluence-search"] },
        (old: ConfluenceSearchContentResult[] | undefined) => {
          if (!old) return old;

          return old.map((item) => {
            if (item.id === contentId) {
              return {
                ...item,
                metadata: {
                  ...item.metadata,
                  currentuser: {
                    ...item.metadata.currentuser,
                    favourited: {
                      isFavourite: !isFavorited,
                      favouritedDate: !isFavorited ? Date.now() : 0,
                    },
                  },
                },
              };
            }
            return item;
          });
        },
      );

      // 返回上下文，用于错误回滚
      return { previousData };
    },
    onError: (err, variables, context) => {
      // 发生错误时回滚到之前的状态
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // 无论成功还是失败，都重新获取数据以确保一致性
      queryClient.invalidateQueries({ queryKey: ["confluence-search"] });
    },
  });
};
