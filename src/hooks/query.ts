import { useCallback } from "react";
import { processUserInputAndFilter, buildQuery } from "../utils/query";
import { QueryType, ProcessUserInputParams } from "../types/query";

/**
 * 查询处理器的 React Hook
 * @param queryType 查询类型：'JQL' 或 'CQL'
 * @returns 包含查询处理方法的对象
 */
export function useQueryProcessor(queryType: QueryType) {
  const processQuery = useCallback(
    (params: Omit<ProcessUserInputParams, "queryType">) => {
      return processUserInputAndFilter({
        ...params,
        queryType,
      });
    },
    [queryType],
  );

  const buildFinalQuery = useCallback(
    (result: ReturnType<typeof processUserInputAndFilter>, defaultOrderBy?: string) => {
      // 如果返回字符串，直接返回（完整查询且有 ORDER BY）
      if (typeof result === "string") {
        return result;
      }

      // 否则调用 buildQuery 构建最终查询
      return buildQuery({
        ...result,
        orderBy: result.orderBy || defaultOrderBy,
        queryType,
      });
    },
    [queryType],
  );

  return { processQuery, buildFinalQuery };
}
