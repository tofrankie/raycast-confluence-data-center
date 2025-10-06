import { List } from "@raycast/api";
import { SPACE_TYPE_FILTERS } from "../constants";
import type { SearchFilter as SearchFilterType } from "../types";

interface SpaceFilterProps {
  value: string;
  onChange: (filter: SearchFilterType | null) => void;
}

export function SpaceFilter({ value, onChange }: SpaceFilterProps) {
  const handleFilterChange = (filterId: string) => {
    if (!filterId) {
      onChange(null);
      return;
    }

    const filter = SPACE_TYPE_FILTERS.find((f) => f.id === filterId);
    onChange(filter || null);
  };

  return (
    <List.Dropdown tooltip="Space Type Filters" onChange={handleFilterChange} value={value} storeValue throttle>
      {SPACE_TYPE_FILTERS.map((item) => (
        <List.Dropdown.Item key={item.id} title={item.label} value={item.id} icon={item.icon} />
      ))}
    </List.Dropdown>
  );
}
