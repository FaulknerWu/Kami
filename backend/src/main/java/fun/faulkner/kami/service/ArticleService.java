package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.enums.ArticleStatus;
import fun.faulkner.kami.repository.ArticleMapper;
import fun.faulkner.kami.repository.ArticleTagMapper;
import fun.faulkner.kami.repository.TagMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;

    public ArticleService(ArticleMapper articleMapper, ArticleTagMapper articleTagMapper, TagMapper tagMapper) {
        this.articleMapper = articleMapper;
        this.articleTagMapper = articleTagMapper;
        this.tagMapper = tagMapper;
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
        LocalDateTime now = LocalDateTime.now();
        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImage(request.coverImage());
        article.setCategoryId(request.categoryId());
        article.setCreatedAt(now);
        article.setUpdatedAt(now);
        article.setStatus(ArticleStatus.DRAFT.name());

        articleMapper.insert(article);
        saveArticleTags(article.getId(), request.tagIds());

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
        replaceArticleTags(article.getId(), request.tagIds());
        return article;
    }

    public void deleteArticle(Long id) {
        ArticleEntity article = getArticleById(id);
        articleMapper.deleteById(article.getId());
    }

    public ArticleEntity publishArticle(Long id) {
        ArticleEntity article = getArticleById(id);

        if (Objects.equals(article.getStatus(), ArticleStatus.PUBLISHED.name())) {
            return article;
        }

        article.setStatus(ArticleStatus.PUBLISHED.name());
        article.setPublishedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());

        articleMapper.updateById(article);
        return article;
    }

    public ArticleEntity unpublishArticle(Long id) {
        ArticleEntity article = getArticleById(id);

        if (Objects.equals(article.getStatus(), ArticleStatus.DRAFT.name())) {
            return article;
        }

        article.setStatus(ArticleStatus.DRAFT.name());
        article.setPublishedAt(null);
        article.setUpdatedAt(LocalDateTime.now());

        articleMapper.updateById(article);
        return article;
    }

    public List<TagEntity> getArticleTags(Long articleId) {
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(articleId);
        if (tagIds.isEmpty()) {
            return List.of();
        }

        return tagMapper.selectByIds(tagIds);
    }

    private void saveArticleTags(Long articleId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        articleTagMapper.insertBatch(articleId, tagIds);
    }

    private void replaceArticleTags(Long articleId, List<Long> tagIds) {
        articleTagMapper.deleteByArticleId(articleId);
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        articleTagMapper.insertBatch(articleId, tagIds);
    }
}
