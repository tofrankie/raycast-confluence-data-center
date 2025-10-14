export interface CQLQuery {
  raw: string;
  isCQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}

export interface JQLQuery {
  raw: string;
  isJQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}
