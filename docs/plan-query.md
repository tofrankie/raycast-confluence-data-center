# JQL/CQL 查询融合方案设计

## 1. 概述

### 1.1 项目背景

这是一个 Raycast 扩展工具，用于管理 Data Center 版的 Confluence、Jira 等 Atlassian 配套工具，支持搜索 Confluence 或 Jira 的内容。

### 1.2 当前架构

1. **用户输入** → 支持普通文本或 JQL/CQL 语法
2. **命令处理** → 各命令（如 `jira-search-issue.tsx`、`confluence-search-content.tsx`）处理用户输入，生成基础的 JQL/CQL
3. **融合处理** → 将基础 JQL/CQL 与 `filter.query` 传入处理函数（如 `buildJQL`、`buildCQL`）
4. **最终查询** → 生成最终的完整 JQL/CQL

### 1.3 核心问题

当前使用简单的 `(${baseQuery}) AND ${filterQuery}` 方式合并，导致：

1. **ORDER BY 语法错误**：如果基础查询包含 ORDER BY，包装在括号内会语法错误
2. **冲突处理缺失**：没有处理用户输入与 filter 之间的字段冲突
3. **重复条件**：可能产生重复的查询条件

## 2. JQL/CQL 语法规范

### 2.1 查询结构

#### 标准结构

```
<field> <operator> <value>
[AND|OR|NOT <field> <operator> <value> ...]
[ORDER BY <field> [ASC|DESC]]
```

#### 结构组成

1. **子句（Clause）**：`<field> <operator> <value>` 是基本的查询子句
2. **逻辑连接**：使用 `AND`、`OR`、`NOT` 等逻辑运算符连接多个子句
3. **括号控制**：使用括号控制子句的执行顺序
4. **排序部分**：可选的 `ORDER BY` 子句

#### 关键特点

- **JQL** 和 **CQL** 都遵循相同的结构模式
- 主要区别在于支持的 `field`、`operator`、`value` 类型不同
- `ORDER BY` 是查询的最后部分，不能放在括号内

### 2.2 CQL 语法规范

#### CQL 运算符

- **EQUALS**: `=` (等于)
- **NOT EQUALS**: `!=` (不等于)
- **GREATER THAN**: `>` (大于)
- **GREATER THAN EQUALS**: `>=` (大于等于)
- **LESS THAN**: `<` (小于)
- **LESS THAN EQUALS**: `<=` (小于等于)
- **IN**: `in` (在列表中)
- **NOT IN**: `not in` (不在列表中)
- **CONTAINS**: `~` (包含)
- **DOES NOT CONTAIN**: `!~` (不包含)

#### CQL 关键字

- **AND** - 用于组合多个子句，允许您细化搜索
- **OR** - 用于组合多个子句，允许您扩展搜索
- **NOT** - 用于否定单个子句或复杂的 CQL 查询
- **ORDER BY** - 用于指定搜索结果将按哪些字段排序的子句

#### CQL 字段

- `ancestor` (祖先)
- `container` (容器)
- `content` (内容)
- `created` (创建时间)
- `creator` (创建者)
- `contributor` (贡献者)
- `favourite`, `favorite` (收藏，两种拼写都支持)
- `id` (ID)
- `label` (标签)
- `lastmodified` (最后修改时间)
- `macro` (宏)
- `mention` (提及)
- `parent` (父级)
- `space` (空间，支持子字段)：
  - `space.category` (空间分类)
  - `space.key` (空间键)
  - `space.title` (空间标题)
  - `space.type` (空间类型)
- `text` (文本)
- `title` (标题)
- `type` (类型)
- `watcher` (观察者)

#### CQL 函数

- `currentUser()` (当前用户)
- `endOfDay()` (一天结束)
- `endOfMonth()` (月末)
- `endOfWeek()` (周末)
- `endOfYear()` (年末)
- `startOfDay()` (一天开始)
- `startOfMonth()` (月初)
- `startOfWeek()` (周初)
- `startOfYear()` (年初)
- `favouriteSpaces()` (收藏的空间)
- `recentlyViewedContent()` (最近查看的内容)
- `recentlyViewedSpaces()` (最近查看的空间)

