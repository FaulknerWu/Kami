# ADR-0002: 文章管理

## 状态

Proposed

## 上下文

文章是博客系统的核心实体。需要支持管理员对文章的完整生命周期管理（创建、查看、编辑、删除），文章内容使用 Markdown 格式编写。

前台（读者侧）需要文章列表和详情的展示能力；后台（管理侧）需要文章的编辑和管理能力。

## 决策

### 数据模型

#### article 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(255) | NOT NULL | 文章标题 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 友好的文章标识，用于前台路由 |
| summary | VARCHAR(500) | NOT NULL | 文章摘要，列表页展示 |
| content | TEXT | NOT NULL | Markdown 原始内容 |
| cover_image | VARCHAR(500) | | 封面图 URL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | 文章状态：DRAFT / PUBLISHED |
| published_at | TIMESTAMP | | 发布时间，手动发布时写入 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

### 后端 API

#### 前台接口（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 已发布文章分页列表 |
| GET | /api/posts/{slug} | 按 slug 获取已发布文章详情 |

#### 后台接口（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/posts | 全部文章分页列表（含草稿） |
| GET | /api/admin/posts/{id} | 按 ID 获取文章详情 |
| POST | /api/admin/posts | 创建文章 |
| PUT | /api/admin/posts/{id} | 更新文章 |
| DELETE | /api/admin/posts/{id} | 删除文章 |
| PUT | /api/admin/posts/{id}/publish | 发布文章（DRAFT → PUBLISHED） |
| PUT | /api/admin/posts/{id}/unpublish | 撤回发布（PUBLISHED → DRAFT） |

#### 分页与排序

- 前台列表按 `published_at DESC` 排序，仅返回 `PUBLISHED` 状态的文章
- 后台列表按 `updated_at DESC` 排序，返回所有状态的文章
- 分页参数：`page`（从 1 开始）、`size`（默认 10）

### 前端页面

#### 前台

| 路由 | 说明 |
|------|------|
| / | 首页，展示最新文章列表 |
| /posts/[slug] | 文章详情页，渲染 Markdown 内容 |

#### 后台

| 路由 | 说明 |
|------|------|
| /admin/posts | 文章管理列表 |
| /admin/posts/new | 创建文章（Markdown 编辑器） |
| /admin/posts/[id]/edit | 编辑文章 |
