package fun.faulkner.kami.controller;

import fun.faulkner.kami.model.ArticleEntity;
import fun.faulkner.kami.model.ArticleSummaryResponse;
import fun.faulkner.kami.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/api/admin/posts")
@RestController
public class ArticleController {
    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public List<ArticleSummaryResponse> listArticles() {
        List<ArticleEntity> articles = articleService.listArticles();
        return articles.stream().map(article -> new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary()
        )).toList();
    }
}
