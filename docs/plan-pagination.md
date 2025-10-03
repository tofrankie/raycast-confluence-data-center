# Confluence 搜索分页功能设计方案

## 概述

基于 [Confluence Data Center REST API 分页文档](https://developer.atlassian.com/server/confluence/rest/v1010/intro/#pagination-in-the-rest-api)，为 Raycast Confluence 扩展设计并实现搜索分页功能，提升用户体验和搜索效率。

## 当前状态分析

### 现有实现

- 当前搜索功能使用固定的 `limit=20` 参数（需要改为可配置的 10）
- 搜索结果通过 `useConfluenceSearchWithFilters` hook 获取
- 使用 React Query 进行数据缓存和状态管理
- 支持 CQL 查询和多种过滤条件

### 限制

- 无法加载更多搜索结果
- 用户无法自定义每页显示数量
- 缺少分页导航和状态指示

## 设计方案

### 1. 全局分页配置

#### 1.1 新增 Preferences 配置

在 `package.json` 的顶级 `preferences` 数组中添加分页大小选项（供所有命令使用）：

**常量定义**：

```typescript
// src/constants/index.ts
export const DEFAULT_SEARCH_PAGE_SIZE = 20;
```

```json
{
  "name": "searchPageSize",
  "title": "Search Results Per Page",
  "description": "Number of search results to display per page (default: 20). Set higher to ensure pagination works properly in Raycast window.",
  "type": "textfield",
  "required": false,
  "default": "20",
  "placeholder": "Enter number of results per page"
}
```

#### 1.2 配置说明

- **配置位置**: 顶级 `preferences` 字段，供所有命令使用
- **默认值**: 20（确保分页功能正常工作，避免所有结果都在 Raycast 窗口中可见）
- **建议范围**: 15-30（保证分页体验，避免影响性能）
- **类型**: 数字验证
- **优势**: 统一管理，所有搜索命令自动继承
- **重要**: 默认值必须足够大，确保用户需要滚动才能看到所有结果，从而触发分页

### 2. 分页状态管理

#### 2.1 分页状态接口

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoadingMore: boolean;
}
```

#### 2.2 分页 Hook

创建 `usePagination` hook 管理分页状态：

- 当前页码
- 每页大小（从 preferences 获取）
- 总结果数
- 加载更多状态
- 分页导航方法

### 3. API 集成

#### 3.1 分页参数支持

根据 Confluence API 文档，支持以下分页参数：

- `start`: 返回集合的起始点
- `limit`: 返回项目数量的限制，可能受到固定系统限制的约束（默认是 25）
- `_links.next`: 下一页链接（如果存在）

#### 3.2 响应数据结构

利用现有的 `ConfluenceSearchContentResponse` 接口：

```typescript
interface ConfluenceSearchContentResponse {
  results: ConfluenceSearchContentResult[];
  start: number; // 返回集合的起始点
  limit: number; // 返回项目数量的限制
  size: number; // 本次分页查询结果数
  totalSize?: number; // 总结果数（企业实际返回的字段）
  totalCount?: number; // 总结果数（接口文档标准字段）
  _links: {
    next?: string; // 下一页链接
    // ... 其他链接
  };
}
```

### 4. 用户界面设计

#### 4.1 Raycast 内置分页支持

利用 Raycast 的 `List` 组件内置分页机制：

- 使用 `pagination` prop 配置分页行为
- `onLoadMore`: 用户滚动到底部时自动触发
- `hasMore`: 控制是否还有更多数据可加载
- `pageSize`: 设置占位符数量，提升用户体验

#### 4.2 分页信息显示

- 显示当前页信息：`显示 X-Y 条，共 Z 条结果`
- Raycast 自动处理加载状态指示器
- 无更多结果时自动停止分页

#### 4.3 搜索重置

- 新的搜索查询时重置分页状态
- 过滤条件变化时重置分页状态
- 利用 React Query 的缓存失效机制

### 5. 实现细节

#### 5.1 数据获取策略

- **初始加载**: 使用 `start=0, limit=searchPageSize`
- **加载更多**: 使用 `start=currentResults.length, limit=searchPageSize`
- **结果合并**: 将新结果追加到现有结果列表
- **内存管理**: 利用 Raycast 的内存监控机制
- **API 修改**: 需要修改 `searchContentWithFilters` 函数支持 `start` 参数
- **字段兼容**: 使用 `totalSize ?? totalCount` 处理总结果数，兼容不同企业环境

#### 5.2 缓存策略（REST API + Raycast Pagination + React Query 集成）

- **使用 `useInfiniteQuery`**: 专门为分页数据设计的 React Query hook
- **专用缓存配置**: 在 `useInfiniteQuery` 中单独设置 1 分钟缓存时间，区别于普通查询的 30 秒
- **缓存键设计**: `["confluence-search-content", query, filters, searchPageSize]`
- **增量数据管理**: 每页数据独立缓存，支持增量加载
- **智能缓存复用**: 相同查询条件的分页数据可以复用
- **内存优化**: 结合 Raycast 内存监控，自动清理过期缓存

#### 5.3 错误处理

- 分页加载失败时的错误提示
- 网络错误时的重试机制
- 部分加载失败时的降级处理

### 6. Raycast 分页集成

#### 6.1 List 组件配置（REST API + Raycast + React Query 集成）

```typescript
<List
  isLoading={isLoading}
  onSearchTextChange={setSearchText}
  searchBarPlaceholder="Search Content..."
  searchBarAccessory={<SearchFilters filters={filters} onFiltersChange={setFilters} />}
  pagination={{
    onLoadMore: handleLoadMore,
    hasMore: hasNextPage,
    pageSize: searchPageSize
  }}
  throttle
