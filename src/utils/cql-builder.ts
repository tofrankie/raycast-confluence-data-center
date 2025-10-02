import { CQLParser } from "./cql-parser";
import { SEARCH_FILTERS } from "../constants/search";

/**
 * 构建搜索查询
 */
export function buildSearchQuery(userInput: string, filters: string[]): string {
  const isCQL = CQLParser.isCQLSyntax(userInput);

  console.log("🔍 buildSearchQuery:", { userInput, filters, isCQL });

  if (isCQL) {
    // 用户输入的是 CQL 语法 + 过滤选项
    const result = combineCQLWithFilters(userInput, filters);
    console.log("🔍 CQL + Filter result:", result);
    return result;
  } else {
    // 用户输入的是普通文本 + 过滤选项
    const result = buildTextSearchQuery(userInput, filters);
    console.log("🔍 Text + Filter result:", result);
    return result;
  }
}

/**
 * 将 CQL 查询与过滤选项结合
 */
function combineCQLWithFilters(cql: string, filters: string[]): string {
  const filterCQL = buildFilterCQL(filters);
  if (filterCQL) {
    // 单项选择：直接组合，不需要额外的括号
    return `(${cql}) AND ${filterCQL}`;
  }
  return cql;
}

/**
 * 构建文本搜索查询
 */
function buildTextSearchQuery(text: string, filters: string[]): string {
  // 检查是否是 title-only 过滤选项
  const isTitleOnly = filters.includes("title-only");

  if (isTitleOnly) {
    // title-only 只需要修改搜索字段，不需要额外的过滤条件
    return `title ~ "${text}"`;
  }

  // 其他过滤选项需要添加额外的过滤条件
  const filterCQL = buildFilterCQL(filters);
  if (filterCQL) {
    return `text ~ "${text}" AND ${filterCQL}`;
  }
  return `text ~ "${text}"`;
}

/**
 * 根据过滤选项构建 CQL 查询
 */
function buildFilterCQL(filters: string[]): string {
  if (!filters || filters.length === 0) {
    return "";
  }

  // 单项选择：只取第一个过滤选项
  const filterId = filters[0];
  const filter = SEARCH_FILTERS.find((f) => f.id === filterId);

  console.log("🔍 buildFilterCQL:", { filters, filterId, filter });

  if (!filter) {
    return "";
  }

  // 特殊处理 title-only 过滤选项
  if (filterId === "title-only") {
    return ""; // title-only 不需要额外的 CQL，它会在 processSpecialFilters 中处理
  }

  return filter.cql;
}

/**
 * 处理特殊过滤选项（如 title-only）
 */
export function processSpecialFilters(query: string, filters: string[]): string {
  const titleOnlyFilter = filters.find((f) => f === "title-only");

  if (titleOnlyFilter) {
    // 如果选择了 title-only，将 text 搜索改为 title 搜索
    return query.replace(/text ~ "/g, 'title ~ "');
  }

  return query;
}

/**
 * 清理和优化 CQL 查询
 */
export function optimizeCQLQuery(query: string): string {
  // 移除多余的空格
  let optimized = query.replace(/\s+/g, " ").trim();

  // 移除多余的括号
  optimized = optimized.replace(/\(\s*\(/g, "(");
  optimized = optimized.replace(/\)\s*\)/g, ")");

  // 确保逻辑操作符前后有空格
  optimized = optimized.replace(/\b(AND|OR|NOT)\b/g, " $1 ");

  // 验证括号匹配
  const openParens = (optimized.match(/\(/g) || []).length;
  const closeParens = (optimized.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    console.warn("CQL query parentheses mismatch:", optimized);
    // 如果括号不匹配，尝试修复
    if (openParens > closeParens) {
      optimized += ")".repeat(openParens - closeParens);
    }
  }

  return optimized.trim();
}

/**
 * 测试函数：验证各种查询组合
 */
export function testQueryCombinations() {
  console.log("🧪 Testing Query Combinations:");

  // 测试用例 1: 普通文本 + 创建者过滤
  const test1 = buildSearchQuery("svg", ["creator"]);
  console.log("Test 1 - Text + Creator:", test1);
  // 期望: text ~ "svg" AND creator = currentUser()

  // 测试用例 2: CQL 语法 + 创建者过滤
  const test2 = buildSearchQuery('type = "page"', ["creator"]);
  console.log("Test 2 - CQL + Creator:", test2);
  // 期望: (type = "page") AND creator = currentUser()

  // 测试用例 3: 普通文本 + 收藏过滤
  const test3 = buildSearchQuery("meeting", ["favourite"]);
  console.log("Test 3 - Text + Favourite:", test3);
  // 期望: text ~ "meeting" AND favourite = currentUser()

  // 测试用例 3.1: 普通文本 + 贡献者过滤
  const test3_1 = buildSearchQuery("documentation", ["contributor"]);
  console.log("Test 3.1 - Text + Contributor:", test3_1);
  // 期望: text ~ "documentation" AND contributor = currentUser()

  // 测试用例 4: CQL 语法 + 无过滤
  const test4 = buildSearchQuery('space = "DEV"', []);
  console.log("Test 4 - CQL + No Filter:", test4);
  // 期望: space = "DEV"

  // 测试用例 5: 普通文本 + 无过滤
  const test5 = buildSearchQuery("documentation", []);
  console.log("Test 5 - Text + No Filter:", test5);
  // 期望: text ~ "documentation"

  // 测试用例 6: 普通文本 + title-only 过滤
  const test6 = buildSearchQuery("proto", ["title-only"]);
  console.log("Test 6 - Text + Title Only:", test6);
  // 期望: title ~ "proto"

  // 测试用例 7: CQL 语法 + title-only 过滤
  const test7 = buildSearchQuery('type = "page"', ["title-only"]);
  console.log("Test 7 - CQL + Title Only:", test7);
  // 期望: (type = "page") AND title ~ "xxx" (这里可能需要进一步调整)
}
