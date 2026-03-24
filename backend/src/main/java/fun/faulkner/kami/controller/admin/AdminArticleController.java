package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.dto.response.AdminArticleDetailResponse;
import fun.faulkner.kami.dto.response.ArticleSummaryResponse;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.service.ArticleService;
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

    public AdminArticleController(ArticleService articleService) {
        this.articleService = articleService;
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
    public AdminArticleDetailResponse updateArticle(@PathVariable Long id, @RequestBody @Valid UpdateArticleRequest request){
        ArticleEntity article = articleService.updateArticle(id, request);
        return toAdminArticleDetailResponse(article);
    }

    @DeleteMapping("/{id}")
    public void deleteArticle(@PathVariable Long id){
        articleService.deleteArticle(id);
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
        return new AdminArticleDetailResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getContent(),
                article.getCoverImage(),
                article.getStatus(),
                article.getCategoryId(),
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }
}