>
  {allResults.map((item) => (
    <List.Item
      key={item.id}
      // ... 其他属性
    />
  ))}
</List>
```

#### 6.2 分页状态管理（React Query + Raycast 集成）

```typescript
// 使用 useInfiniteQuery 管理分页数据
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
  queryKey: ["confluence-search-content", query, filters, searchPageSize],
  queryFn: async ({ pageParam = 0 }) => {
    const response = await searchContentWithFilters(query, filters, searchPageSize, pageParam);
    return {
      results: response.results,
      totalResults: response.totalSize ?? response.totalCount,
      hasMore: response.results.length === searchPageSize,
    };
  },
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.hasMore ? allPages.length * searchPageSize : undefined;
  },
  enabled: query.length >= 2,
  staleTime: 60 * 1000, // 1分钟缓存（分页查询专用）
});

// 展平所有页面的结果
const allResults = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

// Raycast 分页处理函数
const handleLoadMore = async () => {
  if (hasNextPage && !isFetchingNextPage) {
    await fetchNextPage();
  }
};
```

#### 6.3 内存管理

- 利用 Raycast 内置的内存监控机制
- 当内存使用过高时，Raycast 会自动停止分页
- 开发时会在终端显示内存警告
- 避免手动实现复杂的内存管理逻辑

### 7. 三者集成策略（REST API + Raycast Pagination + React Query）

#### 7.1 数据流设计

```
用户操作 → Raycast List → React Query → REST API → 缓存 → UI 更新
    ↓           ↓            ↓           ↓         ↓        ↓
  滚动到底部 → onLoadMore → fetchNextPage → start/limit → 增量缓存 → 展平显示
```

#### 7.2 缓存复用优化

- **查询键设计**: `["confluence-search-content", query, filters, searchPageSize]`
- **页面级缓存**: 每页数据独立缓存，支持部分失效
- **智能预取**: 基于用户行为预测下一页数据
- **内存管理**: 结合 Raycast 限制，自动清理过期页面

#### 7.3 用户体验优化

- **即时响应**: 缓存命中时立即显示结果
- **渐进加载**: 先显示已缓存数据，再加载新数据
- **状态同步**: 搜索条件变化时智能重置分页状态
- **错误恢复**: 网络错误时保持已加载数据，仅重试失败页面

#### 7.4 性能优化策略

- **请求去重**: React Query 自动处理重复请求
- **后台更新**: 静默更新过期缓存，不阻塞用户操作
- **批量操作**: 合并多个分页请求，减少网络开销
- **内存监控**: 利用 Raycast 机制，防止内存溢出

### 8. 文件结构变更

#### 7.1 新增文件

```
src/
├── hooks/
│   └── use-pagination.ts          # 分页状态管理
├── components/
│   └── pagination-controls.tsx    # 分页控制组件
└── types/
    └── pagination.ts              # 分页相关类型定义
