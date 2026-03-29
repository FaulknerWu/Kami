# ADR-0004: 读者端站点资料、页面模型与文章扩展元数据

## 状态

Proposed

## 上下文

当前读者端已经接入以下公开接口：

- `GET /api/posts`
- `GET /api/posts/{slug}`
- `GET /api/categories`
- `GET /api/tags`

但仍有一部分读者端内容依赖前端 Mock：

- 站点作者资料：头像、封面、昵称、简介
- 关于页正文与联系方式
- 阅读时长展示

其中，站点资料与关于页内容当前集中保留在 `frontend/lib/mocks/site-profile.ts`，阅读时长则由前端基于摘要长度估算。

这一状态虽然能支撑当前页面上线，但存在两个明显问题：

1. 站点级内容、页面级内容、文章级元数据尚未分层，后续继续补字段会把模型越堆越乱
2. 如果将所有 page 都限制为 Markdown 内容页，会直接限制前端独立设计能力，不适合当前博客的视觉表达目标

因此，这一阶段需要补齐后端模型，但必须保证后续新增静态页、专题页、友情链接页时，不需要反复推翻已有设计。

## 决策

### 总体原则

- 文章 `article` 继续承担时间流内容，进入首页、归档、分类、标签体系
- 页面 `page` 作为独立内容模型存在，但不等同于文章，也不要求所有页面都走 Markdown 渲染
- 前端保留独立编写页面代码的能力，后端只负责页面身份、发布状态、SEO 信息和页面数据来源
- 站点级全局信息与页面级内容分离，避免将关于页、友情链接页等内容继续塞进站点资料表

### 数据模型

#### page 表

`page` 用于描述站点中的静态或半静态页面，例如 `about`、`friends`、`projects`、`privacy`。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | 页面路由标识 |
| title | VARCHAR(255) | NOT NULL | 页面标题 |
| summary | VARCHAR(500) | | 页面摘要 |
| cover_image | VARCHAR(500) | | 页面封面图 |
| render_mode | VARCHAR(20) | NOT NULL | 渲染模式：`CODED` / `MARKDOWN` |
| renderer_key | VARCHAR(100) | | 前端代码页标识，例如 `about` |
| content_markdown | TEXT | | Markdown 内容，仅用于简单文档页 |
| payload | JSONB | | 页面专属结构化数据，供前端代码页消费 |
| seo_title | VARCHAR(255) | | SEO 标题 |
| seo_description | VARCHAR(500) | | SEO 描述 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | 页面状态：`DRAFT` / `PUBLISHED` |
| published_at | TIMESTAMP | | 发布时间 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

设计约束：

- `render_mode = CODED` 时，页面由前端独立代码实现，后端返回 `payload`
- `render_mode = MARKDOWN` 时，页面按 Markdown 内容渲染，作为简单说明类页面兜底
- `renderer_key` 用于前端选择具体页面实现，但不承担路由唯一性，路由唯一性仍由 `slug` 保证
- `payload` 只承担页面专属数据，不承担站点级全局信息

#### site_profile 表

`site_profile` 用于站点级全局展示信息，不承担具体页面正文。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| site_name | VARCHAR(100) | NOT NULL | 站点名称 |
| hero_title | VARCHAR(255) | | 首页主标题 |
| hero_tagline | VARCHAR(255) | | 首页副标题 |
| author_name | VARCHAR(100) | NOT NULL | 作者名称 |
| author_bio | VARCHAR(500) | | 作者简介 |
| avatar_url | VARCHAR(500) | | 头像 URL |
| cover_image_url | VARCHAR(500) | | 默认封面 URL |
| canonical_base_url | VARCHAR(255) | | 站点规范 URL 前缀 |
| default_share_image_url | VARCHAR(500) | | 默认分享图 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

#### site_contact 表

`site_contact` 用于可排序、可扩展的联系方式，避免每新增一种联系方式都修改 `site_profile` 结构。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| type | VARCHAR(50) | NOT NULL | 联系方式类型，例如 `EMAIL`、`GITHUB` |
| label | VARCHAR(100) | NOT NULL | 展示文案 |
| value | VARCHAR(255) | | 原始值，例如邮箱地址 |
| url | VARCHAR(500) | | 跳转地址 |
| sort_order | INT | NOT NULL, DEFAULT 0 | 排序权重 |
| is_public | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否对前台公开 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

