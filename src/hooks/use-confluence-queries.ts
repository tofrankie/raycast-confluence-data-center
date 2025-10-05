import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_SEARCH_PAGE_SIZE, COMMAND_NAMES } from "../constants";
import { searchContent, addToFavorites, removeFromFavorites } from "../utils";
import { processContentItems } from "../utils/process-content";
import type { InfiniteData } from "@tanstack/react-query";
import type { ConfluenceSearchContentResponse, ProcessedContentItem } from "../types";

export const useConfluenceSearchContent = (
  cql: string,
  searchPageSize: number = DEFAULT_SEARCH_PAGE_SIZE,
  baseUrl: string,
) => {
  return useInfiniteQuery<
    ConfluenceSearchContentResponse,
    Error,
    {
      items: ProcessedContentItem[];
      hasMore: boolean;
    }
  >({
    enabled: cql.length >= 2,
    queryKey: [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT, { cql, pageSize: searchPageSize }],
    queryFn: async ({ pageParam }) => {
      const start = pageParam as number;
      const response = await searchContent(cql, searchPageSize, start);
      return response;
    },
    select: (data) => {
      const items = data.pages.flatMap((page) => processContentItems(page.results, baseUrl));
      const hasMore = data.pages.length > 0 ? !!data.pages[data.pages.length - 1]?._links?.next : false;

      return {
        items,
        hasMore,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      const nextPageParam = hasNextLink ? allPages.length * searchPageSize : undefined;
      return nextPageParam;
    },
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
      await queryClient.cancelQueries({ queryKey: [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT] });

      // 获取当前查询的缓存数据
      const previousData = queryClient.getQueriesData({ queryKey: [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT] });

      // 乐观更新所有相关的查询缓存
      queryClient.setQueriesData(
        { queryKey: [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT] },
        (old: InfiniteData<ConfluenceSearchContentResponse> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((item) =>
                item.id === contentId
                  ? {
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
                    }
                  : item,
              ),
            })),
          };
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
      queryClient.invalidateQueries({ queryKey: [COMMAND_NAMES.CONFLUENCE_SEARCH_CONTENT] });
    },
  });
};
