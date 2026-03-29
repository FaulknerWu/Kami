import { describe, expect, it } from "vitest";
import {
  toArchiveYearGroups,
  toArticleCardViewModel,
  toArticleDetailViewModel,
  toCategoryListItemViewModels,
  toSidebarStatsViewModel,
  toTagListItemViewModels,
} from "../adapters/public-content";
import type {
  ApiPostDetail,
  ApiPostSummary,
  ApiPublicCategory,
  ApiPublicTag,
} from "../api/types";

const basePostSummary: ApiPostSummary = {
  id: 1,
  title: "理解 React Server Components",
  slug: "react-server-components",
  summary: "这是一段用于计算阅读时长的文章摘要，用来验证适配层能输出稳定的卡片数据。",
  coverImage: "https://example.com/cover.jpg",
  publishedAt: "2026-03-29T12:00:00",
  category: {
    id: 1,
    name: "前端开发",
    slug: "frontend",
    description: "前端相关文章",
    sortOrder: 1,
  },
  tags: [
    {
      id: 10,
      name: "React",
      slug: "react",
    },
  ],
};

describe("public content adapters", () => {
  it("toArticleCardViewModel 应该输出列表页可用结构", () => {
    const result = toArticleCardViewModel(basePostSummary);

    expect(result.slug).toBe("react-server-components");
    expect(result.categoryName).toBe("前端开发");
    expect(result.dateLabel).toBe("2026-03-29");
    expect(result.tags).toHaveLength(1);
    expect(result.readTimeLabel).toMatch(/min read$/);
  });

  it("toArticleDetailViewModel 应该保留详情页正文与封面", () => {
    const detail: ApiPostDetail = {
      ...basePostSummary,
      content: "# 正文\n\n这是一段 Markdown 正文。",
    };

    const result = toArticleDetailViewModel(detail);

    expect(result.content).toContain("Markdown");
    expect(result.coverImage).toBe("https://example.com/cover.jpg");
    expect(result.readTimeLabel).toBe(toArticleCardViewModel(basePostSummary).readTimeLabel);
  });

  it("toCategoryListItemViewModels 应该映射分类计数", () => {
    const categories: ApiPublicCategory[] = [
      {
        id: 1,
        name: "前端开发",
        slug: "frontend",
        description: "前端相关文章",
        sortOrder: 1,
        articleCount: 12,
      },
    ];

    const result = toCategoryListItemViewModels(categories);

    expect(result).toEqual([
      {
        id: 1,
        name: "前端开发",
        slug: "frontend",
        count: 12,
      },
    ]);
  });

  it("toTagListItemViewModels 应该映射标签计数", () => {
    const tags: ApiPublicTag[] = [
      {
        id: 2,
        name: "React",
        slug: "react",
        articleCount: 7,
      },
    ];

    const result = toTagListItemViewModels(tags);

    expect(result).toEqual([
      {
        id: 2,
        name: "React",
        slug: "react",
        count: 7,
      },
    ]);
  });

  it("toArchiveYearGroups 应该按年份分组并按时间倒序排列", () => {
    const result = toArchiveYearGroups([
      basePostSummary,
      {
        ...basePostSummary,
        id: 2,
        slug: "next-16",
        title: "Next.js 16 体验",
        publishedAt: "2025-02-01T08:00:00",
      },
    ]);

    expect(result[0].year).toBe("2026");
    expect(result[0].items[0].monthDayLabel).toBe("03-29");
    expect(result[1].year).toBe("2025");
  });

  it("toSidebarStatsViewModel 应该生成侧栏统计", () => {
    expect(toSidebarStatsViewModel(51, 8, 64)).toEqual({
      articles: 51,
      categories: 8,
      tags: 64,
    });
  });
});
