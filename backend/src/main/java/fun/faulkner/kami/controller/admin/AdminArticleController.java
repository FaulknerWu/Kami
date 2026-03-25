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
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RequestMapping("/api/admin/posts")
@RestController
public class AdminArticleController {
    private final ArticleService articleService;
    private final CategoryService categoryService;

    public AdminArticleController(ArticleService articleService, CategoryService categoryService) {
        this.articleService = articleService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<ArticleSummaryResponse> listArticles(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size
    ) {
        List<ArticleEntity> articles = articleService.listArticles(page, size);
        return articles.stream()
                .map(this::toArticleSummaryResponse)
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

    private ArticleSummaryResponse toArticleSummaryResponse(ArticleEntity article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary()
        );
    }

    private AdminArticleDetailResponse toAdminArticleDetailResponse(ArticleEntity article) {
        List<TagEntity> tagEntities = articleService.getArticleTags(article.getId());
        List<TagResponse> tagResponses = tagEntities.stream().map(this::toTagResponse).toList();
        CategoryResponse categoryResponse = null;

        if (article.getCategoryId() != null) {
            CategoryEntity category = categoryService.getCategoryById(article.getCategoryId());
            categoryResponse = toCategoryResponse(category);
        }

        return new AdminArticleDetailResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getContent(),
                article.getCoverImage(),
                article.getStatus(),
                categoryResponse,
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt(),
                tagResponses
        );
    }
}
