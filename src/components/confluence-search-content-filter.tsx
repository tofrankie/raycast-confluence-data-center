import { List, Icon } from "@raycast/api";
import { CONFLUENCE_SEARCH_CONTENT_FILTERS } from "../constants";
import type { SearchFilter as SearchFilterType } from "../types";

interface ConfluenceSearchContentFilterProps {
  value: string;
  onChange: (filter: SearchFilterType | null) => void;
}

export function ConfluenceSearchContentFilter({ value, onChange }: ConfluenceSearchContentFilterProps) {
  const handleFilterChange = (filterId: string) => {
    if (!filterId) {
      onChange(null);
      return;
    }

    const filter = CONFLUENCE_SEARCH_CONTENT_FILTERS.find((f) => f.id === filterId);
    onChange(filter || null);
  };

  return (
    <List.Dropdown tooltip="Search Filters" onChange={handleFilterChange} value={value} storeValue throttle>
      <List.Dropdown.Item title="All Content" value="" icon={Icon.MagnifyingGlass} />
      {CONFLUENCE_SEARCH_CONTENT_FILTERS.map((item) => (
        <List.Dropdown.Item key={item.id} title={item.label} value={item.id} icon={item.icon} />
      ))}
    </List.Dropdown>
  );
}