#### CQL 文本搜索规则

- **单个术语（Single Term）**：单个单词，如 `test` 或 `hello`
- **短语（Phrase）**：用双引号包围的单词组，如 `"hello dolly"`
- **通配符搜索**：
  - `?` 表示单个字符通配符，如 `te?t` 匹配 `text` 或 `test`
  - `*` 表示多个字符通配符，如 `win*` 匹配 `Windows`、`Win95` 或 `WindowsNT`
- **模糊搜索**：使用 `~` 符号进行模糊搜索，如 `roam~` 匹配 `foam` 和 `roams`
- **大小写敏感性**：所有查询术语在 Confluence 中都是大小写不敏感的

#### CQL 查询优先级

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

### 2.3 JQL 语法规范

#### JQL 运算符

- **EQUALS**: `=` (等于)
- **NOT EQUALS**: `!=` (不等于)
- **GREATER THAN**: `>` (大于)
- **GREATER THAN EQUALS**: `>=` (大于等于)
- **LESS THAN**: `<` (小于)
- **LESS THAN EQUALS**: `<=` (小于等于)
- **IN**: `in` (在列表中)
- **NOT IN**: `not in` (不在列表中)
- **CONTAINS**: `~` (包含)
- **DOES NOT CONTAIN**: `!~` (不包含)
- **IS**: `is` (是)
- **IS NOT**: `is not` (不是)
- **WAS**: `was` (曾经是)
- **WAS IN**: `was in` (曾经在列表中)
- **WAS NOT IN**: `was not in` (曾经不在列表中)
- **WAS NOT**: `was not` (曾经不是)
- **CHANGED**: `changed` (已更改)

#### JQL 关键字

- **AND** (与) - 连接子句，所有条件都必须为真
- **OR** (或) - 连接子句，任一条件为真即可
- **NOT** (非) - 否定子句或运算符的逻辑
- **EMPTY** (空) - 表示字段为空值
- **NULL** (空值) - 表示字段为 null 值
- **ORDER BY** (排序) - 指定查询结果的排序方式

**注意：JQL 中的布尔运算符（AND、OR、NOT）必须全部大写。**

#### JQL 字段

- `affectedVersion` (影响版本)
- `approvals` (审批)
- `assignee` (指派人)
- `attachments` (附件)
- `category` (分类)
- `comment` (评论)
- `component` (组件)
- `created` (创建时间，别名：`createdDate`)
- `creator` (创建者)
- `"Customer Request Type"` (客户请求类型)
- `description` (描述)
- `due` (到期时间，别名：`dueDate`)
- `environment` (环境)
- `"epic link"` (长篇故事链接)
- `filter` (过滤器，别名：`request`, `savedFilter`, `searchRequest`)
- `fixVersion` (修复版本)
- `issueKey` (问题键，别名：`id`, `issue`, `key`)
- `labels` (标签)
- `lastViewed` (最后查看)
- `level` (级别)
- `originalEstimate` (原始估算，别名：`timeOriginalEstimate`)
- `parent` (父级)
- `priority` (优先级)
- `project` (项目)
- `remainingEstimate` (剩余估算，别名：`timeEstimate`)
- `reporter` (报告人)
- `"request-channel-type"` (请求渠道类型)
- `"request-last-activity-time"` (请求最后活动时间)
- `resolution` (解决方案)
- `resolved` (已解决，别名：`resolutionDate`)
- `sla` (SLA)
- `sprint` (冲刺)
- `status` (状态)
- `summary` (摘要)
- `text` (文本)
- `timeSpent` (已花费时间)
- `type` (类型，别名：`issueType`)
- `updated` (更新时间，别名：`updatedDate`)
- `voter` (投票者)
- `votes` (投票)
- `watcher` (观察者)
- `watchers` (观察者)
- `workLogAuthor` (工作日志作者)
- `workLogComment` (工作日志评论)
- `workLogDate` (工作日志日期)
- `workRatio` (工作比率)

