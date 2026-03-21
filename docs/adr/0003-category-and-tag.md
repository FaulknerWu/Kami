# ADR-0003: 分类与标签

## 状态

Proposed

## 上下文

博客文章需要分类组织和标签标记能力，帮助读者按主题浏览内容。分类和标签是两种不同维度的内容组织方式：

- **分类（Category）**：树状结构，文章归属于某一个分类（单选），体现内容的主要归属
- **标签（Tag）**：扁平结构，文章可以打多个标签（多选），体现内容的多维特征

## 决策

### 数据模型

#### category 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名称 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 友好标识 |
| description | VARCHAR(255) | | 分类描述 |
| sort_order | INT | NOT NULL, DEFAULT 0 | 排序权重，越小越靠前 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

#### tag 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名称 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 友好标识 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

#### article_tag 表（多对多关联）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| article_id | BIGINT | FK → article.id, NOT NULL | 文章 ID |
| tag_id | BIGINT | FK → tag.id, NOT NULL | 标签 ID |
| | | PK (article_id, tag_id) | 联合主键，防止重复关联 |

#### article 表变更

在 ADR-0002 的 article 表基础上新增：

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| category_id | BIGINT | FK → category.id | 所属分类，可为空（未分类） |

### 关系说明

- **文章与分类**：多对一。一篇文章最多归属一个分类，一个分类下可有多篇文章
- **文章与标签**：多对多。通过 article_tag 中间表关联，一篇文章可有多个标签，一个标签可被多篇文章使用
- 分类设计为一级扁平结构，不做多级嵌套（博客场景下层级过深无实际意义，后续需要时再扩展）

### 后端 API

#### 前台接口（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 分类列表（含各分类下的文章数量） |
| GET | /api/tags | 标签列表（含各标签下的文章数量） |
| GET | /api/posts?category={slug} | 按分类筛选文章 |
| GET | /api/posts?tag={slug} | 按标签筛选文章 |

#### 后台接口（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/categories | 创建分类 |
| PUT | /api/admin/categories/{id} | 更新分类 |
| DELETE | /api/admin/categories/{id} | 删除分类（需处理关联文章） |
| POST | /api/admin/tags | 创建标签 |
| PUT | /api/admin/tags/{id} | 更新标签 |
| DELETE | /api/admin/tags/{id} | 删除标签（需处理关联文章） |

#### 删除策略

- **删除分类**：将关联文章的 category_id 置为 NULL（变为"未分类"），不级联删除文章
- **删除标签**：删除 article_tag 中间表的关联记录，不级联删除文章

#### 文章 API 联动

创建/更新文章时，请求体中包含分类和标签信息：

```json
{
  "title": "文章标题",
  "content": "Markdown 内容",
  "categoryId": 1,
  "tagIds": [1, 2, 3]
}
```

文章列表和详情的响应中携带分类和标签的完整信息，避免前端二次请求。

### 前端页面

#### 前台

| 路由 | 说明 |
|------|------|
| /categories/[slug] | 按分类浏览文章列表 |
| /tags/[slug] | 按标签浏览文章列表 |

文章详情页和列表页展示文章所属的分类和标签，标签以可点击的标签组形式展示。

#### 后台

| 路由 | 说明 |
|------|------|
| /admin/categories | 分类管理（列表 + 增删改） |
| /admin/tags | 标签管理（列表 + 增删改） |
