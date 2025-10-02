import { useState, useCallback } from "react";

export function useSearchFilters(initialFilters: string[] = []) {
  const [filters, setFilters] = useState<string[]>(initialFilters);

  const addFilter = useCallback((filterId: string) => {
    setFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev;
      }
      return [...prev, filterId];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f !== filterId));
  }, []);

  const toggleFilter = useCallback((filterId: string) => {
    setFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((f) => f !== filterId);
      }
      return [...prev, filterId];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const updateFilters = useCallback((newFilters: string[]) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    addFilter,
    removeFilter,
    toggleFilter,
    clearFilters,
    setFilters: updateFilters,
  };
}
