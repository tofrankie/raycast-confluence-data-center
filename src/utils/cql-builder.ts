import { isCQLSyntax } from "./index";
import { SEARCH_FILTERS } from "../constants";

export function buildCQL(userInput: string, filters: string[]) {
  const isCQL = isCQLSyntax(userInput);

  let cql: string;
  if (isCQL) {
    // 用户输入的是 CQL 语法 + 过滤选项
    cql = combineCQLWithFilters(userInput, filters);
  } else {
    // 用户输入的是普通文本 + 过滤选项
    cql = buildTextCQL(userInput, filters);
  }

  const processedCQL = transformCQL(cql, filters);
  const optimizedCQL = formatCQL(processedCQL);
  return optimizedCQL;
}

function combineCQLWithFilters(cql: string, filters: string[]) {
  const filterCQL = buildCQLWithFilters(filters);
  if (filterCQL) {
    // TODO: 去重处理
    return `(${cql}) AND ${filterCQL}`;
  }
  return cql;
}

function buildTextCQL(text: string, filters: string[]) {
  const filterCQL = buildCQLWithFilters(filters);
  if (filterCQL) {
    return `text ~ "${text}" AND ${filterCQL}`;
  }
  return `text ~ "${text}"`;
}

function buildCQLWithFilters(filters: string[]) {
  if (!filters || filters.length === 0) {
    return "";
  }

  const filterCQLs = filters
    .map((filterId) => {
      const filter = SEARCH_FILTERS.find((f) => f.id === filterId);
      return filter?.cql;
    })
    .filter((cql): cql is string => Boolean(cql));

  if (filterCQLs.length === 0) {
    return "";
  }

  if (filterCQLs.length === 1) {
    return filterCQLs[0];
  }

  return `(${filterCQLs.join(" AND ")})`;
}

function transformCQL(query: string, filters: string[]) {
  let processedQuery = query;

  filters.forEach((filterId) => {
    const filter = SEARCH_FILTERS.find((f) => f.id === filterId);
    if (filter?.transform) {
      processedQuery = filter.transform(processedQuery);
    }
  });

  return processedQuery;
}

function formatCQL(query: string) {
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

export function testQueryCombinations() {
  console.log("🧪 Testing Query Combinations:");

  // 测试用例 1: 普通文本 + 创建者过滤
  const test1 = buildCQL("svg", ["creator"]);
  console.log("Test 1 - Text + Creator:", test1);
  // 期望: text ~ "svg" AND creator = currentUser()

  // 测试用例 2: CQL 语法 + 创建者过滤
  const test2 = buildCQL('type = "page"', ["creator"]);
  console.log("Test 2 - CQL + Creator:", test2);
  // 期望: (type = "page") AND creator = currentUser()

  // 测试用例 3: 普通文本 + 收藏过滤
  const test3 = buildCQL("meeting", ["favourite"]);
  console.log("Test 3 - Text + Favourite:", test3);
  // 期望: text ~ "meeting" AND favourite = currentUser()

  // 测试用例 3.1: 普通文本 + 贡献者过滤
  const test3_1 = buildCQL("documentation", ["contributor"]);
  console.log("Test 3.1 - Text + Contributor:", test3_1);
  // 期望: text ~ "documentation" AND contributor = currentUser()

  // 测试用例 4: CQL 语法 + 无过滤
  const test4 = buildCQL('space = "DEV"', []);
  console.log("Test 4 - CQL + No Filter:", test4);
  // 期望: space = "DEV"

  // 测试用例 5: 普通文本 + 无过滤
  const test5 = buildCQL("documentation", []);
  console.log("Test 5 - Text + No Filter:", test5);
  // 期望: text ~ "documentation"

  // 测试用例 6: 普通文本 + title-only 过滤
  const test6 = buildCQL("proto", ["title-only"]);
  console.log("Test 6 - Text + Title Only:", test6);
  // 期望: title ~ "proto"

  // 测试用例 7: CQL 语法 + title-only 过滤
  const test7 = buildCQL('type = "page"', ["title-only"]);
  console.log("Test 7 - CQL + Title Only:", test7);
  // 期望: (type = "page") AND title ~ "xxx" (这里可能需要进一步调整)
}
