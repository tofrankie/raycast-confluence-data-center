# Confluence 搜索功能增强方案

## 需求分析

### 当前状态

- 项目已实现基础的 Confluence 内容搜索功能
- 使用简单的 `text ~ "${query}"` CQL 查询
- 支持收藏功能，具备完整的用户界面
- 使用 React Query 进行状态管理和缓存

### 新增需求

根据 todo.md 的要求，需要新增以下功能：

1. **搜索过滤选项**：在 Raycast List.Dropdown 中添加常用搜索范围
   - `creator = currentUser()` - 我创建的内容
   - `modifier = currentUser()` - 我修改的内容
   - `favourite = currentUser()` - 我收藏的内容
   - `mention = currentUser()` - 提及我的内容
   - `only title` - 仅在标题中搜索

2. **CQL 高级搜索支持**：
   - 输入框支持 CQL 语法
   - 智能识别 CQL 语法 vs 普通文本
   - 将过滤选项与 CQL 查询结合

## 技术可行性分析

### ✅ 可行性评估

1. **Raycast API 支持**：`List.Dropdown` 组件完全支持所需功能
2. **CQL 语法解析**：可以基于正则表达式实现简单的 CQL 语法识别
3. **现有架构兼容**：当前使用 React Query 的架构可以很好地扩展
4. **API 兼容性**：Confluence REST API 完全支持 CQL 查询

### 🔧 技术挑战

1. **CQL 语法复杂性**：需要处理复杂的 CQL 语法组合
2. **用户体验**：需要平衡简单搜索和高级搜索的易用性
3. **错误处理**：需要优雅处理无效的 CQL 语法

## 架构设计

### 1. 组件结构

```
src/
├── components/
│   ├── search-filters.tsx        # 搜索过滤下拉框组件
│   └── cql-syntax-helper.tsx     # CQL 语法提示组件
├── hooks/
│   ├── use-search-filters.ts     # 搜索过滤状态管理
│   ├── use-cql-parser.ts         # CQL 语法解析 Hook
│   └── use-confluence-queries.ts # 扩展现有查询 Hook
├── utils/
│   ├── cql-parser.ts             # CQL 语法解析工具
│   ├── cql-builder.ts            # CQL 查询构建工具
│   └── confluence.ts             # 扩展现有工具函数
└── types/
    └── search.ts                 # 搜索相关类型定义
```

### 2. 数据流设计

```
用户输入 → CQL 解析器 → 过滤选项合并 → 查询构建器 → API 调用 → 结果展示
```

### 3. 状态管理

- 使用 React Query 管理搜索状态
- 本地状态管理过滤选项和 CQL 输入
- 缓存常用搜索模式

## 实施计划

### 阶段一：基础架构搭建 (1-2 天)

#### 1.1 类型定义

```typescript
// src/types/search.ts
export interface SearchFilter {
  id: string;
  label: string;
  cql: string;
  icon?: string;
}

export interface CQLQuery {
  raw: string;
  isCQL: boolean;
  parsed?: {
    fields: string[];
    operators: string[];
    values: string[];
  };
}

export interface SearchState {
  query: string;
  filters: SearchFilter[];
  cqlQuery: CQLQuery;
}
```

#### 1.2 CQL 解析器

```typescript
// src/utils/cql-parser.ts
export class CQLParser {
  static isCQLSyntax(query: string): boolean {
    // 检测 CQL 语法特征
    const cqlPatterns = [
      /^\s*\w+\s*[=~!<>]/, // field operator
      /currentUser\(\)/, // currentUser function
      /now\(\)/, // now function
      /\b(AND|OR|NOT)\b/, // logical operators
    ];
    return cqlPatterns.some((pattern) => pattern.test(query));
  }

  static parseCQL(query: string): CQLQuery {
    // 解析 CQL 语法
  }

  static buildCQL(baseQuery: string, filters: SearchFilter[]): string {
    // 构建最终 CQL 查询
  }
}
```

### 阶段二：UI 组件开发 (2-3 天)

#### 2.1 搜索过滤组件

```typescript
// src/components/search-filters.tsx
export function SearchFilters({
  filters,
  onFiltersChange
}: SearchFiltersProps) {
  return (
    <List.Dropdown
      tooltip="Search Filters"
      onChange={onFiltersChange}
    >
      <List.Dropdown.Item title="All Content" value="" />
      <List.Dropdown.Item
        title="Created by Me"
        value="creator"
        icon={Icon.Person}
      />
      <List.Dropdown.Item
        title="Modified by Me"
        value="modifier"
        icon={Icon.Pencil}
      />
      <List.Dropdown.Item
        title="My Favorites"
        value="favourite"
        icon={Icon.Star}
      />
      <List.Dropdown.Item
        title="Mentions Me"
        value="mention"
        icon={Icon.AtSymbol}
      />
      <List.Dropdown.Item
        title="Title Only"
        value="title-only"
        icon={Icon.Text}
      />
    </List.Dropdown>
  );
}
```

#### 2.2 主搜索组件重构

```typescript
// src/confluence-search-content.tsx (重构)
export function SearchContent() {
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const { cqlQuery, isCQL } = useCQLParser(searchText);
  const { data: results, isLoading } = useConfluenceSearch(
    cqlQuery,
    selectedFilters,
    20
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <SearchFilters
          filters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      }
    >
      {/* 搜索结果渲染 */}
    </List>
  );
}
```

### 阶段三：查询逻辑实现 (2-3 天)

#### 3.1 扩展查询 Hook

