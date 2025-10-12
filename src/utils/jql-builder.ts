import { isJQLSyntax } from "@/utils";
import type { SearchFilter } from "@/types";

export function buildJQL(userInput: string, filters: SearchFilter[]) {
  const isJQL = isJQLSyntax(userInput);

  const jql = isJQL ? combineJQLWithFilters(userInput, filters) : buildTextJQL(userInput, filters);

  const processedJQL = transformJQL(jql, userInput, filters);

  const optimizedJQL = formatJQL(processedJQL);
  return optimizedJQL;
}

function combineJQLWithFilters(jql: string, filters: SearchFilter[]) {
  const filterJQL = buildJQLWithFilters(filters);
  if (filterJQL) {
    return `(${jql}) AND ${filterJQL}`;
  }
  return jql;
}

function buildTextJQL(text: string, filters: SearchFilter[]) {
  const filterJQL = buildJQLWithFilters(filters);
  if (filterJQL) {
    return `text ~ "${text}" AND ${filterJQL}`;
  }
  return `text ~ "${text}"`;
}

function buildJQLWithFilters(filters: SearchFilter[]) {
  if (!filters.length) {
    return "";
  }

  const filterJQLs = filters.map((filter) => filter.query).filter((query): query is string => Boolean(query));

  if (!filterJQLs.length) {
    return "";
  }

  if (filterJQLs.length === 1) {
    return filterJQLs[0];
  }

  return `(${filterJQLs.join(" AND ")})`;
}

function transformJQL(jql: string, userInput: string, filters: SearchFilter[]) {
  let processedJql = jql;

  filters.forEach((filter) => {
    if (filter.transform) {
      processedJql = filter.transform(processedJql, { userInput, filter });
    }
  });

  return processedJql;
}

function formatJQL(jql: string) {
  let optimizedJql = jql.replace(/\s+/g, " ").trim();

  optimizedJql = optimizedJql.replace(/\(\s*\(/g, "(");
  optimizedJql = optimizedJql.replace(/\)\s*\)/g, ")");

  optimizedJql = optimizedJql.replace(/\b(AND|OR|NOT)\b/g, " $1 ");

  const openParens = (optimizedJql.match(/\(/g) || []).length;
  const closeParens = (optimizedJql.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    console.warn("JQL parentheses mismatch:", optimizedJql);
    if (openParens > closeParens) {
      optimizedJql += ")".repeat(openParens - closeParens);
    }
  }

  return optimizedJql.trim();
}
