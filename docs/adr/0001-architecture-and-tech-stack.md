# ADR-0001: 整体架构与技术选型

## 状态

Proposed

## 上下文

此项目核心目标有二：

1. **练习目的**：通过实际项目练习 Spring 系列框架，以及 Java 25 LTS 的新版本特性
2. **功能目的**：构建一个基本可用的博客系统，功能按迭代逐步交付

## 决策

### 整体架构

前后端分离的单体架构，Docker Compose 统一编排本地开发环境。

### 后端技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 语言 | Java 25 LTS | 练习最新 LTS 版本特性 |
| 框架 | Spring Boot | 主框架，练习 Spring 生态 |
| 构建工具 | Gradle (Kotlin DSL) | 类型安全的构建脚本，IDE 补全友好 |
| 数据访问 | MyBatis-Plus | 兼顾 ORM 便利性与 SQL 控制力 |
| 数据库迁移 | Flyway | 基于 SQL 脚本的版本化 Schema 管理 |
| 认证授权 | Spring Security + JWT | 无状态认证，适配前后端分离架构 |
| API 风格 | RESTful | Spring MVC 原生支持 |
| API 文档 | SpringDoc OpenAPI (Swagger) | 自动生成 API 文档，方便前后端联调 |

### 前端技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js | React 全栈框架，支持 SSR/SSG/ISR |
| 语言 | TypeScript | 类型安全 |
| UI 组件 | shadcn/ui | 基于 Radix UI 的可定制组件库 |
| 样式方案 | Tailwind CSS | 原子化 CSS，与 shadcn/ui 深度集成 |
| 包管理器 | pnpm | 快速、磁盘效率高 |

### 基础设施

| 类别 | 选型 | 说明 |
|------|------|------|
| 数据库 | PostgreSQL (最新稳定版) | 开源关系型数据库 |
| 本地编排 | Docker Compose | 一键启动完整开发环境 |
| 容器化 | Dockerfile | 前后端各自独立容器镜像 |



