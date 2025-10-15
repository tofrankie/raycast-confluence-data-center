/**
 * 查询构建器使用示例
 * 这个文件展示了如何使用新的查询构建器功能
 */

import { buildQuery, processUserInputAndFilter } from "../utils/query";
import { IGNORE_FILTER } from "../constants/query";
import type { SearchFilter } from "../types/search-bar-accessory";

// 示例 1: 基本查询构建
function example1() {
  console.log("=== 示例 1: 基本查询构建 ===");

  const result = buildQuery({
    clauses: ["project = 'TEST'", "status = 'Open'"],
    logicOperator: "AND",
    queryType: "JQL",
  });

  console.log("结果:", result);
  // 输出: project = 'TEST' AND status = 'Open'
}

// 示例 2: 带 ORDER BY 的查询
function example2() {
  console.log("=== 示例 2: 带 ORDER BY 的查询 ===");

  const result = buildQuery({
    clauses: ["project = 'TEST'"],
    logicOperator: "AND",
    orderBy: " ORDER BY created DESC",
    queryType: "JQL",
  });

  console.log("结果:", result);
  // 输出: project = 'TEST' ORDER BY created DESC
}

// 示例 3: 处理用户输入和 filter
function example3() {
  console.log("=== 示例 3: 处理用户输入和 filter ===");

  const filter: SearchFilter = {
    id: "test-filter",
    query: "project = 'PROD'",
    orderBy: " ORDER BY updated DESC",
  };

  const result = processUserInputAndFilter({
    userInput: "test",
    filter,
    buildClauseFromText: (input) => `text ~ "${input}"`,
    queryType: "JQL",
  });

  console.log("结果:", result);
  // 输出: { clauses: ['text ~ "test"', "project = 'PROD'"], logicOperator: "AND", orderBy: " ORDER BY updated DESC" }
}

// 示例 4: 完整查询处理
function example4() {
  console.log("=== 示例 4: 完整查询处理 ===");

  const filter: SearchFilter = {
    id: "test-filter",
    query: "project = 'PROD'",
    orderBy: " ORDER BY updated DESC",
  };

  const result = processUserInputAndFilter({
    userInput: "project = 'TEST' ORDER BY created DESC",
    filter,
    buildClauseFromText: (input) => `text ~ "${input}"`,
    queryType: "JQL",
  });

  console.log("结果:", result);
  // 输出: "project = 'TEST' ORDER BY created DESC" (直接返回完整查询)
}

// 示例 5: 忽略 filter
function example5() {
  console.log("=== 示例 5: 忽略 filter ===");

  const filter: SearchFilter = {
    id: "test-filter",
    query: "project = 'PROD'",
    orderBy: " ORDER BY updated DESC",
  };

  const effectiveFilter = IGNORE_FILTER ? undefined : filter;

  const result = processUserInputAndFilter({
    userInput: "test",
    filter: effectiveFilter,
    buildClauseFromText: (input) => `text ~ "${input}"`,
    queryType: "JQL",
  });

  console.log("结果:", result);
  // 输出: { clauses: ['text ~ "test"', ""], logicOperator: "AND", orderBy: undefined }
}

// 运行所有示例
export function runExamples() {
  example1();
  example2();
  example3();
  example4();
  example5();
}