#### JQL 函数

- `approved()` (已批准)
- `approver()` (审批者)
- `breached()` (违反)
- `cascadeOption()` (级联选项)
- `closedSprints()` (已关闭冲刺)
- `completed()` (已完成)
- `componentsLeadByUser()` (用户领导的组件)
- `currentLogin()` (当前登录)
- `currentUser()` (当前用户)
- `earliestUnreleasedVersion()` (最早未发布版本)
- `elapsed()` (已用时间)
- `endOfDay()` (一天结束)
- `endOfMonth()` (月末)
- `endOfWeek()` (周末)
- `endOfYear()` (年末)
- `everbreached()` (曾经违反)
- `issueHistory()` (问题历史)
- `issuesWithRemoteLinksByGlobalId()` (通过全局ID的远程链接问题)
- `lastLogin()` (最后登录)
- `latestReleasedVersion()` (最新发布版本)
- `linkedIssues()` (链接问题)
- `membersOf()` (成员)
- `myApproval()` (我的审批)
- `myPending()` (我的待处理)
- `now()` (现在)
- `openSprints()` (开放冲刺)
- `paused()` (暂停)
- `pending()` (待处理)
- `pendingBy()` (待处理者)
- `projectsLeadByUser()` (用户领导的项目)
- `projectsWhereUserHasPermission()` (用户有权限的项目)
- `projectsWhereUserHasRole()` (用户有角色的项目)
- `releasedVersions()` (已发布版本)
- `remaining()` (剩余)
- `running()` (运行中)
- `standardIssueTypes()` (标准问题类型)
- `startOfDay()` (一天开始)
- `startOfMonth()` (月初)
- `startOfWeek()` (周初)
- `startOfYear()` (年初)
- `subtaskIssueTypes()` (子任务问题类型)
- `unreleasedVersions()` (未发布版本)
- `votedIssues()` (投票问题)
- `watchedIssues()` (关注问题)
- `withinCalendarHours()` (在日历小时内)

#### JQL 查询优先级

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

## 3. 解决方案设计

### 3.1 忽略 Filter 处理

#### 常量定义

```typescript
export const QUERY_BUILDER = {
  /**
   * 当用户输入 JQL 或 CQL 时，使用此常量表示忽略 filter 的 query
   * 后续可能会将此常量配置到命令选项中，供用户选择是否应用 filter
   */
  IGNORE_FILTER: "IGNORE_FILTER",
} as const;
```

#### 处理逻辑

- 在命令层面检查用户输入是否包含 `IGNORE_FILTER` 常量
- 如果包含，则移除该常量并传入空的 filters 数组给构建器
- 如果不包含，则正常传入 filters 数组给构建器
- 这个常量可以配置到命令选项中，让用户选择是否要应用 filter 条件

#### 使用场景

```
用户输入: "project = 'TEST' IGNORE_FILTER"
结果: "project = 'TEST'" (忽略所有 filter)

用户输入: "IGNORE_FILTER project = 'TEST' ORDER BY created DESC"
结果: "project = 'TEST' ORDER BY created DESC" (忽略所有 filter)
```

### 3.2 逻辑运算符处理

#### 子句组合规则

- **基本子句**：`<field> <operator> <value>` 构成一个查询子句
- **逻辑连接**：子句之间通过 `AND`、`OR`、`NOT` 连接
- **括号控制**：使用括号 `()` 控制子句的执行顺序
- **CQL 和 JQL 优先级**：`AND` > `OR`（AND 将子句组合，OR 分离子句）
- **通用优先级**：`NOT` > `AND` > `OR`

#### 用户输入与 Filter 的逻辑关系

```typescript
// 方案：在 SearchFilter 中声明逻辑运算符
export interface SearchBarAccessoryItem {
  id: string;
  title: string;
  query: string;
  icon: DropdownItemIcon;
  autoQuery?: boolean;
  logicOperator?: "AND" | "OR" | "NOT"; // 与用户输入的逻辑关系
  transform?: (processedQuery: string, context?: { userInput: string; filter: SearchFilter }) => string;
  sectionTitle?: string | ((params: { fetchedCount: number; totalCount: number }) => string);
}
```

