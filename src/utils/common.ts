export function formatSearchPageSize(searchPageSize: string) {
  const pageSize = parseInt(searchPageSize);
  return pageSize > 0 ? pageSize : 0;
}
