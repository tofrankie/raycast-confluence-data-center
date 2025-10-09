import { Cache, Icon } from "@raycast/api";
import { CACHE_KEY } from "../constants";
import type { JiraField } from "../types";

// 使用 Raycast Cache API 存储用户选择的自定义字段对象
const customFieldCache = new Cache();

// 获取用户选择的自定义字段对象列表
export function getSelectedCustomField(): JiraField[] {
  const cached = customFieldCache.get(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD);
  return cached ? JSON.parse(cached) : [];
}

// 获取用户选择的自定义字段 ID 列表（用于 API 请求）
export function getSelectedCustomFieldIds(): string[] {
  const fields = getSelectedCustomField();
  return (fields || []).map((field) => field.id);
}

// 保存用户选择的字段对象列表
export function setSelectedCustomField(field: JiraField[]): void {
  customFieldCache.set(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD, JSON.stringify(field));
}

// 添加单个字段对象
export function addCustomField(field: JiraField): void {
  const current = getSelectedCustomField();
  if (!current.some((f) => f.id === field.id)) {
    setSelectedCustomField([...current, field]);
  }
}

// 移除单个字段
export function removeCustomField(fieldId: string): void {
  const current = getSelectedCustomField();
  setSelectedCustomField(current.filter((field) => field.id !== fieldId));
}

// 格式化自定义字段值
export function formatCustomFieldValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

// 处理字段项，构建渲染信息
export function processJiraFieldItem(field: JiraField, isAdded: boolean) {
  const subtitle = {
    value: field.id,
    tooltip: "Field ID",
  };

  const accessories = [
    ...(isAdded
      ? [
          {
            icon: Icon.Checkmark,
            tooltip: "Included in search",
          },
        ]
      : []),
    {
      text: field.custom ? "Custom" : "System",
      tooltip: "Field Type",
    },
  ];

  return {
    ...field,
    subtitle,
    accessories,
    isAdded,
  };
}