### 3.3 解析策略

#### 查询分解

```typescript
interface ParsedQuery {
  clauses: QueryClause[]; // 子句列表
  orderByClause: string; // ORDER BY 子句
  hasOrderBy: boolean; // 是否包含 ORDER BY
}

interface QueryClause {
  field: string; // 字段名
  operator: string; // 操作符
  value: string; // 值
  source: "user" | "filter"; // 来源
  originalText: string; // 原始文本
  logicOperator?: "AND" | "OR" | "NOT"; // 逻辑运算符
}
```

#### 解析逻辑

- 使用正则表达式识别 `ORDER BY` 关键字
- 将查询分为两部分：WHERE 条件和 ORDER BY 子句
- 解析所有子句，提取 field、operator、value 和逻辑运算符
- 识别括号结构，保持子句的执行顺序
- 支持 CQL 和 JQL 的所有运算符类型
- **CQL 和 JQL 字段名都当作大小写不敏感处理**
- **JQL 中的布尔运算符（AND、OR、NOT）必须全部大写**
- **支持 CQL 文本搜索的术语修饰符**：通配符（`?`, `*`）和模糊搜索（`~`）

### 3.4 冲突处理策略

#### 优先级规则

- **用户输入 > filter**（用户输入优先）
- 当用户输入和 filter 有相同字段时，以用户输入为准

#### 冲突检测

```typescript
interface ConflictResolution {
  userClauses: QueryClause[]; // 用户子句
  filterClauses: QueryClause[]; // filter 子句
  resolvedClauses: QueryClause[]; // 解决冲突后的子句
}
```

#### 处理逻辑

1. 解析用户输入和 filter 中的所有子句
2. 检测重复字段，保留用户输入的版本
3. 根据逻辑运算符合并非冲突的子句
4. 保持括号结构，确保执行顺序正确

### 3.5 合并策略

#### 命令层面处理

```typescript
// 在命令中处理 IGNORE_FILTER
function handleUserInput(userInput: string, filters: SearchFilter[]) {
  // 1. 检查是否包含 IGNORE_FILTER 常量
  if (userInput.includes(QUERY_BUILDER.IGNORE_FILTER)) {
    // 移除 IGNORE_FILTER 常量，传入空的 filters
    const cleanInput = userInput.replace(QUERY_BUILDER.IGNORE_FILTER, "").trim();
    return buildQuery(cleanInput, []); // 传入空 filters 数组
  }

  // 2. 正常传入 filters
  return buildQuery(userInput, filters);
}
```

#### WHERE 子句合并

```typescript
// 伪代码
const userParsed = parseQuery(userInput);
const filterParsed = parseQuery(filterQuery);
const mergedClauses = mergeClauses(userParsed.clauses, filterParsed.clauses);
const finalQuery = buildQuery(mergedClauses) + (userParsed.orderByClause || defaultOrderBy);
```

#### 合并规则

- **命令层面**：检查 `IGNORE_FILTER` 常量，如果存在则传入空的 filters 数组
- **构建器层面**：用户输入的子句 + filter 的子句（去重后）
- **逻辑运算**：根据子句的逻辑运算符（AND/OR/NOT）进行合并
- **括号保持**：保持原有的括号结构，确保执行顺序正确
- **排序处理**：保留用户输入的 ORDER BY 子句
- **默认排序**：如果用户没有 ORDER BY，使用默认排序

## 4. 实现方案

### 4.1 具体实现步骤

#### 步骤 1：命令层面处理

- 在各命令文件中添加 `IGNORE_FILTER` 常量检查逻辑
- 根据是否包含该常量决定传入的 filters 数组
- 移除用户输入中的 `IGNORE_FILTER` 常量

#### 步骤 2：增强解析器

