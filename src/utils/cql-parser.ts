import { CQLQuery } from "../types";
import { CQL_PATTERNS } from "../constants";

/**
 * 检测输入是否为 CQL 语法
 */
export function isCQLSyntax(query: string): boolean {
  if (!query || query.trim().length < 2) {
    return false;
  }

  const trimmedQuery = query.trim();

  // 检查是否包含 CQL 语法特征
  return CQL_PATTERNS.some((pattern) => pattern.test(trimmedQuery));
}

/**
 * 解析 CQL 查询
 */
export function parseCQL(query: string): CQLQuery {
  const isCQL = isCQLSyntax(query);

  if (!isCQL) {
    return {
      raw: query,
      isCQL: false,
    };
  }

  // 简单的 CQL 解析 - 提取字段、操作符和值
  const parsed = extractCQLElements(query);

  return {
    raw: query,
    isCQL: true,
    parsed,
  };
}

/**
 * 提取 CQL 查询中的元素
 */
function extractCQLElements(query: string) {
  const fields: string[] = [];
  const operators: string[] = [];
  const values: string[] = [];

  // 匹配字段操作符值的模式
  const fieldPattern = /(\w+(?:\.\w+)*)\s*([=~!<>]+)\s*([^AND|OR|NOT]+?)(?=\s+(?:AND|OR|NOT|$))/gi;
  let match;

  while ((match = fieldPattern.exec(query)) !== null) {
    fields.push(match[1].trim());
    operators.push(match[2].trim());
    values.push(match[3].trim().replace(/^["']|["']$/g, "")); // 移除引号
  }

  return {
    fields,
    operators,
    values,
  };
}

/**
 * 验证 CQL 语法是否正确
 */
export function validateCQL(query: string): { isValid: boolean; error?: string } {
  if (!isCQLSyntax(query)) {
    return { isValid: true }; // 不是 CQL 语法，视为有效
  }

  try {
    // 基本的语法检查
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      return { isValid: false, error: "Unmatched parentheses" };
    }

    // 检查逻辑操作符的使用
    const logicalOps = query.match(/\b(AND|OR|NOT)\b/g);
    if (logicalOps) {
      // 确保逻辑操作符前后有适当的条件
      const conditions = query.split(/\b(AND|OR|NOT)\b/);
      if (conditions.length < 3) {
        return { isValid: false, error: "Invalid logical operator usage" };
      }
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "CQL syntax error" };
  }
}
