package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.enums.ArticleStatus;
import fun.faulkner.kami.repository.ArticleMapper;
import fun.faulkner.kami.repository.ArticleTagMapper;
import fun.faulkner.kami.repository.CategoryMapper;
import fun.faulkner.kami.repository.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;

    public ArticleService(ArticleMapper articleMapper, ArticleTagMapper articleTagMapper, CategoryMapper categoryMapper, TagMapper tagMapper) {
        this.articleMapper = articleMapper;
        this.articleTagMapper = articleTagMapper;
        this.categoryMapper = categoryMapper;
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

    @Transactional
    public ArticleEntity createArticle(CreateArticleRequest request) {
        ensureArticleSlugAvailable(request.slug(), null);

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

        validateCategoryAndTags(request.categoryId(), request.tagIds());
        articleMapper.insert(article);
        insertArticleTags(article.getId(), request.tagIds());

        return article;
    }

    @Transactional
    public ArticleEntity updateArticle(Long id, UpdateArticleRequest request) {
        ArticleEntity article = getArticleById(id);
        ensureArticleSlugAvailable(request.slug(), id);

        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImage(request.coverImage());
        article.setCategoryId(request.categoryId());
        article.setUpdatedAt(LocalDateTime.now());

        validateCategoryAndTags(request.categoryId(), request.tagIds());
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

        LocalDateTime now = LocalDateTime.now();
        article.setStatus(ArticleStatus.PUBLISHED.name());
        article.setPublishedAt(now);
        article.setUpdatedAt(now);

        articleMapper.updateById(article);
        return article;
    }

    public ArticleEntity unpublishArticle(Long id) {
        ArticleEntity article = getArticleById(id);

        if (Objects.equals(article.getStatus(), ArticleStatus.DRAFT.name())) {
            return article;
        }

        LocalDateTime now = LocalDateTime.now();
        article.setStatus(ArticleStatus.DRAFT.name());
        article.setPublishedAt(null);
        article.setUpdatedAt(now);

        articleMapper.updateById(article);
        return article;
    }

    public List<TagEntity> getArticleTags(Long articleId) {
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(articleId);
        if (tagIds.isEmpty()) {
            return List.of();
        }

        List<TagEntity> tags = tagMapper.selectByIds(tagIds);
        Map<Long, TagEntity> tagMap = new HashMap<>();

        for (TagEntity tag : tags) {
            tagMap.put(tag.getId(), tag);
        }

        return tagIds.stream()
                .map(tagMap::get)
                .filter(Objects::nonNull)
                .toList();
    }

    private void insertArticleTags(Long articleId, List<Long> tagIds) {
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

    private void validateCategoryAndTags(Long categoryId, List<Long> tagIds) {
        if (categoryId != null && categoryMapper.selectById(categoryId) == null) {
            throw new IllegalArgumentException("Category not found, id=" + categoryId);
        }
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        List<Long> uniqueTagIds = tagIds.stream().distinct().toList();

        if (tagIds.size() != uniqueTagIds.size()) {
            throw new IllegalArgumentException("Tag ids contain duplicates");
        }

        List<TagEntity> tags = tagMapper.selectByIds(uniqueTagIds);
        if (tags.size() != tagIds.size()) {
            throw new IllegalArgumentException("Some tags do not exist");
        }
    }

    private void ensureArticleSlugAvailable(String slug, Long excludedArticleId) {
        ArticleEntity existingArticle = findArticleBySlug(slug);
        if (existingArticle != null && !existingArticle.getId().equals(excludedArticleId)) {
            throw new IllegalArgumentException("Article slug already exists: " + slug);
        }
    }

    private ArticleEntity findArticleBySlug(String slug) {
        LambdaQueryWrapper<ArticleEntity> articleQuery = new LambdaQueryWrapper<>();
        articleQuery.eq(ArticleEntity::getSlug, slug);
        return articleMapper.selectOne(articleQuery);
    }
}
