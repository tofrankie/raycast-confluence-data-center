import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import QueryProvider from "./query-provider";
import { JiraPreferencesProvider } from "./contexts/jira-preferences-context";
import { useJiraFieldQuery } from "./hooks/use-jira-query";
import { getSelectedCustomField, addCustomField, removeCustomField } from "./utils/process-jira-manage-field";
import type { JiraField } from "./types";

export default function JiraManageFieldProvider() {
  return (
    <JiraPreferencesProvider>
      <QueryProvider>
        <JiraManageFieldContent />
      </QueryProvider>
    </JiraPreferencesProvider>
  );
}

function JiraManageFieldContent() {
  const [searchText, setSearchText] = useState("");
  const [addedFields, setAddedFields] = useState<JiraField[]>([]);

  const { data, isLoading, error } = useJiraFieldQuery();

  useEffect(() => {
    setAddedFields(getSelectedCustomField());
  }, []);

  const { addedFieldsFiltered, systemFields, customFields } = useMemo(() => {
    const allFields = data ?? [];
    const filteredFields = allFields.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

    const addedFieldIds = addedFields.map((item) => item.id);
    const addedFieldsFiltered = filteredFields.filter((item) => addedFieldIds.includes(item.id));

    return {
      addedFieldsFiltered,
      systemFields: filteredFields.filter((item) => !item.custom && !addedFieldIds.includes(item.id)),
      customFields: filteredFields.filter((item) => item.custom && !addedFieldIds.includes(item.id)),
    };
  }, [data, searchText, addedFields]);

  const handleToggleField = (field: JiraField) => {
    const isAdded = addedFields.some((item) => item.id === field.id);

    if (isAdded) {
      removeCustomField(field.id);
      setAddedFields(addedFields.filter((item) => item.id !== field.id));
    } else {
      addCustomField(field);
      setAddedFields([...addedFields, field]);
    }
  };

  const isFieldAdded = useMemo(() => {
    return (field: JiraField) => addedFields.some((item) => item.id === field.id);
  }, [addedFields]);

  const isEmpty = !isLoading && searchText.length && !data?.length;

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to load fields" });
    }
  }, [error]);

  return (
    <List throttle isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search field...">
      {isEmpty ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Fields Found"
          description="Try adjusting your search terms"
        />
      ) : (
        <>
          {addedFieldsFiltered.length > 0 && (
            <List.Section title={`Added Fields (${addedFieldsFiltered.length})`}>
              {addedFieldsFiltered.map((item) => {
                const updatedAccessories = [
                  {
                    icon: Icon.Checkmark,
                    tooltip: "Included in search",
                  },
                  ...item.accessories,
                ];

                return (
                  <List.Item
                    key={item.id}
                    title={item.name}
                    subtitle={item.subtitle}
                    accessories={updatedAccessories}
                    actions={
                      <ActionPanel>
                        <Action title="Remove from Search" icon={Icon.Minus} onAction={() => handleToggleField(item)} />
                        <Action.CopyToClipboard title="Copy Field ID" content={item.id} />
                      </ActionPanel>
                    }
                  />
                );
              })}
            </List.Section>
          )}

          {systemFields.length > 0 && (
            <List.Section title={`System Fields (${systemFields.length})`}>
              {systemFields.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  subtitle={item.subtitle}
                  accessories={item.accessories}
                  actions={
                    <ActionPanel>
                      <Action.CopyToClipboard title="Copy Field ID" content={item.id} />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          )}

          {customFields.length > 0 && (
            <List.Section title={`Custom Fields (${customFields.length})`}>
              {customFields.map((item) => {
                const accessories = item.accessories;
                const isAdded = isFieldAdded(item);
                if (isAdded) {
                  accessories.unshift({
                    icon: Icon.Checkmark,
                    tooltip: "Included in search",
                  });
                }

                return (
                  <List.Item
                    key={item.id}
                    title={item.name}
                    subtitle={item.subtitle}
                    accessories={accessories}
                    actions={
                      <ActionPanel>
                        <Action
                          title={isAdded ? "Remove from Search" : "Add to Search"}
                          icon={isAdded ? Icon.Minus : Icon.Plus}
                          onAction={() => handleToggleField(item)}
                        />
                        <Action.CopyToClipboard title="Copy Field ID" content={item.id} />
                      </ActionPanel>
                    }
                  />
                );
              })}
            </List.Section>
          )}
        </>
      )}
    </List>
  );
}
