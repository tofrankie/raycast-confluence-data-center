import { List, Icon, ActionPanel, Action } from "@raycast/api";
import { isCQLSyntax, validateCQL } from "../utils";

interface CQLWrapperProps {
  query: string;
  children: React.ReactNode;
}

export function CQLWrapper({ query, children }: CQLWrapperProps) {
  const isCQL = isCQLSyntax(query);
  const validation = validateCQL(query);

  // 如果不是 CQL 语法或查询太短，直接显示子组件
  if (!isCQL || query.length < 3) {
    return <>{children}</>;
  }

  // 如果是有效的 CQL 语法，显示子组件
  if (validation.isValid) {
    return <>{children}</>;
  }

  // 如果是无效的 CQL 语法，显示 EmptyView
  const cqlHelpUrl = "https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql";

  return (
    <List.EmptyView
      icon={Icon.ExclamationMark}
      title="CQL Syntax Error"
      description={validation.error}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser icon={Icon.Globe} title="Open CQL Documentation" url={cqlHelpUrl} />
        </ActionPanel>
      }
    />
  );
}
