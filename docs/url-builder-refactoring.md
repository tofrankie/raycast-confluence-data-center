# URL 构建器重构总结

## 重构目标

重新设计 `useConfluenceUrls` 的实现，将 `getPreferenceValues()` 的调用从各个组件中抽离出来，确保在整个应用生命周期内只执行一次，并通过 Context 在整个应用中共享配置。

## 重构成果

### 1. 新增文件结构

#### 配置上下文 (`src/contexts/confluence-config-context.tsx`)

- **`ConfluenceConfigProvider`**: 在应用启动时执行一次 `getPreferenceValues()`，获取用户配置
- **`useConfluenceConfig`**: 提供配置访问的 hook，确保只能在 Provider 内部使用
- 使用 React Context 在整个应用中共享配置，避免重复获取

#### URL 构建工具 (`src/utils/url-builder.ts`)

- **纯函数**: `buildContentUrl`, `buildContentEditUrl`, `buildAuthorAvatarUrl`, `buildSpaceUrl`
- **`ConfluenceUrlBuilder` 类**: 封装所有 URL 构建逻辑，提供统一的接口
- 将 URL 构建逻辑从 hook 中抽离，提高可测试性和复用性

#### 重构后的 Hook (`src/hooks/use-confluence-urls.ts`)

- 使用 `useConfluenceConfig` 获取配置
- 使用 `ConfluenceUrlBuilder` 类构建 URL
- 通过 `useMemo` 优化性能，只在配置变化时重新创建构建器

### 2. 架构改进

#### 配置管理优化

```typescript
// 之前：每个组件都可能调用 getPreferenceValues()
const preferences = useConfluencePreferences(); // 可能被多次调用

// 现在：只在应用启动时调用一次
<ConfluenceConfigProvider> // 只在这里调用一次 getPreferenceValues()
  <QueryProvider>
    <ConfluenceSearchContent />
  </QueryProvider>
</ConfluenceConfigProvider>
```

#### URL 构建逻辑抽离

```typescript
// 之前：URL 构建逻辑在 hook 中
const getContentUrl = useCallback(
  (contentResult) => {
    return `${baseUrl}${contentResult._links.webui}`;
  },
  [baseUrl],
);

// 现在：URL 构建逻辑在纯函数中
export function buildContentUrl(contentResult: ConfluenceSearchContentResult, baseUrl: string): string {
  return `${baseUrl}${contentResult._links.webui}`;
}
```

### 3. 性能优化

#### 减少重复计算

- **配置获取**: 从多次调用 `getPreferenceValues()` 减少到只在应用启动时调用一次
- **URL 构建器**: 使用 `useMemo` 缓存构建器实例，只在配置变化时重新创建
- **函数绑定**: 使用 `bind()` 方法绑定上下文，避免每次渲染时创建新函数

#### 内存优化

- 配置对象在整个应用生命周期内保持稳定
- URL 构建器实例被缓存，减少对象创建开销

### 4. 代码质量提升

#### 职责分离

- **配置管理**: 由 `ConfluenceConfigProvider` 负责
- **URL 构建**: 由 `ConfluenceUrlBuilder` 类负责
- **Hook 逻辑**: 只负责连接配置和构建器

#### 可测试性

- URL 构建逻辑现在是纯函数，易于单元测试
- 配置和构建逻辑分离，可以独立测试

#### 可维护性

- 配置获取逻辑集中在一个地方
- URL 构建逻辑模块化，易于修改和扩展

### 5. 使用方式

#### 在组件中使用

```typescript
// 获取配置
const config = useConfluenceConfig();

// 获取 URL 构建器
const { getContentUrl, getContentEditUrl, baseUrl } = useConfluenceUrls();
```

#### 直接使用构建器

```typescript
import { ConfluenceUrlBuilder } from "../utils/url-builder";

const urlBuilder = new ConfluenceUrlBuilder(config);
const contentUrl = urlBuilder.getContentUrl(contentResult);
```

## 总结

通过这次重构，我们成功实现了：

1. **性能优化**: 配置获取从多次调用减少到一次调用
2. **架构改进**: 使用 Context 模式管理全局配置
3. **代码分离**: URL 构建逻辑从 hook 中抽离为纯函数
4. **可维护性**: 配置和构建逻辑职责明确，易于维护
5. **可测试性**: 纯函数和类的设计便于单元测试

新的架构更加清晰，性能更优，同时保持了原有的所有功能。配置管理现在更加高效，URL 构建逻辑也更加模块化和可复用。
