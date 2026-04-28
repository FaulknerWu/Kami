import { describe, expect, it } from "vitest";
import {
  toAdminContentStatus,
  toApiContentStatus,
  toArticleMutationRequest,
  toCategoryViewModel,
  toContactMethodViewModel,
  toContactType,
  toPageEditorInitialViewModel,
  toPageListItemViewModel,
  toPageMutationRequest,
  toPostEditorInitialViewModel,
  toPostListItemViewModel,
  toSiteContactsMutationRequest,
  toSiteProfileMutationRequest,
  toSiteSettingsViewModel,
  toTagViewModel,
} from "@/lib/admin/adapters";
import type {
  AdminArticleDetailResponse,
  AdminArticleSummaryResponse,
  AdminCategoryResponse,
  AdminPageDetailResponse,
  AdminPageSummaryResponse,
  AdminSiteContactResponse,
  AdminSiteProfileResponse,
  AdminTagResponse,
} from "@/lib/admin/types";

const category: AdminCategoryResponse = {
  id: 1,
  name: "技术",
  slug: "tech",
  description: "工程实践",
  sortOrder: 2,
};

const tag: AdminTagResponse = {
  id: 10,
  name: "Next.js",
  slug: "nextjs",
};

const articleSummary: AdminArticleSummaryResponse = {
  id: 100,
  title: "后台集成记录",
  slug: "admin-integration",
  summary: "记录后台集成过程",
  wordCount: 800,
  readingTimeMinutes: 3,
  status: "PUBLISHED",
  category,
  tags: [tag],
  publishedAt: "2026-04-20T10:00:00",
  updatedAt: "2026-04-21T11:30:00",
};

const articleDetail: AdminArticleDetailResponse = {
  ...articleSummary,
  content: "# 正文",
  coverImage: "https://example.com/cover.jpg",
  createdAt: "2026-04-19T08:00:00",
  updatedAt: "2026-04-21T11:30:00",
  publishedAt: "2026-04-20T10:00:00",
};

const pageSummary: AdminPageSummaryResponse = {
  id: 200,
  title: "关于",
  slug: "about",
  summary: "关于页面",
  status: "DRAFT",
  publishedAt: null,
  updatedAt: "2026-04-22T09:15:00",
};

const pageDetail: AdminPageDetailResponse = {
  ...pageSummary,
  coverImage: null,
  contentMarkdown: "# 关于",
  seoTitle: null,
  seoDescription: null,
  createdAt: "2026-04-20T08:00:00",
};

const siteProfile: AdminSiteProfileResponse = {
  id: 1,
  siteName: "Kami",
  heroTitle: "安静写作",
  heroTagline: "记录工程与生活",
  authorName: "Kami",
  authorBio: "独立开发者",
  avatarUrl: "/avatar.png",
  coverImageUrl: "/cover.jpg",
  canonicalBaseUrl: "https://kami.dev",
  defaultShareImageUrl: "/share.jpg",
};

const contact: AdminSiteContactResponse = {
  id: 1,
  type: "GITHUB",
  label: "GitHub",
  value: null,
  url: "https://github.com/kami",
  sortOrder: 1,
  isPublic: true,
};

