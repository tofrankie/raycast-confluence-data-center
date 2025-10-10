import { Cache, Icon } from "@raycast/api";

import { CACHE_KEY } from "@/constants";
import type { JiraField, ListItemAccessories, ProcessedJiraFieldItem } from "@/types";

const customFieldCache = new Cache();

export function getSelectedCustomField(): JiraField[] {
  const cached = customFieldCache.get(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD);
  return cached ? JSON.parse(cached) : [];
}

export function getSelectedCustomFieldIds(): string[] {
  const fields = getSelectedCustomField();
  return (fields || []).map((field) => field.id);
}

export function setSelectedCustomField(field: JiraField[]): void {
  customFieldCache.set(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD, JSON.stringify(field));
}

export function addCustomField(field: JiraField): void {
  const current = getSelectedCustomField();
  if (!current.some((f) => f.id === field.id)) {
    setSelectedCustomField([...current, field]);
  }
}

export function removeCustomField(fieldId: string): void {
  const current = getSelectedCustomField();
  setSelectedCustomField(current.filter((field) => field.id !== fieldId));
}

export function processJiraFieldItem(field: JiraField, isAdded: boolean): ProcessedJiraFieldItem {
  const schemaType = field.schema?.type || "Unknown";
  const subtitle = {
    value: field.id,
    tooltip: "Field ID",
  };

  const accessories: ListItemAccessories = [
    ...(isAdded
      ? [
          {
            icon: Icon.Checkmark,
            tooltip: "Included in search",
          },
        ]
      : []),
    {
      text: schemaType,
      tooltip: "Field Schema Type",
    },
    {
      text: field.custom ? "Custom" : "System",
      tooltip: "Field Type",
    },
  ];

  return {
    renderKey: field.id,
    title: field.name,
    id: field.id,
    name: field.name,
    subtitle,
    accessories,
    custom: field.custom,
    isAdded,
    keywords: [field.id, schemaType],
    schema: field.schema,
  };
}
