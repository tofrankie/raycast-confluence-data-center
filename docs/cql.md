# Confluence Query Language (CQL) 语法参考

## 概述

Confluence Query Language (CQL) 是 Confluence 的查询语言，允许用户通过特定的语法和字段来搜索和过滤内容。CQL 支持复杂的查询条件，可以实现精准的内容检索。

## 基本语法结构

```cql
field operator value [AND|OR field operator value]
```

## 字段 (Fields)

根据 [Confluence Data Center REST API 字段参考](https://developer.atlassian.com/server/confluence/rest/v1010/intro/#field-reference)，以下是官方支持的 CQL 字段：

### 基础字段

| 字段名    | 类型   | 描述     | 示例                |
| --------- | ------ | -------- | ------------------- |
| `id`      | STRING | 内容ID   | `id = "123456"`     |
| `title`   | STRING | 内容标题 | `title ~ "会议"`    |
| `text`    | STRING | 内容正文 | `text ~ "项目计划"` |
| `type`    | STRING | 内容类型 | `type = "page"`     |
| `content` | STRING | 内容     | `content ~ "文档"`  |

### 用户字段

| 字段名        | 类型 | 描述     | 示例                          |
| ------------- | ---- | -------- | ----------------------------- |
| `creator`     | USER | 创建者   | `creator = currentUser()`     |
| `contributor` | USER | 贡献者   | `contributor = currentUser()` |
| `mention`     | USER | 提及用户 | `mention = currentUser()`     |
| `watcher`     | USER | 关注者   | `watcher = currentUser()`     |

### 时间字段

| 字段名         | 类型 | 描述         | 示例                        |
| -------------- | ---- | ------------ | --------------------------- |
| `created`      | DATE | 创建时间     | `created >= "2024-01-01"`   |
| `lastModified` | DATE | 最后修改时间 | `lastModified >= now() -7d` |

### 空间字段

| 字段名           | 类型   | 描述     | 示例                      |
| ---------------- | ------ | -------- | ------------------------- |
| `space`          | STRING | 空间     | `space = "DEV"`           |
| `space.key`      | STRING | 空间键值 | `space.key = "DEV"`       |
| `space.title`    | STRING | 空间标题 | `space.title ~ "开发"`    |
| `space.type`     | STRING | 空间类型 | `space.type = "global"`   |
| `space.category` | STRING | 空间分类 | `space.category = "技术"` |

### 关系字段

| 字段名      | 类型    | 描述     | 示例                   |
| ----------- | ------- | -------- | ---------------------- |
| `ancestor`  | CONTENT | 父级内容 | `ancestor = "123456"`  |
| `parent`    | CONTENT | 父内容   | `parent = "789012"`    |
| `container` | CONTENT | 容器     | `container = "345678"` |

### 状态字段

| 字段名      | 类型 | 描述     | 示例                        |
| ----------- | ---- | -------- | --------------------------- |
| `favourite` | USER | 收藏状态 | `favourite = currentUser()` |

### 其他字段

| 字段名  | 类型   | 描述   | 示例                |
| ------- | ------ | ------ | ------------------- |
| `label` | STRING | 标签   | `label = "project"` |
| `macro` | STRING | 宏名称 | `macro = "jira"`    |

## 内容类型 (Content Types)

| 类型         | 描述     |
| ------------ | -------- |
| `page`       | 页面     |
| `blogpost`   | 博客文章 |
| `comment`    | 评论     |
| `attachment` | 附件     |
| `space`      | 空间     |
| `user`       | 用户     |

## 运算符 (Operators)

### 比较运算符

| 运算符 | 描述     | 示例                     |
| ------ | -------- | ------------------------ |
| `=`    | 等于     | `type = "page"`          |
| `!=`   | 不等于   | `type != "comment"`      |
| `>`    | 大于     | `created > "2024-01-01"` |
| `>=`   | 大于等于 | `modified >= now() -7d`  |
| `<`    | 小于     | `created < "2024-12-31"` |
| `<=`   | 小于等于 | `modified <= now()`      |

### 字符串运算符

| 运算符 | 描述   | 示例              |
| ------ | ------ | ----------------- |
| `~`    | 包含   | `title ~ "会议"`  |
| `!~`   | 不包含 | `title !~ "草稿"` |

### 集合运算符

| 运算符   | 描述       | 示例                             |
| -------- | ---------- | -------------------------------- |
| `IN`     | 在列表中   | `type IN ("page", "blogpost")`   |
| `NOT IN` | 不在列表中 | `space NOT IN ("TEMP", "DRAFT")` |

## 函数 (Functions)

### 用户函数

| 函数            | 描述     | 示例                      |
| --------------- | -------- | ------------------------- |
| `currentUser()` | 当前用户 | `creator = currentUser()` |

### 时间函数

| 函数             | 描述     | 示例                        |
| ---------------- | -------- | --------------------------- |
| `now()`          | 当前时间 | `modified >= now() -7d`     |
| `startOfDay()`   | 当天开始 | `created >= startOfDay()`   |
| `endOfDay()`     | 当天结束 | `created <= endOfDay()`     |
| `startOfWeek()`  | 本周开始 | `created >= startOfWeek()`  |
| `endOfWeek()`    | 本周结束 | `created <= endOfWeek()`    |
| `startOfMonth()` | 本月开始 | `created >= startOfMonth()` |
| `endOfMonth()`   | 本月结束 | `created <= endOfMonth()`   |

### 时间单位

| 单位 | 描述 | 示例        |
| ---- | ---- | ----------- |
| `d`  | 天   | `now() -7d` |
| `w`  | 周   | `now() -2w` |
| `M`  | 月   | `now() -1M` |
| `y`  | 年   | `now() -1y` |

## 逻辑运算符

| 运算符 | 描述   | 示例                                 |
| ------ | ------ | ------------------------------------ |
| `AND`  | 逻辑与 | `type = "page" AND space = "DEV"`    |
| `OR`   | 逻辑或 | `type = "page" OR type = "blogpost"` |
| `NOT`  | 逻辑非 | `NOT type = "comment"`               |

## 常用查询示例

### 基础搜索

```cql
# 搜索标题包含关键词的内容
title ~ "项目计划"

# 搜索特定类型的内容
type = "page"

# 搜索特定空间的内容
space = "DEV"

# 搜索特定用户创建的内容
creator = currentUser()
```

### 组合查询

```cql
# 搜索特定空间的页面
type = "page" AND space = "DEV"

# 搜索最近7天修改的内容
lastModified >= now() -7d

# 搜索被当前用户收藏的内容
favourite = currentUser()

# 搜索提及当前用户的内容
mention = currentUser()
```

### 高级查询

```cql
# 搜索特定标签的内容
label = "urgent"

# 搜索特定父级页面的子内容
ancestor = "123456"

# 搜索包含特定宏的页面
macro = "jira"

# 搜索多个空间的内容
space IN ("DEV", "TEST", "PROD")

# 搜索排除特定类型的内容
type NOT IN ("comment", "attachment")

# 搜索特定容器中的内容
container = "345678"
```

### 时间范围查询

```cql
# 搜索今天创建的内容
created >= startOfDay() AND created <= endOfDay()

# 搜索本周修改的内容
lastModified >= startOfWeek() AND lastModified <= endOfWeek()

# 搜索最近30天创建的内容
created >= now() -30d

# 搜索特定日期范围的内容
created >= "2024-01-01" AND created <= "2024-12-31"
```

### 用户相关查询

```cql
# 搜索当前用户创建的内容
creator = currentUser()

# 搜索当前用户贡献的内容
contributor = currentUser()

# 搜索当前用户收藏的内容
favourite = currentUser()

# 搜索当前用户关注的内容
watcher = currentUser()

# 搜索提及当前用户的内容
mention = currentUser()
```

## 最佳实践

1. **使用引号**: 对于包含空格或特殊字符的值，使用双引号包围
2. **组合条件**: 使用 `AND`、`OR`、`NOT` 组合多个条件
3. **时间查询**: 使用时间函数进行相对时间查询
4. **性能优化**: 优先使用精确匹配 (`=`) 而不是模糊匹配 (`~`)
5. **索引字段**: 优先使用已建立索引的字段进行查询

## 注意事项

1. CQL 查询区分大小写
2. 某些字段可能需要特定权限才能访问
3. 复杂的查询可能影响性能
4. 不同版本的 Confluence 可能支持不同的字段和函数

## 参考资料

- [Confluence Data Center REST API - Advanced Searching using CQL](https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql)
- [Confluence Cloud CQL Fields](https://developer.atlassian.com/cloud/confluence/cql-fields/)
- [Adding a Field to CQL](https://developer.atlassian.com/server/confluence/adding-a-field-to-cql/)
