import { List, Icon, ActionPanel, Action } from "@raycast/api";
import { isCQLSyntax, validateCQL } from "../utils";

interface CQLWrapperProps {
  query: string;
  children: React.ReactNode;
}

export function CQLWrapper({ query, children }: CQLWrapperProps) {
  const isCQL = isCQLSyntax(query);
  const validation = validateCQL(query);

  // If not CQL syntax or query is too short, directly render children
  if (!isCQL || query.length < 3) {
    return <>{children}</>;
  }

  if (validation.isValid) {
    return <>{children}</>;
  }

  return (
    <List.EmptyView
      icon={Icon.ExclamationMark}
      title="CQL Syntax Error"
      description={validation.error}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            icon={Icon.Book}
            title="Open CQL Documentation"
            url="https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql"
          />
        </ActionPanel>
      }
    />
  );
}
