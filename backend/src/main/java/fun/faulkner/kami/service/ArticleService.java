package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.request.CreateArticleRequest;
import fun.faulkner.kami.dto.request.UpdateArticleRequest;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.enums.ArticleStatus;
import fun.faulkner.kami.exception.ResourceNotFoundException;
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

    public Page<ArticleEntity> listArticles(long page, long size) {
        Page<ArticleEntity> pageRequest = new Page<>(page, size);

        LambdaQueryWrapper<ArticleEntity> query = new LambdaQueryWrapper<>();
        query.orderByDesc(ArticleEntity::getUpdatedAt);

        return articleMapper.selectPage(pageRequest, query);
    }

    public Page<ArticleEntity> listPublishedArticles(long page, long size, String categorySlug, String tagSlug) {
        Page<ArticleEntity> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<ArticleEntity> query = new LambdaQueryWrapper<>();

        query.eq(ArticleEntity::getStatus, ArticleStatus.PUBLISHED);

        if (categorySlug != null && !categorySlug.isBlank()) {
            CategoryEntity category = findCategoryBySlug(categorySlug);
            if (category == null) {
                return createEmptyArticlePage(page, size);
            }
            query.eq(ArticleEntity::getCategoryId, category.getId());
        }

        if (tagSlug != null && !tagSlug.isBlank()) {
            TagEntity tag = findTagBySlug(tagSlug);
            if (tag == null) {
                return createEmptyArticlePage(page, size);
            }

            List<Long> articleIds = articleTagMapper.selectArticleIdsByTagId(tag.getId());
            if (articleIds.isEmpty()) {
                return createEmptyArticlePage(page, size);
            }

            query.in(ArticleEntity::getId, articleIds);
        }

        query.orderByDesc(ArticleEntity::getPublishedAt)
                .orderByDesc(ArticleEntity::getId);

        return articleMapper.selectPage(pageRequest, query);
    }

    public ArticleEntity getArticleById(Long id) {
        ArticleEntity article = articleMapper.selectById(id);
        if (article == null) {
            throw new ResourceNotFoundException("Article not found, id=" + id);
        }
        return article;
    }

    public ArticleEntity getPublishedArticleBySlug(String slug) {
        LambdaQueryWrapper<ArticleEntity> query = new LambdaQueryWrapper<>();
        query.eq(ArticleEntity::getSlug, slug)
                .eq(ArticleEntity::getStatus, ArticleStatus.PUBLISHED);

        ArticleEntity article = articleMapper.selectOne(query);
        if (article == null) {
            throw new ResourceNotFoundException("Published article not found, slug=" + slug);
        }

        return article;
    }

    public List<TagEntity> getArticleTags(Long articleId) {
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(articleId);
        if (tagIds.isEmpty()) {
            return List.of();
        }

        List<TagEntity> tags = tagMapper.selectByIds(tagIds);
        Map<Long, TagEntity> tagById = new HashMap<>();

        for (TagEntity tag : tags) {
            tagById.put(tag.getId(), tag);
        }

        return tagIds.stream()
                .map(tagById::get)
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    public ArticleEntity createArticle(CreateArticleRequest request) {
        ensureArticleSlugAvailable(request.slug(), null);
        validateCategoryAndTags(request.categoryId(), request.tagIds());

        ArticleEntity article = new ArticleEntity();
        LocalDateTime now = LocalDateTime.now();
        applyEditableFields(
                article,
                request.title(),
                request.slug(),
                request.summary(),
                request.content(),
                request.coverImage(),
                request.categoryId()
        );
        article.setCreatedAt(now);
        article.setUpdatedAt(now);
        article.setStatus(ArticleStatus.DRAFT);
        applyReadMetrics(article);

        articleMapper.insert(article);
        insertArticleTags(article.getId(), request.tagIds());

        return article;
    }

    @Transactional
    public ArticleEntity updateArticle(Long id, UpdateArticleRequest request) {
        ArticleEntity article = getArticleById(id);
        ensureArticleSlugAvailable(request.slug(), id);
        validateCategoryAndTags(request.categoryId(), request.tagIds());

        applyEditableFields(
                article,
                request.title(),
                request.slug(),
                request.summary(),
                request.content(),
                request.coverImage(),
                request.categoryId()
        );
        LocalDateTime now = LocalDateTime.now();
        article.setUpdatedAt(now);
        applyReadMetrics(article);

        articleMapper.updateById(article);
        replaceArticleTags(article.getId(), request.tagIds());
        return article;
    }

    public void deleteArticle(Long id) {
        getArticleById(id);
        articleMapper.deleteById(id);
    }

    public ArticleEntity publishArticle(Long id) {
        ArticleEntity article = getArticleById(id);

        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            return article;
        }

        LocalDateTime now = LocalDateTime.now();
        applyReadMetrics(article);
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setPublishedAt(now);
        article.setUpdatedAt(now);

        articleMapper.updateById(article);
        return article;
    }

    public ArticleEntity unpublishArticle(Long id) {
        ArticleEntity article = getArticleById(id);

        if (article.getStatus() == ArticleStatus.DRAFT) {
            return article;
        }

        LocalDateTime now = LocalDateTime.now();
        article.setStatus(ArticleStatus.DRAFT);
        article.setPublishedAt(null);
        article.setUpdatedAt(now);

        articleMapper.updateById(article);
        return article;
    }

    private void applyEditableFields(
            ArticleEntity article,
            String title,
            String slug,
            String summary,
            String content,
            String coverImage,
            Long categoryId
    ) {
        article.setTitle(title);
        article.setSlug(slug);
        article.setSummary(summary);
        article.setContent(content);
        article.setCoverImage(coverImage);
        article.setCategoryId(categoryId);
    }

    private void applyReadMetrics(ArticleEntity article) {
        ArticleReadMetrics metrics = ArticleReadMetricsCalculator.calculate(article.getContent());
        article.setWordCount(metrics.wordCount());
        article.setReadingTimeMinutes(metrics.readingTimeMinutes());
    }

    private void insertArticleTags(Long articleId, List<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return;
        }
        articleTagMapper.insertBatch(articleId, tagIds);
    }

    private void replaceArticleTags(Long articleId, List<Long> tagIds) {
        articleTagMapper.deleteByArticleId(articleId);
        if (tagIds.isEmpty()) {
            return;
        }
        articleTagMapper.insertBatch(articleId, tagIds);
    }

    private void validateCategoryAndTags(Long categoryId, List<Long> tagIds) {
        if (categoryId != null && categoryMapper.selectById(categoryId) == null) {
            throw new ResourceNotFoundException("Category not found, id=" + categoryId);
        }
        if (tagIds.isEmpty()) {
            return;
        }

        List<Long> distinctTagIds = tagIds.stream().distinct().toList();
        if (tagIds.size() != distinctTagIds.size()) {
            throw new IllegalArgumentException("Tag ids contain duplicates");
        }

        List<TagEntity> tags = tagMapper.selectByIds(distinctTagIds);
        if (tags.size() != distinctTagIds.size()) {
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
        LambdaQueryWrapper<ArticleEntity> query = new LambdaQueryWrapper<>();
        query.eq(ArticleEntity::getSlug, slug);
        return articleMapper.selectOne(query);
    }

    private CategoryEntity findCategoryBySlug(String slug) {
        LambdaQueryWrapper<CategoryEntity> query = new LambdaQueryWrapper<>();
        query.eq(CategoryEntity::getSlug, slug);
        return categoryMapper.selectOne(query);
    }

    private TagEntity findTagBySlug(String slug) {
        LambdaQueryWrapper<TagEntity> query = new LambdaQueryWrapper<>();
        query.eq(TagEntity::getSlug, slug);
        return tagMapper.selectOne(query);
    }

    private Page<ArticleEntity> createEmptyArticlePage(long page, long size) {
        Page<ArticleEntity> pageResult = new Page<>(page, size);
        pageResult.setRecords(List.of());
        pageResult.setTotal(0L);
        return pageResult;
    }
}
