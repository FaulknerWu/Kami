package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.dto.response.AdminArticleDetailResponse;
import fun.faulkner.kami.dto.response.ArticleSummaryResponse;
import fun.faulkner.kami.dto.response.CategoryResponse;
import fun.faulkner.kami.dto.response.TagResponse;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.service.ArticleService;
import fun.faulkner.kami.service.CategoryService;
import fun.faulkner.kami.service.TagService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RequestMapping("/api/admin/posts")
@RestController
public class AdminArticleController {
    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;

    public AdminArticleController(
            ArticleService articleService,
            CategoryService categoryService,
            TagService tagService
    ) {
        this.articleService = articleService;
        this.categoryService = categoryService;
        this.tagService = tagService;
    }

    @GetMapping
    public List<ArticleSummaryResponse> listArticles(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size
    ) {
        List<ArticleEntity> articles = articleService.listArticles(page, size);
        Map<Long, CategoryResponse> categoryResponseMap = buildCategoryResponseMap(articles);
        Map<Long, List<TagResponse>> tagResponseMap = buildTagResponseMap(articles);

        return articles.stream()
                .map(article -> toArticleSummaryResponse(article, categoryResponseMap, tagResponseMap))
                .toList();
    }

    @GetMapping("/{id}")
    public AdminArticleDetailResponse getArticleById(@PathVariable Long id) {
        ArticleEntity article = articleService.getArticleById(id);
        return toAdminArticleDetailResponse(article);
    }

    @PostMapping
    public AdminArticleDetailResponse createArticle(@RequestBody @Valid CreateArticleRequest request) {
        ArticleEntity article = articleService.createArticle(request);
        return toAdminArticleDetailResponse(article);
    }

    @PutMapping("/{id}")
    public AdminArticleDetailResponse updateArticle(@PathVariable Long id, @RequestBody @Valid UpdateArticleRequest request) {
        ArticleEntity article = articleService.updateArticle(id, request);
        return toAdminArticleDetailResponse(article);
    }

    @DeleteMapping("/{id}")
    public void deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
    }

    @PutMapping("/{id}/publish")
    public AdminArticleDetailResponse publishArticle(@PathVariable Long id) {
        return toAdminArticleDetailResponse(articleService.publishArticle(id));
    }

    @PutMapping("/{id}/unpublish")
    public AdminArticleDetailResponse unpublishArticle(@PathVariable Long id) {
        return toAdminArticleDetailResponse(articleService.unpublishArticle(id));
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

        List<Long> articleIds = articles.stream().map(ArticleEntity::getId).toList();
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

    private List<TagResponse> listTagResponses(Long articleId) {
        List<TagEntity> tagEntities = articleService.getArticleTags(articleId);
        return tagEntities.stream().map(this::toTagResponse).toList();
    }

    private CategoryResponse buildCategoryResponse(Long articleCategoryId) {
        CategoryResponse categoryResponse = null;

        if (articleCategoryId != null) {
            CategoryEntity category = categoryService.getCategoryById(articleCategoryId);
            categoryResponse = toCategoryResponse(category);
        }

        return categoryResponse;
    }

    private TagResponse toTagResponse(TagEntity tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getSlug()
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

    private ArticleSummaryResponse toArticleSummaryResponse(
            ArticleEntity article,
            Map<Long, CategoryResponse> categoryResponseMap,
            Map<Long, List<TagResponse>> tagResponseMap
    ) {
        CategoryResponse categoryResponse = null;
        Long categoryId = article.getCategoryId();

        if (categoryId != null) {
            categoryResponse = categoryResponseMap.get(categoryId);
        }

        return new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getStatus(),
                categoryResponse,
                tagResponseMap.getOrDefault(article.getId(), List.of())
        );
    }

    private AdminArticleDetailResponse toAdminArticleDetailResponse(ArticleEntity article) {
        return new AdminArticleDetailResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getContent(),
                article.getCoverImage(),
                article.getStatus(),
                buildCategoryResponse(article.getCategoryId()),
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt(),
                listTagResponses(article.getId())
        );
    }
}
