package fun.faulkner.kami.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.response.CategoryResponse;
import fun.faulkner.kami.dto.response.PageResponse;
import fun.faulkner.kami.dto.response.PostDetailResponse;
import fun.faulkner.kami.dto.response.PostSummaryResponse;
import fun.faulkner.kami.dto.response.TagResponse;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.service.ArticleService;
import fun.faulkner.kami.service.CategoryService;
import fun.faulkner.kami.service.TagService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;

    public PostController(
            ArticleService articleService,
            CategoryService categoryService,
            TagService tagService
    ) {
        this.articleService = articleService;
        this.categoryService = categoryService;
        this.tagService = tagService;
    }

    @GetMapping
    public PageResponse<PostSummaryResponse> listPosts(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag
    ) {
        Page<ArticleEntity> articlePage = articleService.listPublishedArticles(page, size, category, tag);
        List<ArticleEntity> articles = articlePage.getRecords();
        Map<Long, CategoryResponse> categoryResponseMap = buildCategoryResponseMap(articles);
        Map<Long, List<TagResponse>> tagResponseMap = buildTagResponseMap(articles);

        List<PostSummaryResponse> items = articles.stream()
                .map(article -> toPostSummaryResponse(article, categoryResponseMap, tagResponseMap))
                .toList();

        return new PageResponse<>(
                items,
                articlePage.getCurrent(),
                articlePage.getSize(),
                articlePage.getTotal(),
                articlePage.getPages()
        );
    }

    @GetMapping("/{slug}")
    public PostDetailResponse getPostBySlug(@PathVariable String slug) {
        ArticleEntity article = articleService.getPublishedArticleBySlug(slug);

        return new PostDetailResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getContent(),
                article.getCoverImage(),
                article.getWordCount(),
                article.getReadingTimeMinutes(),
                article.getPublishedAt(),
                buildCategoryResponse(article.getCategoryId()),
                listTagResponses(article.getId())
        );
    }

    private Map<Long, CategoryResponse> buildCategoryResponseMap(List<ArticleEntity> articles) {
        if (articles == null || articles.isEmpty()) {
            return Map.of();
        }

        List<Long> categoryIds = articles.stream()
                .map(ArticleEntity::getCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (categoryIds.isEmpty()) {
            return Map.of();
        }

        List<CategoryEntity> categories = categoryService.listCategoriesByIds(categoryIds);
        Map<Long, CategoryResponse> categoryResponseMap = new HashMap<>();

        for (CategoryEntity category : categories) {
            categoryResponseMap.put(category.getId(), toCategoryResponse(category));
        }

        return categoryResponseMap;
    }

    private Map<Long, List<TagResponse>> buildTagResponseMap(List<ArticleEntity> articles) {
        if (articles == null || articles.isEmpty()) {
            return Map.of();
        }

        List<Long> articleIds = articles.stream()
                .map(ArticleEntity::getId)
                .toList();

        Map<Long, List<TagEntity>> tagsByArticleId = tagService.listTagsGroupedByArticleIds(articleIds);
        if (tagsByArticleId.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<TagResponse>> tagResponseMap = new HashMap<>();
        for (Map.Entry<Long, List<TagEntity>> entry : tagsByArticleId.entrySet()) {
            List<TagResponse> tagResponses = entry.getValue().stream()
                    .map(this::toTagResponse)
                    .toList();
            tagResponseMap.put(entry.getKey(), tagResponses);
        }

        return tagResponseMap;
    }

    private CategoryResponse buildCategoryResponse(Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        CategoryEntity category = categoryService.getCategoryById(categoryId);
        return toCategoryResponse(category);
    }

    private List<TagResponse> listTagResponses(Long articleId) {
        return articleService.getArticleTags(articleId).stream()
                .map(this::toTagResponse)
                .toList();
    }

    private PostSummaryResponse toPostSummaryResponse(
            ArticleEntity article,
            Map<Long, CategoryResponse> categoryResponseMap,
            Map<Long, List<TagResponse>> tagResponseMap
    ) {
        CategoryResponse categoryResponse = null;
        Long categoryId = article.getCategoryId();

        if (categoryId != null) {
            categoryResponse = categoryResponseMap.get(categoryId);
        }

        return new PostSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getCoverImage(),
                article.getWordCount(),
                article.getReadingTimeMinutes(),
                article.getPublishedAt(),
                categoryResponse,
                tagResponseMap.getOrDefault(article.getId(), List.of())
        );
    }

    private CategoryResponse toCategoryResponse(CategoryEntity category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getSortOrder()
        );
    }

    private TagResponse toTagResponse(TagEntity tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getSlug()
        );
    }
}
