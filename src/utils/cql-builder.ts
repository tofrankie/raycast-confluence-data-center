import { isCQLSyntax } from "@/utils";
import type { SearchFilter } from "@/types";

export function buildCQL(userInput: string, filters: SearchFilter[]) {
  const isCQL = isCQLSyntax(userInput);

  const cql = isCQL ? combineCQLWithFilters(userInput, filters) : buildTextCQL(userInput, filters);

  const processedCQL = transformCQL(cql, userInput, filters);

  const optimizedCQL = formatCQL(processedCQL);
  return optimizedCQL;
}

function combineCQLWithFilters(cql: string, filters: SearchFilter[]) {
  const filterCQL = buildCQLWithFilters(filters);
  if (filterCQL) {
    // TODO: 去重处理
    return `(${cql}) AND ${filterCQL}`;
  }
  return cql;
}

function buildTextCQL(text: string, filters: SearchFilter[]) {
  const filterCQL = buildCQLWithFilters(filters);
  if (filterCQL) {
    return `text ~ "${text}" AND ${filterCQL}`;
  }
  return `text ~ "${text}"`;
}

function buildCQLWithFilters(filters: SearchFilter[]) {
  if (!filters.length) {
    return "";
  }

  const filterCQLs = filters.map((filter) => filter.query).filter((query): query is string => Boolean(query));

  if (!filterCQLs.length) {
    return "";
  }

  if (filterCQLs.length === 1) {
    return filterCQLs[0];
  }

  return `(${filterCQLs.join(" AND ")})`;
}

function transformCQL(cql: string, userInput: string, filters: SearchFilter[]) {
  let processedCql = cql;

  filters.forEach((filter) => {
    if (filter.transform) {
      processedCql = filter.transform(processedCql, { userInput, filter });
    }
  });

  return processedCql;
}

function formatCQL(cql: string) {
  // 移除多余的空格
  let optimizedCql = cql.replace(/\s+/g, " ").trim();

  // 移除多余的括号
  optimizedCql = optimizedCql.replace(/\(\s*\(/g, "(");
  optimizedCql = optimizedCql.replace(/\)\s*\)/g, ")");

  // 确保逻辑操作符前后有空格
  optimizedCql = optimizedCql.replace(/\b(AND|OR|NOT)\b/g, " $1 ");

  // 验证括号匹配
  const openParens = (optimizedCql.match(/\(/g) || []).length;
  const closeParens = (optimizedCql.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    console.warn("CQL parentheses mismatch:", optimizedCql);
    // 如果括号不匹配，尝试修复
    if (openParens > closeParens) {
      optimizedCql += ")".repeat(openParens - closeParens);
    }
  }

  return optimizedCql.trim();
}
