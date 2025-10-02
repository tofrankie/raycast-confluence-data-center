import { useState, useEffect, useMemo } from "react";
import { CQLParser } from "../utils/cql-parser";
import { CQLParserResult } from "../types/search";

export function useCQLParser(query: string): CQLParserResult {
  const [cqlQuery, setCqlQuery] = useState(() => CQLParser.parseCQL(query));
  const [isCQL, setIsCQL] = useState(() => CQLParser.isCQLSyntax(query));

  useEffect(() => {
    const parsed = CQLParser.parseCQL(query);
    setCqlQuery(parsed);
    setIsCQL(parsed.isCQL);
  }, [query]);

  return useMemo(
    () => ({
      cqlQuery,
      isCQL,
    }),
    [cqlQuery, isCQL],
  );
}
