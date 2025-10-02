import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_SEARCH_PAGE_SIZE } from "../constants";
import { searchContentWithFilters, addToFavorites, removeFromFavorites } from "../utils";
import type { ConfluenceSearchContentResult, ConfluenceSearchContentResponse } from "../types";

export const useConfluenceSearchContent = (
  query: string,
  filters: string[] = [],
  searchPageSize: number = DEFAULT_SEARCH_PAGE_SIZE,
) => {
  return useInfiniteQuery<ConfluenceSearchContentResponse, Error>({
    queryKey: ["confluence-search", query, filters, searchPageSize],
    queryFn: async ({ pageParam }) => {
      const start = pageParam as number;
      const response = await searchContentWithFilters(query, filters, searchPageSize, start);
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 优先使用 _links.next 判断是否还有更多数据，这是最可靠的方式
      const hasNextLink = !!lastPage._links?.next;
      // 备用判断：使用 size 字段
      const hasMoreBySize = lastPage.size === searchPageSize;
      const hasMore = hasNextLink || hasMoreBySize;

      const nextPageParam = hasMore ? allPages.length * searchPageSize : undefined;
      return nextPageParam;
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1min
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
