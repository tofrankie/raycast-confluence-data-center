import { List, Icon } from "@raycast/api";
import { SearchFiltersProps } from "../types/search";
import { SEARCH_FILTERS } from "../constants/search";

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (value: string) => {
    if (value === "") {
      // 清空所有过滤选项
      onFiltersChange([]);
    } else {
      // 单项选择：直接设置为选中的过滤选项
      onFiltersChange([value]);
    }
  };

  const getFilterIcon = (filterId: string) => {
    switch (filterId) {
      case "creator":
        return Icon.Person;
      case "contributor":
        return Icon.Pencil;
      case "favourite":
        return Icon.Star;
      case "mention":
        return Icon.AtSymbol;
      case "watcher":
        return Icon.Eye;
      case "title-only":
        return Icon.Text;
      default:
        return Icon.MagnifyingGlass;
    }
  };

  return (
    <List.Dropdown tooltip="Search Filters" onChange={handleFilterChange} value={filters.length > 0 ? filters[0] : ""}>
      <List.Dropdown.Item title="All Content" value="" icon={Icon.MagnifyingGlass} />
      <List.Dropdown.Section title="User Filters">
        {SEARCH_FILTERS.map((filter) => (
          <List.Dropdown.Item key={filter.id} title={filter.label} value={filter.id} icon={getFilterIcon(filter.id)} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