describe("admin adapters", () => {
  it("toAdminContentStatus 应该把后端枚举映射为前端状态", () => {
    expect(toAdminContentStatus("PUBLISHED")).toBe("published");
    expect(toAdminContentStatus("DRAFT")).toBe("draft");
  });

  it("toApiContentStatus 应该把前端状态映射为后端枚举", () => {
    expect(toApiContentStatus("published")).toBe("PUBLISHED");
    expect(toApiContentStatus("draft")).toBe("DRAFT");
  });

  it("toCategoryViewModel 应该保留分类排序并补充计数", () => {
    expect(toCategoryViewModel(category, 5)).toEqual({
      id: "1",
      apiId: 1,
      name: "技术",
      slug: "tech",
      description: "工程实践",
      count: 5,
      sortOrder: 2,
    });
  });

  it("toTagViewModel 应该把标签 id 转成 UI 可用字符串", () => {
    expect(toTagViewModel(tag, 3)).toEqual({
      id: "10",
      apiId: 10,
      name: "Next.js",
      slug: "nextjs",
      count: 3,
    });
  });

  it("toPostListItemViewModel 应该生成文章列表视图模型", () => {
    const result = toPostListItemViewModel(articleSummary);

    expect(result.id).toBe("100");
    expect(result.status).toBe("published");
    expect(result.categoryName).toBe("技术");
    expect(result.updatedAtLabel).toBe("2026-04-21 11:30");
    expect(result.tags[0].name).toBe("Next.js");
  });

  it("toPostEditorInitialViewModel 应该生成文章编辑器初始值", () => {
    const result = toPostEditorInitialViewModel(articleDetail);

    expect(result.cover).toBe("https://example.com/cover.jpg");
    expect(result.categoryId).toBe("1");
    expect(result.tagIds).toEqual(["10"]);
    expect(result.content).toBe("# 正文");
  });

  it("toPageListItemViewModel 应该生成页面列表视图模型", () => {
    const result = toPageListItemViewModel(pageSummary);

    expect(result.id).toBe("200");
    expect(result.status).toBe("draft");
    expect(result.updatedAtLabel).toBe("2026-04-22 09:15");
  });

  it("toPageEditorInitialViewModel 应该生成页面编辑器初始值", () => {
    const result = toPageEditorInitialViewModel(pageDetail);

    expect(result.title).toBe("关于");
    expect(result.content).toBe("# 关于");
    expect(result.categoryId).toBe("");
    expect(result.tagIds).toEqual([]);
  });

  it("toArticleMutationRequest 应该转换文章保存载荷", () => {
    const result = toArticleMutationRequest({
      title: "  标题  ",
      slug: " post-slug ",
      summary: " 摘要 ",
      content: "# 正文",
      cover: " ",
      categoryId: "1",
      tagIds: ["10", "x"],
    });

    expect(result).toEqual({
      title: "标题",
      slug: "post-slug",
      summary: "摘要",
      content: "# 正文",
      coverImage: null,
      categoryId: 1,
      tagIds: [10],
    });
  });

  it("toPageMutationRequest 应该转换页面保存载荷", () => {
    const result = toPageMutationRequest({
      title: " 关于 ",
      slug: " about ",
      summary: "",
      content: "# 关于",
      cover: "/cover.jpg",
    });

    expect(result).toEqual({
      slug: "about",
      title: "关于",
      summary: null,
      coverImage: "/cover.jpg",
      contentMarkdown: "# 关于",
      seoTitle: null,
      seoDescription: null,
    });
  });

  it("toSiteSettingsViewModel 应该映射站点设置表单", () => {
    const result = toSiteSettingsViewModel(siteProfile);

    expect(result.siteName).toBe("Kami");
    expect(result.homeTitle).toBe("安静写作");
    expect(result.shareImage).toBe("/share.jpg");
  });

  it("toSiteProfileMutationRequest 应该转换站点设置保存载荷", () => {
    const result = toSiteProfileMutationRequest({
      siteName: " Kami ",
      homeTitle: "",
      subtitle: " 记录 ",
      authorName: " Kami ",
      authorBio: "",
      avatar: "/avatar.png",
      cover: "",
      shareImage: "/share.jpg",
      siteUrl: "https://kami.dev",
    });

    expect(result).toEqual({
      siteName: "Kami",
      heroTitle: null,
      heroTagline: "记录",
      authorName: "Kami",
      authorBio: null,
      avatarUrl: "/avatar.png",
      coverImageUrl: null,
      canonicalBaseUrl: "https://kami.dev",
      defaultShareImageUrl: "/share.jpg",
    });
  });

  it("toContactMethodViewModel 应该合并联系方式地址字段", () => {
    const result = toContactMethodViewModel(contact);

    expect(result.type).toBe("github");
    expect(result.value).toBe("https://github.com/kami");
    expect(result.visible).toBe(true);
  });

  it("toContactType 应该把未知类型降级为 custom", () => {
    expect(toContactType("RSS")).toBe("rss");
    expect(toContactType("MASTODON")).toBe("custom");
  });

  it("toSiteContactsMutationRequest 应该按类型拆分 value 与 url", () => {
    const result = toSiteContactsMutationRequest([
      {
        id: "1",
        apiId: 1,
        type: "email",
        label: "邮箱",
        value: "hi@kami.dev",
        visible: true,
        sortOrder: 1,
      },
      {
        id: "2",
        apiId: 2,
        type: "github",
        label: "GitHub",
        value: "https://github.com/kami",
        visible: false,
        sortOrder: 2,
      },
    ]);

    expect(result.contacts).toEqual([
      {
        type: "EMAIL",
        label: "邮箱",
        value: "hi@kami.dev",
        url: null,
        sortOrder: 1,
        isPublic: true,
      },
      {
        type: "GITHUB",
        label: "GitHub",
        value: null,
        url: "https://github.com/kami",
        sortOrder: 2,
        isPublic: false,
      },
    ]);
  });
});
