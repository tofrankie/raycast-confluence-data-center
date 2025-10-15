import { List } from "@raycast/api";

import { SEARCH_BAR_ACCESSORY_CONFIGS } from "@/constants";
import type { SearchBarAccessoryCommandName, SearchFilter } from "@/types";

interface SearchBarAccessoryProps {
  commandName: SearchBarAccessoryCommandName;
  value: string;
  onChange: (filter: SearchFilter | null) => void;
}

export function SearchBarAccessory({ commandName, value, onChange }: SearchBarAccessoryProps) {
  const filters = SEARCH_BAR_ACCESSORY_CONFIGS[commandName];

  const handleFilterChange = (filterId: string) => {
    if (filterId === "default") {
      onChange(null);
      return;
    }

    const filter = filters.find((item) => item.id === filterId);
    if (filter) {
      const { id, query, transform, autoQuery, sectionTitle, logicOperator, orderBy } = filter;
      onChange({ id, query, transform, autoQuery, sectionTitle, logicOperator, orderBy });
    } else {
      onChange(null);
    }
  };

  return (
    <List.Dropdown tooltip="Filter Options" onChange={handleFilterChange} value={value} storeValue throttle>
      {filters.map((item) => (
        <List.Dropdown.Item key={item.id} title={item.title} value={item.id} icon={item.icon} />
      ))}
    </List.Dropdown>
  );
}
