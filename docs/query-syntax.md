# JQL/CQL Syntax

## 1. 概述

### 1.1 项目背景

这是一个 Raycast 扩展工具，用于管理 Data Center 版的 Confluence、Jira 等 Atlassian 配套工具，支持搜索 Confluence 或 Jira 的内容。

### 1.2 查询结构

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

## 2. CQL 语法规范

### 2.1 CQL 运算符

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

### 2.2 CQL 关键字

- **AND** - 用于组合多个子句，允许您细化搜索
- **OR** - 用于组合多个子句，允许您扩展搜索
- **NOT** - 用于否定单个子句或复杂的 CQL 查询
- **ORDER BY** - 用于指定搜索结果将按哪些字段排序的子句

### 2.3 CQL 字段

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

### 2.4 CQL 函数

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

### 2.5 CQL 文本搜索规则

- **单个术语（Single Term）**：单个单词，如 `test` 或 `hello`
- **短语（Phrase）**：用双引号包围的单词组，如 `"hello dolly"`
- **通配符搜索**：
  - `?` 表示单个字符通配符，如 `te?t` 匹配 `text` 或 `test`
  - `*` 表示多个字符通配符，如 `win*` 匹配 `Windows`、`Win95` 或 `WindowsNT`
- **模糊搜索**：使用 `~` 符号进行模糊搜索，如 `roam~` 匹配 `foam` 和 `roams`
- **大小写敏感性**：所有查询术语在 Confluence 中都是大小写不敏感的

### 2.6 CQL 查询优先级

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

## 3. JQL 语法规范

### 3.1 JQL 运算符

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

### 3.2 JQL 关键字

- **AND** (与) - 连接子句，所有条件都必须为真
- **OR** (或) - 连接子句，任一条件为真即可
- **NOT** (非) - 否定子句或运算符的逻辑
- **EMPTY** (空) - 表示字段为空值
- **NULL** (空值) - 表示字段为 null 值
- **ORDER BY** (排序) - 指定查询结果的排序方式

**注意：JQL 中的布尔运算符（AND、OR、NOT）必须全部大写。**

### 3.3 JQL 字段

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

### 3.4 JQL 函数

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

### 3.5 JQL 查询优先级

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

## 4. 优先级规则

### 4.1 CQL 查询优先级

CQL 查询中的优先级与 JQL 类似，取决于用于连接子句的关键字。**AND 关键字优先于其他关键字**，因为它将子句组合在一起，本质上将它们转换为一个组合子句。

#### 优先级规则

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

#### 优先级示例

**示例 1**：

```
type=page AND space.key="PROJ" OR creator=currentUser()
```

结果：返回"PROJ"空间中所有页面类型的内容（由 AND 组合的子句），以及当前用户创建的所有内容（由 OR 分离的子句）。

**示例 2**：

```
type=page OR space.key="PROJ" AND creator=currentUser()
```

结果：返回当前用户在"PROJ"空间中创建的页面类型内容（由 AND 组合的子句），以及所有页面类型的内容（由 OR 分离的子句）。

**示例 3**：

```
type=page OR space.key="PROJ" OR creator=currentUser()
```

结果：当只使用 OR 关键字时，所有子句都被视为分离的，优先级相等。

#### 使用括号设置优先级

**示例 1**：

```
type=page AND (space.key="PROJ" OR creator=currentUser())
```

结果：返回属于"PROJ"空间或由当前用户创建的页面类型内容。

**示例 2**：

```
(type=page AND space.key="PROJ") OR creator=currentUser()
```

结果：括号没有效果，因为括号内的子句已经由 AND 连接，查询结果与不使用括号时相同。

### 4.2 JQL 查询优先级

JQL 查询中的优先级取决于用于连接子句的关键字。**AND 关键字优先于其他关键字**，因为它将子句组合在一起，本质上将它们转换为一个组合子句。

#### 优先级规则

- **AND 关键字**：将子句组合在一起，具有更高的优先级
- **OR 关键字**：分离子句，优先级较低
- **括号**：可以设置优先级，括号内的子句优先执行

#### 优先级示例

**示例 1**：

```
status=resolved AND project="Teams in Space" OR assignee=captainjoe
```

结果：返回"Teams in Space"项目中所有已解决的问题（由 AND 组合的子句），以及分配给 captainjoe 的所有现有问题（由 OR 分离的子句）。

**示例 2**：

```
status=resolved OR project="Teams in Space" AND assignee=captainjoe
```

结果：返回 captainjoe 在"Teams in Space"项目中的问题（由 AND 组合的子句），以及所有已解决的问题（由 OR 分离的子句）。

**示例 3**：

```
status=resolved OR project="Teams in Space" OR assignee=captainjoe
```

结果：当只使用 OR 关键字时，所有子句都被视为分离的，优先级相等。

#### 使用括号设置优先级

**示例 1**：

```
status=resolved AND (project="Teams in Space" OR assignee=captainjoe)
```

结果：返回属于"Teams in Space"项目或分配给 captainjoe 的已解决问题。

**示例 2**：

```
(status=resolved AND project="Teams in Space") OR assignee=captainjoe
```

结果：括号没有效果，因为括号内的子句已经由 AND 连接，查询结果与不使用括号时相同。
