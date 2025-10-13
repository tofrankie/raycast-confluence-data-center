import type { SearchFilter } from "@/types";

interface SectionTitleParams {
  fetchedCount: number;
  totalCount: number;
}

/**
 * Generate section title based on filter configuration
 * @param filter - The selected search filter
 * @param params - Parameters containing fetchedCount and totalCount
 * @returns The generated section title
 */
export function getSectionTitle(filter: SearchFilter | null, params: SectionTitleParams): string {
  if (filter?.sectionTitle) {
    if (typeof filter.sectionTitle === "string") {
      return filter.sectionTitle;
    } else {
      return filter.sectionTitle(params);
    }
  }
  return `Results (${params.fetchedCount}/${params.totalCount})`;
}
