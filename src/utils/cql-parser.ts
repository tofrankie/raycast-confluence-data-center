import { CQL_PATTERNS } from "@/constants";
import type { CQLQuery } from "@/types";

export function isCQLSyntax(query: string) {
  if (!query || query.trim().length < 2) {
    return false;
  }

  const trimmedQuery = query.trim();

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

  const fieldPattern = /(\w+(?:\.\w+)*)\s*([=~!<>]+)\s*([^AND|OR|NOT]+?)(?=\s+(?:AND|OR|NOT|$))/gi;
  let match;

  while ((match = fieldPattern.exec(query)) !== null) {
    fields.push(match[1].trim());
    operators.push(match[2].trim());
    values.push(match[3].trim().replace(/^["']|["']$/g, ""));
  }

  return {
    fields,
    operators,
    values,
  };
}

export function validateCQL(query: string): { isValid: boolean; error?: string } {
  if (!isCQLSyntax(query)) {
    return { isValid: true };
  }

  try {
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      return { isValid: false, error: "Unmatched parentheses" };
    }

    const logicalOps = query.match(/\b(AND|OR|NOT)\b/g);
    if (logicalOps) {
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