```typescript
// src/hooks/use-confluence-queries.ts (扩展)
export const useConfluenceSearch = (query: string, filters: string[], limit: number = 20) => {
  return useQuery<ConfluenceSearchContentResult[], Error>({
    queryKey: ["confluence-search", query, filters],
    queryFn: () => searchContentWithFilters(query, filters, limit),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
    retry: 2,
  });
};
```

#### 3.2 查询构建工具

```typescript
// src/utils/cql-builder.ts
export function buildSearchQuery(userInput: string, filters: string[]): string {
  const isCQL = CQLParser.isCQLSyntax(userInput);

  if (isCQL) {
    // 用户输入的是 CQL 语法
    return combineCQLWithFilters(userInput, filters);
  } else {
    // 用户输入的是普通文本
    return buildTextSearchQuery(userInput, filters);
  }
}

function combineCQLWithFilters(cql: string, filters: string[]): string {
  const filterCQL = buildFilterCQL(filters);
  if (filterCQL) {
    return `(${cql}) AND (${filterCQL})`;
  }
  return cql;
}

function buildTextSearchQuery(text: string, filters: string[]): string {
  const textQuery = `text ~ "${text}"`;
  const filterCQL = buildFilterCQL(filters);

  if (filterCQL) {
    return `${textQuery} AND (${filterCQL})`;
  }
  return textQuery;
}
```

### 阶段四：用户体验优化 (1-2 天)

#### 4.1 CQL 语法提示

```typescript
// src/components/cql-syntax-helper.tsx
export function CQLSyntaxHelper({ query }: { query: string }) {
  const isCQL = CQLParser.isCQLSyntax(query);

  if (!isCQL || query.length < 3) return null;

  return (
    <List.Item
      icon={Icon.Info}
      title="CQL Syntax Detected"
      subtitle="Advanced search syntax recognized"
      accessories={[
        { icon: Icon.QuestionMark, tooltip: "Click for CQL help" }
      ]}
    />
  );
}
```

#### 4.2 搜索历史和建议

```typescript
// src/hooks/use-search-history.ts
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = (query: string) => {
    setHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 10));
  };

  return { history, addToHistory };
}
```

## 代码组织策略

### 1. 现有代码复用

- **保留现有架构**：继续使用 React Query 和现有的 API 调用方式
- **扩展而非重写**：在现有 `useConfluenceSearch` Hook 基础上扩展
- **向后兼容**：确保现有功能不受影响

### 2. 新增代码结构

```
src/
├── components/           # 新增 UI 组件
├── hooks/               # 扩展现有 Hooks
├── utils/               # 新增工具函数
└── types/               # 新增类型定义
```

### 3. 配置和常量

```typescript
// src/constants/search.ts
export const SEARCH_FILTERS: SearchFilter[] = [
  {
    id: "creator",
    label: "Created by Me",
    cql: "creator = currentUser()",
    icon: "icon-user.svg",
  },
  {
    id: "modifier",
    label: "Modified by Me",
    cql: "modifier = currentUser()",
    icon: "icon-pencil.svg",
  },
  {
    id: "favourite",
    label: "My Favorites",
    cql: "favourite = currentUser()",
    icon: "icon-star.svg",
  },
  {
    id: "mention",
    label: "Mentions Me",
    cql: "mention = currentUser()",
    icon: "icon-at.svg",
  },
  {
    id: "title-only",
    label: "Title Only",
    cql: 'title ~ "{query}"',
    icon: "icon-text.svg",
  },
];
```

## 测试策略

### 1. 单元测试

- CQL 解析器测试
- 查询构建器测试
- 过滤选项测试

### 2. 集成测试

- API 调用测试
- 用户交互测试
- 错误处理测试

### 3. 用户体验测试

- 搜索性能测试
- 界面响应性测试
- 错误提示测试

## 风险评估与缓解

### 1. 技术风险

- **CQL 语法复杂性**：实现简单但有效的语法检测
- **性能影响**：使用防抖和缓存优化
- **API 兼容性**：充分测试不同 Confluence 版本

### 2. 用户体验风险

- **学习成本**：提供清晰的提示和帮助
- **功能复杂性**：保持简单搜索的易用性
- **错误处理**：提供友好的错误提示

## 实施时间表

| 阶段     | 任务         | 预计时间    | 依赖      |
| -------- | ------------ | ----------- | --------- |
| 1        | 基础架构搭建 | 1-2 天      | -         |
| 2        | UI 组件开发  | 2-3 天      | 阶段 1    |
| 3        | 查询逻辑实现 | 2-3 天      | 阶段 1, 2 |
| 4        | 用户体验优化 | 1-2 天      | 阶段 2, 3 |
| 5        | 测试和调试   | 1-2 天      | 阶段 4    |
| **总计** |              | **7-12 天** |           |

## 成功标准

### 1. 功能完整性

- ✅ 所有要求的过滤选项正常工作
- ✅ CQL 语法识别和解析准确
- ✅ 过滤选项与 CQL 查询正确结合
- ✅ 普通文本搜索保持原有体验

### 2. 用户体验

- ✅ 界面直观易用
- ✅ 搜索响应快速
- ✅ 错误提示友好
- ✅ 功能发现性良好

### 3. 技术质量

- ✅ 代码结构清晰
- ✅ 类型安全
- ✅ 错误处理完善
- ✅ 性能优化到位

## 后续扩展计划

### 1. 高级功能

- 搜索历史记录
- 常用搜索模式保存
- 搜索结果排序选项
- 批量操作支持

### 2. 集成功能

- Jira 集成搜索
- 跨平台搜索
- 搜索结果导出
- 协作功能增强

这个方案充分考虑了现有代码的复用，采用渐进式增强的方式，确保功能的稳定性和用户体验的连续性。
