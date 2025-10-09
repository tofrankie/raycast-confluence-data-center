import { List } from "@raycast/api";
import { CONFLUENCE_SPACE_TYPE_FILTERS } from "../constants";
import type { SearchFilter as SearchFilterType } from "../types";

interface ConfluenceSearchSpaceFilterProps {
  value: string;
  onChange: (filter: SearchFilterType | null) => void;
}

export function ConfluenceSearchSpaceFilter({ value, onChange }: ConfluenceSearchSpaceFilterProps) {
  const handleFilterChange = (filterId: string) => {
    if (!filterId) {
      onChange(null);
      return;
    }

    const filter = CONFLUENCE_SPACE_TYPE_FILTERS.find((f) => f.id === filterId);
    onChange(filter || null);
  };

  return (
    <List.Dropdown tooltip="Space Type Filters" onChange={handleFilterChange} value={value} storeValue throttle>
      {CONFLUENCE_SPACE_TYPE_FILTERS.map((item) => (
        <List.Dropdown.Item key={item.id} title={item.label} value={item.id} icon={item.icon} />
      ))}
    </List.Dropdown>
  );
}
