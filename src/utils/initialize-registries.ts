import { SimpleRegistry } from "./simple-registry";
import { CONFLUENCE_CONTENT_TYPE, CONTENT_ICONS, CONTENT_LABELS, SEARCH_FILTERS } from "../constants";
import type { SearchFilter } from "../types";
import type { ContentTypeConfig } from "../types";

export const filterRegistry = new SimpleRegistry<SearchFilter>();

export const contentTypeRegistry = new SimpleRegistry<ContentTypeConfig>();

export function registerSearchFilter(filter: SearchFilter) {
  filterRegistry.register(filter.id, filter);
}

export function registerContentType(config: ContentTypeConfig) {
  contentTypeRegistry.register(config.type, config);
}

export function initializeRegistries() {
  SEARCH_FILTERS.forEach((filter) => {
    filterRegistry.register(filter.id, filter);
  });

  Object.values(CONFLUENCE_CONTENT_TYPE).forEach((type) => {
    contentTypeRegistry.register(type, {
      type,
      label: CONTENT_LABELS[type],
      icon: CONTENT_ICONS[type],
      canEdit: type !== CONFLUENCE_CONTENT_TYPE.ATTACHMENT,
      canFavorite: true,
    });
  });
}
