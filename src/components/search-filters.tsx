import { List, Icon } from "@raycast/api";
import { filterRegistry } from "../utils";

interface SearchFiltersProps {
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (value: string) => {
    onFiltersChange(!value ? [] : [value]);
  };

  const availableFilters = filterRegistry.getAll();

  return (
    <List.Dropdown tooltip="Search Filters" onChange={handleFilterChange} value={filters.length > 0 ? filters[0] : ""}>
      <List.Dropdown.Item title="All Content" value="" icon={Icon.MagnifyingGlass} />
      <List.Dropdown.Section title="User Filters">
        {availableFilters.map((filter) => (
          <List.Dropdown.Item key={filter.id} title={filter.label} value={filter.id} icon={filter.icon} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