#### article 表变更

在 ADR-0002 的 `article` 表基础上新增：

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| word_count | INT | NOT NULL, DEFAULT 0 | 正文字数 |
| reading_time_minutes | INT | NOT NULL, DEFAULT 1 | 预计算阅读时长，单位分钟 |

设计约束：

- `word_count` 与 `reading_time_minutes` 由后端统一计算并持久化
- 前端不再基于摘要估算阅读时长，避免列表页与详情页出现不一致

### 内容边界

- `site_profile` 只存站点级全局信息，不存关于页正文、友情链接列表、项目列表等页面内容
- `page` 只存页面本身的数据与元信息，不存全局站点资料
- `article` 只存文章内容与文章元数据，不承担站点页面能力

### 渲染模式约定

#### 代码页

对于 `about` 这类需要独立视觉设计的页面，采用 `CODED` 模式：

- 前端仍然保留独立路由文件与独立 React 组件
- 后端通过 `GET /api/pages/{slug}` 返回该页面的 `payload`
- 前端根据 `renderer_key` 或 `slug` 选择对应实现，自由组织布局、动画、组件和数据映射

#### Markdown 页

对于隐私政策、免责声明等说明类页面，采用 `MARKDOWN` 模式：

- 后端返回 `content_markdown`
- 前端使用统一 Markdown 渲染流程

这一设计允许博客同时拥有“可高度定制的页面”和“低成本维护的文档页”，而不需要引入低代码页面引擎。

### 后端 API

#### 前台接口（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/site/profile | 获取站点资料与公开联系方式 |
| GET | /api/pages/{slug} | 按 slug 获取已发布页面 |
| GET | /api/posts | 已发布文章分页列表，补充阅读时长与字数 |
| GET | /api/posts/{slug} | 已发布文章详情，补充阅读时长与字数 |

#### 后台接口（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/site/profile | 获取站点资料 |
| PUT | /api/admin/site/profile | 更新站点资料 |
| GET | /api/admin/site/contacts | 获取联系方式列表 |
| PUT | /api/admin/site/contacts | 全量更新联系方式列表 |
| GET | /api/admin/pages | 页面分页列表 |
| GET | /api/admin/pages/{id} | 页面详情 |
| POST | /api/admin/pages | 创建页面 |
| PUT | /api/admin/pages/{id} | 更新页面 |
| DELETE | /api/admin/pages/{id} | 删除页面 |
| PUT | /api/admin/pages/{id}/publish | 发布页面 |
| PUT | /api/admin/pages/{id}/unpublish | 撤回页面 |

### 实现要求

- 后端代码层可以使用 `PageEntity`、`PageService` 等命名，但数据库表名统一为 `page`
- `about` 页面数据由前端 Mock 迁移为：
  - 站点级部分进入 `site_profile`
  - 联系方式进入 `site_contact`
  - 页面正文、技能列表等进入 `page.payload`
- 页面模型不引入向前兼容适配层，旧 Mock 替换完成后直接删除
- 当前阶段不纳入搜索能力与分享能力设计，避免在站点内容模型尚未稳定时过早扩展边界

## 后续工作

1. 新增 Flyway 迁移，创建 `page`、`site_profile`、`site_contact`，并为 `article` 增加 `word_count`、`reading_time_minutes`
2. 编写初始化数据，将现有 `frontend/lib/mocks/site-profile.ts` 中的数据拆分迁移到新表
3. 新增站点资料与页面的公开接口
4. 新增站点资料与页面的后台管理接口
5. 将前端关于页、侧边栏和阅读时长展示切换到真实接口
6. 删除与 ADR-0004 相关的前端临时 Mock 和阅读时长估算逻辑

## 结果

该方案将读者端当前缺失的内容能力拆成站点级、页面级、文章级三层模型：

- 站点资料有明确归属
- 页面支持前端独立设计，不会被强行压缩成单一 Markdown 页面
- 阅读时长由后端统一产出，前后表现保持一致

同时，搜索与分享暂不纳入本轮设计，避免后续在错误的内容边界上继续叠加能力。
