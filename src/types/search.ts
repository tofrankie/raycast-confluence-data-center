export interface SearchFilter {
  id: string;
  label: string;
  cql: string;
  icon?: string;
}

export interface CQLQuery {
  raw: string;
  isCQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}

export interface SearchState {
  query: string;
  filters: SearchFilter[];
  cqlQuery: CQLQuery;
}

export interface SearchFiltersProps {
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export interface CQLParserResult {
  cqlQuery: CQLQuery;
  isCQL: boolean;
}
