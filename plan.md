# 头像下载功能实现计划

## 需求分析

### 核心功能

1. **头像下载**: 从 Confluence API 下载用户头像到本地
2. **本地缓存**: 使用 `userKey` 作为文件名，避免重复下载
3. **渐进式显示**: 先显示列表，头像下载完成后逐个更新显示
4. **并发控制**: 使用 React Query 的 useQueries，浏览器自动限制并发
5. **错误处理**: 下载失败时不重试，交由下次内容搜索时重新获取

### 技术要点

- 头像 URL 构建: `${domain}${profilePicture.path}`
- 本地存储路径: 根据类型使用不同路径 (`CONFLUENCE_AVATAR_DIR` 或 `JIRA_AVATAR_DIR`) + `${filename}`
- 鉴权方式: `Authorization: Bearer <PAT>`
- 并发控制: 使用 React Query 的 useQueries，浏览器自动限制并发

## 潜在问题与优化建议

### 1. 目录管理

**决定**: 使用 `/tmp` 目录，保持简单

### 2. 文件扩展名

**决定**: 根据图片下载的响应结果动态确定扩展名

### 3. 并发控制

**决定**: 使用 React Query 的 `useQueries` 来管理头像下载，浏览器自动限制并发连接数

### 4. 缓存策略

**决定**: 使用 React Query 的 `staleTime: Infinity` 实现永久缓存

### 5. 错误重试

**决定**: 不重试，失败的头像交由下次内容搜索时重新获取

## 实现计划

### 阶段 1: 基础架构搭建

1. **创建头像下载工具模块** (`src/utils/avatar.ts`)
   - 封装通用的图片下载函数
   - 支持 Confluence 和 JIRA 的鉴权
   - 根据响应头动态确定文件扩展名

2. **更新常量配置** (`src/constants/index.ts`)
   - 保持使用 `/tmp` 目录
   - 添加头像相关配置

### 阶段 2: 核心功能实现

3. **创建头像下载 Hook** (`src/hooks/use-avatar.ts`)
   - 接收头像列表 `Array<{url: string, filename: string}>` 和类型参数
   - 支持 `confluence` 和 `jira` 两种类型
   - 在 Hook 内部完成去重和过滤本地已存在的头像
   - 使用 `useQueries` 管理多个头像下载
   - 设置 `staleTime: Infinity` 实现永久缓存
   - 内部使用 `useState` 管理更新状态，下载完成后触发重新渲染
   - 不返回任何值，纯粹用于后台下载

### 阶段 3: 集成与优化

4. **更新搜索组件**
   - 当搜索结果返回时，提取头像信息并构建 `AvatarItem[]`
   - 将头像列表和类型传入 Hook
   - 头像始终以 `${domain}${profilePicture.path}` 形式展示，本地存在时自然显示

5. **无需额外依赖**
   - 使用现有的 React Query
   - 浏览器自动处理并发限制

## 文件结构

```
src/
├── utils/
│   ├── avatar.ts              # 通用头像下载工具
│   └── index.ts               # 导出更新
├── hooks/
│   └── use-avatar.ts          # 头像下载 Hook
├── constants/
│   └── index.ts               # 常量配置更新
└── search-confluence.tsx      # 主组件更新
```

## 实现细节

### 1. 头像下载工具 (`avatar.ts`)

```typescript
interface DownloadOptions {
  url: string;
  outputPath: string;
  headers: Record<string, string>;
}

interface DownloadResult {
  success: boolean;
  localPath?: string;
  error?: string;
}

async function downloadAvatar(options: DownloadOptions): Promise<DownloadResult>;
```

### 2. 头像下载 Hook (`use-avatar.ts`)

```typescript
interface AvatarItem {
  url: string;
  filename: string;
}

type AvatarType = "confluence" | "jira";

function useAvatar(avatarList: AvatarItem[], type: AvatarType): void;
```

## 实现要点

1. **文件权限**: 确保有权限在指定目录创建文件

## 技术优势

### React Query 集成优势

1. **自动去重**: 相同 URL 的请求会自动合并
2. **永久缓存**: `staleTime: Infinity` 确保头像只下载一次
3. **错误处理**: 下载失败时不重试，交由下次搜索重新获取
4. **状态管理**: 自动管理加载、成功、失败状态
5. **并发处理**: 浏览器自动限制并发连接数，无需额外控制

### 实现流程

1. **搜索完成** → 提取头像信息构建 `AvatarItem[]` → 传入 Hook
2. **Hook 内部处理** → 去重 → 过滤本地已存在 → 根据类型确定存储路径（confluence 或 jira）
3. **useQueries** → 为每个需要下载的头像创建独立的查询
4. **自动下载** → React Query 管理下载状态
5. **触发更新** → 下载完成后内部 `useState` 更新 → 列表重新渲染
6. **自然显示** → 头像始终以 `${domain}${profilePicture.path}` 展示，本地存在时自然显示

## 后续扩展

1. **JIRA 集成**: 复用头像下载工具支持 JIRA
2. **缓存清理**: 添加定期清理过期头像的功能
3. **配置化**: 允许用户配置缓存策略
4. **预览功能**: 支持头像预览和手动刷新

## 配置选项

### 新增配置项

在 `package.json` 中添加了 `cacheConfluenceUserAvatar` 配置选项：

```json
{
  "name": "cacheConfluenceUserAvatar",
  "title": "Cache Confluence User Avatars",
  "description": "Cache Confluence user avatars to local storage. Enable if your Confluence requires authentication to access user avatars, disable if avatars can be accessed directly without authentication.",
  "type": "checkbox",
  "required": false,
  "default": false,
  "label": "Enable avatar caching"
}
```

### 使用场景

1. **启用缓存**: 适用于需要鉴权的头像，缓存到本地存储
2. **禁用缓存** (默认): 适用于企业环境，头像可以直接访问，无需鉴权

### 实现逻辑

```typescript
// 在搜索组件中
const { cacheConfluenceUserAvatar } = getPreferenceValues<Preferences.SearchConfluence>();

if (cacheConfluenceUserAvatar) {
  // 构建头像列表并缓存
  const avatarList = results.map((item) => ({
    url: `${config.baseUrl}${item.version.by.profilePicture.path}`,
    filename: item.version.by.userKey,
  }));
  useAvatar(avatarList, "confluence");
}
// 头像始终以原始 URL 显示，下载完成后自然显示本地版本
```
