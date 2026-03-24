package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.repository.ArticleMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;

    public ArticleService(ArticleMapper articleMapper) {
        this.articleMapper = articleMapper;
    }

    public List<ArticleEntity> listArticles(long page, long size) {
        Page<ArticleEntity> pageRequest = new Page<>(page, size);

        LambdaQueryWrapper<ArticleEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByDesc(ArticleEntity::getUpdatedAt);

        Page<ArticleEntity> pageResult = articleMapper.selectPage(pageRequest, queryWrapper);
        return pageResult.getRecords();
    }

    public ArticleEntity getArticleById(Long id) {
        ArticleEntity article = articleMapper.selectById(id);
        if (article == null) {
            throw new IllegalArgumentException("Article not found, id=" + id);
        }
        return article;
    }

    public ArticleEntity createArticle(CreateArticleRequest request) {
        LambdaQueryWrapper<ArticleEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ArticleEntity::getSlug, request.slug());

        ArticleEntity existingArticle = articleMapper.selectOne(queryWrapper);

        if (existingArticle != null) {
            throw new IllegalArgumentException("Article slug already exists: " + request.slug());
        }

        ArticleEntity article = new ArticleEntity();
        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImage(request.coverImage());
        article.setCategoryId(request.categoryId());
        article.setStatus("DRAFT");

        articleMapper.insert(article);
        return article;
    }

    public ArticleEntity updateArticle(Long id, UpdateArticleRequest request) {
        ArticleEntity article = getArticleById(id);

        LambdaQueryWrapper<ArticleEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ArticleEntity::getSlug, request.slug());

        ArticleEntity existingArticle = articleMapper.selectOne(queryWrapper);
        if (existingArticle != null && !existingArticle.getId().equals(id)) {
            throw new IllegalArgumentException("Article slug already exists: " + request.slug());
        }

        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImage(request.coverImage());
        article.setCategoryId(request.categoryId());
        article.setUpdatedAt(LocalDateTime.now());

        articleMapper.updateById(article);
        return article;
    }

    public void deleteArticle(Long id){
        ArticleEntity article = getArticleById(id);
        articleMapper.deleteById(article.getId());
    }
}
