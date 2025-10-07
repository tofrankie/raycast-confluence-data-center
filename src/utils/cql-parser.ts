import { CQLQuery } from "../types";
import { CQL_PATTERNS } from "../constants";

export function isCQLSyntax(query: string): boolean {
  if (!query || query.trim().length < 2) {
    return false;
  }

  const trimmedQuery = query.trim();

  // 检查是否包含 CQL 语法特征
  return CQL_PATTERNS.some((pattern) => pattern.test(trimmedQuery));
}

export function parseCQL(query: string): CQLQuery {
  const isCQL = isCQLSyntax(query);

  if (!isCQL) {
    return {
      raw: query,
      isCQL: false,
    };
  }

  const parsed = extractCQLElements(query);

  return {
    raw: query,
    isCQL: true,
    parsed,
  };
}

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

// JQL (Jira Query Language) 解析函数
export function parseJQL(query: string): CQLQuery {
  if (!query || query.trim().length < 2) {
    return {
      raw: query,
      isCQL: false,
    };
  }

  const trimmedQuery = query.trim();
  
  // JQL 语法特征检查
  const jqlPatterns = [
    // 字段操作符
    /^\s*\w+\s*[=~!<>]/,
    // 逻辑操作符
    /\b(AND|OR|NOT)\b/,
    // 函数
    /currentUser\(\)/,
    /now\(\)/,
    // 排序
    /ORDER\s+BY\s+\w+/i,
    // 项目键
    /project\s*=\s*[A-Z]+/i,
    // 状态
    /status\s*[=~]/i,
    // 分配人
    /assignee\s*[=~]/i,
    // 报告人
    /reporter\s*[=~]/i,
    // 文本搜索
    /text\s*~|summary\s*~|description\s*~/i,
  ];

  const isJQL = jqlPatterns.some(pattern => pattern.test(trimmedQuery));

  if (!isJQL) {
    return {
      raw: query,
      isCQL: false,
    };
  }

  const parsed = extractJQLElements(query);

  return {
    raw: query,
    isCQL: true,
    parsed,
  };
}

function extractJQLElements(query: string) {
  const fields: string[] = [];
  const operators: string[] = [];
  const values: string[] = [];

  // 匹配字段操作符值的模式
  const fieldPattern = /(\w+(?:\.\w+)*)\s*([=~!<>]+)\s*([^AND|OR|NOT]+?)(?=\s+(?:AND|OR|NOT|ORDER\s+BY|$))/gi;
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