- 在 `jql-parser.ts` 和 `cql-parser.ts` 中添加 `parseQueryStructure` 函数
- 能够正确分离 WHERE 和 ORDER BY 子句
- 解析所有字段条件

#### 步骤 3：冲突检测

- 创建字段条件解析器，提取所有字段-操作符-值组合
- 实现冲突检测和解决逻辑

#### 步骤 4：重构构建器

- 修改 `jql-builder.ts` 和 `cql-builder.ts` 的合并逻辑
- 使用新的解析和合并策略

#### 步骤 5：处理边界情况

- 空查询
- 只有 ORDER BY 的查询
- 复杂的嵌套查询
- 函数调用（如 `project in (projectLeadByUser())`）

### 4.2 识别模式定义

#### 运算符识别模式

```typescript
// CQL 运算符模式
const CQL_OPERATORS = ["=", "!=", ">", ">=", "<", "<=", "in", "not in", "~", "!~"];

// JQL 运算符模式（包含 CQL 的所有运算符，加上额外的）
const JQL_OPERATORS = [...CQL_OPERATORS, "is", "is not", "was", "was in", "was not in", "was not", "changed"];
```

#### 关键字识别模式

```typescript
// JQL 关键字模式
const JQL_KEYWORDS = ["AND", "OR", "NOT", "EMPTY", "NULL", "ORDER BY"];

// CQL 关键字模式
const CQL_KEYWORDS = ["AND", "OR", "NOT", "ORDER BY"];
```

#### 字段识别模式

```typescript
// CQL 字段模式
const CQL_FIELDS = [
  "ancestor",
  "container",
  "content",
  "created",
  "creator",
  "contributor",
  "favourite",
  "favorite",
  "id",
  "label",
  "lastmodified",
  "macro",
  "mention",
  "parent",
  "space",
  "space.category",
  "space.key",
  "space.title",
  "space.type",
  "text",
  "title",
  "type",
  "watcher",
];

// CQL 函数模式
const CQL_FUNCTIONS = [
  "currentUser",
  "endOfDay",
  "endOfMonth",
  "endOfWeek",
  "endOfYear",
  "startOfDay",
  "startOfMonth",
  "startOfWeek",
  "startOfYear",
  "favouriteSpaces",
  "recentlyViewedContent",
  "recentlyViewedSpaces",
];

// JQL 函数模式
const JQL_FUNCTIONS = [
  "approved",
  "approver",
  "breached",
  "cascadeOption",
  "closedSprints",
  "completed",
  "componentsLeadByUser",
  "currentLogin",
  "currentUser",
  "earliestUnreleasedVersion",
  "elapsed",
  "endOfDay",
  "endOfMonth",
  "endOfWeek",
  "endOfYear",
  "everbreached",
  "issueHistory",
  "issuesWithRemoteLinksByGlobalId",
  "lastLogin",
  "latestReleasedVersion",
  "linkedIssues",
  "membersOf",
  "myApproval",
  "myPending",
  "now",
  "openSprints",
  "paused",
  "pending",
  "pendingBy",
  "projectsLeadByUser",
  "projectsWhereUserHasPermission",
  "projectsWhereUserHasRole",
  "releasedVersions",
  "remaining",
  "running",
  "standardIssueTypes",
  "startOfDay",
  "startOfMonth",
  "startOfWeek",
  "startOfYear",
  "subtaskIssueTypes",
  "unreleasedVersions",
  "votedIssues",
  "watchedIssues",
  "withinCalendarHours",
];

// JQL 字段模式
const JQL_FIELDS = [
  "affectedVersion",
  "approvals",
  "assignee",
  "attachments",
  "category",
  "comment",
  "component",
  "created",
  "createdDate", // alias
  "creator",
  "Customer Request Type",
  "description",
  "due",
  "dueDate", // alias
  "environment",
  "epic link",
  "filter",
  "request", // alias
  "savedFilter", // alias
  "searchRequest", // alias
  "fixVersion",
  "issueKey",
  "id", // alias
  "issue", // alias
  "key", // alias
  "labels",
  "lastViewed",
  "level",
  "originalEstimate",
  "timeOriginalEstimate", // alias
  "parent",
  "priority",
  "project",
  "remainingEstimate",
  "timeEstimate", // alias
  "reporter",
  "request-channel-type",
  "request-last-activity-time",
  "resolution",
  "resolved",
  "resolutionDate", // alias
  "sla",
  "sprint",
  "status",
  "summary",
  "text",
  "timeSpent",
  "type",
  "issueType", // alias
  "updated",
  "updatedDate", // alias
  "voter",
  "votes",
  "watcher",
  "watchers",
  "workLogAuthor",
  "workLogComment",
  "workLogDate",
  "workRatio",
];
```