```

#### 7.2 修改文件

```
package.json                       # 添加顶级分页 preferences（供所有命令使用）
src/
├── query-client.tsx               # 添加 infiniteQueries 全局配置
├── confluence-search-content.tsx  # 集成分页功能
├── hooks/
│   └── use-confluence-queries.ts  # 支持分页查询
├── utils/
│   └── confluence.ts              # 支持分页参数
└── types/
    └── index.ts                   # 添加分页类型
```

### 9. 故障排除

#### 9.1 分页不触发问题

**问题**: 分页功能不工作，用户滚动到底部但没有加载更多数据

**原因**: 默认页面大小太小（如 10），导致所有结果都在 Raycast 窗口中可见，用户无需滚动

**解决方案**:

1. 将 `searchPageSize` 默认值设置为 20 或更高
2. 确保用户需要滚动才能看到所有结果
3. 这样当用户滚动到底部时，`onLoadMore` 才会被触发

**技术原理**:

```
Raycast 分页触发条件：
1. 用户滚动到列表底部 ✅
2. 还有更多数据 (hasMore: true) ✅
3. 当前没有正在加载 (isFetchingNextPage: false) ✅

当所有结果都可见时 → 用户不会滚动 → 条件1不满足 → 分页不触发 ❌
```

### 10. 实现步骤（三者集成）

#### 阶段 1: 基础集成

1. 添加顶级分页 preferences 配置（供所有命令使用）
2. 修改 `searchContentWithFilters` 支持 `start` 参数
3. 实现 `useInfiniteQuery` 基础配置
4. 集成 Raycast List 的 `pagination` prop

#### 阶段 2: 缓存优化

1. 完善 React Query 缓存策略
2. 实现智能缓存复用逻辑
3. 添加搜索重置和状态同步
4. 优化错误处理和重试机制

#### 阶段 3: 性能调优

1. 结合 Raycast 内存监控优化
2. 实现智能预取和批量操作
3. 性能测试和用户体验优化
4. 缓存命中率分析和调优

### 9. 测试策略

#### 9.1 功能测试

- 分页配置验证
- 搜索结果分页加载
- 搜索重置功能
- 错误处理机制
- 字段兼容性测试（totalSize vs totalCount）

#### 9.2 性能测试

- 大量结果的分页性能
- 内存使用情况
- 网络请求优化效果

#### 9.3 用户体验测试

- 不同分页大小的使用体验
- 加载状态的用户反馈
- 错误情况的处理体验

### 10. 兼容性考虑

#### 10.1 向后兼容

- 保持现有 API 接口不变
- 默认分页大小与当前实现一致
- 渐进式功能增强

#### 10.2 配置迁移

- 新用户使用默认配置
- 现有用户保持当前行为
- 平滑的功能升级路径

## 总结

本方案完美集成了 Confluence Data Center REST API、Raycast 内置分页机制和 React Query 缓存系统，为扩展提供高性能的分页搜索功能。通过三者协同工作，实现了最佳的缓存复用和用户体验。主要优势包括：

1. **用户可配置**: 支持自定义每页结果数量（默认 20）
2. **全局配置**: 顶级 preferences 配置，所有命令自动继承
3. **完美集成**: REST API + Raycast Pagination + React Query 三者协同
4. **智能缓存**: 页面级缓存、增量更新、智能复用
5. **自动内存管理**: Raycast 自动监控内存使用，防止扩展崩溃
6. **优秀用户体验**: 即时响应、渐进加载、错误恢复
7. **高性能**: 请求去重、后台更新、批量操作
8. **向后兼容**: 不影响现有功能的使用
9. **可扩展性**: 新增搜索命令时自动支持分页功能
10. **关键发现**: 默认页面大小必须足够大（≥20），确保用户需要滚动才能触发分页

### 重要经验教训

**分页触发机制**: Raycast 的分页功能依赖于用户滚动行为。如果所有结果都在窗口中可见，用户不会滚动，分页永远不会触发。因此，默认页面大小必须足够大，确保用户需要滚动才能看到所有结果。

该方案充分利用了三个系统的优势，实现了企业级的分页搜索体验，为后续的功能扩展（如搜索历史、高级过滤等）奠定了坚实的基础。