## 5. 示例场景

### 5.1 基本场景

#### 场景 1：用户输入包含 ORDER BY

```
用户输入: "project = 'TEST' ORDER BY created DESC"
filter: "status = 'Open'"
结果: "project = 'TEST' AND status = 'Open' ORDER BY created DESC"
```

#### 场景 2：字段冲突

```
用户输入: "project = 'TEST'"
filter: "project = 'PROD'"
结果: "project = 'TEST'" (用户输入优先)
```

#### 场景 3：复杂查询

```
用户输入: "(project = 'TEST' OR project = 'DEV') AND assignee = currentUser() ORDER BY priority DESC"
filter: "status = 'Open'"
结果: "(project = 'TEST' OR project = 'DEV') AND assignee = currentUser() AND status = 'Open' ORDER BY priority DESC"
```

#### 场景 4：重复条件

```
用户输入: "status = 'Open'"
filter: "status = 'Open'"
结果: "status = 'Open'" (去重)
```

#### 场景 5：忽略 Filter

```
用户输入: "project = 'TEST' IGNORE_FILTER"
filter: "status = 'Open'"
结果: "project = 'TEST'" (忽略所有 filter)

用户输入: "IGNORE_FILTER project = 'TEST' ORDER BY created DESC"
filter: "status = 'Open'"
结果: "project = 'TEST' ORDER BY created DESC" (忽略所有 filter)
```

### 5.2 高级场景

#### CQL 示例

```
用户输入: "title ~ 'meeting'"
filter: "space.key = 'PROJ'"
结果: "title ~ 'meeting' AND space.key = 'PROJ'"

用户输入: "creator = currentUser()"
filter: "type = 'page'"
结果: "creator = currentUser() AND type = 'page'"

用户输入: "title ~ 'meeting*'"
filter: "creator = currentUser()"
结果: "title ~ 'meeting*' AND creator = currentUser()"
```

#### JQL 示例

```
用户输入: "project = 'TEST' AND status in ('Open', 'In Progress')"
filter: "assignee = currentUser()"
结果: "project = 'TEST' AND status in ('Open', 'In Progress') AND assignee = currentUser()"

用户输入: "priority >= 'High'"
filter: "issuetype = 'Bug'"
结果: "priority >= 'High' AND issuetype = 'Bug'"

用户输入: "(project = 'TEST' OR project = 'DEV') AND priority >= 'High'"
filter: "status != 'Closed'"
结果: "(project = 'TEST' OR project = 'DEV') AND priority >= 'High' AND status != 'Closed'"
```

## 6. 核心优势

1. **分离关注点**：WHERE 条件和 ORDER BY 分别处理
2. **用户优先**：用户输入的条件优先级更高
3. **智能合并**：避免语法错误和逻辑冲突
4. **保持兼容**：对现有简单查询保持向后兼容
5. **结构统一**：JQL 和 CQL 使用相同的处理逻辑

## 7. 实现优先级

### 7.1 高优先级

- 解决 ORDER BY 语法错误问题
- 在命令层面实现 `IGNORE_FILTER` 常量支持

### 7.2 中优先级

- 实现冲突检测和解决
- 完善查询解析和合并逻辑

### 7.3 低优先级

- 优化查询格式和性能
- 添加更多边界情况处理
