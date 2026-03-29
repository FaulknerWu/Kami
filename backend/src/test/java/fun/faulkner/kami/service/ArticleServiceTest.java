package fun.faulkner.kami.service;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleMapper articleMapper;

    @Mock
    private ArticleTagMapper articleTagMapper;

    @Mock
    private CategoryMapper categoryMapper;

    @Mock
    private TagMapper tagMapper;

    @InjectMocks
    private ArticleService articleService;

    @Test
    void listPublishedArticlesShouldReturnEmptyPageWhenCategoryDoesNotExist() {
        when(categoryMapper.selectOne(any())).thenReturn(null);

        Page<ArticleEntity> result = articleService.listPublishedArticles(1, 10, "missing-category", null);

        assertThat(result.getCurrent()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(10);
        assertThat(result.getTotal()).isZero();
        assertThat(result.getRecords()).isEmpty();
    }

    @Test
    void createArticleShouldPersistDraftAndInsertTags() {
        CreateArticleRequest request = new CreateArticleRequest(
                "Article title",
                "article-title",
                "Article summary",
                "# Markdown",
                "https://example.com/cover.png",
                3L,
                List.of(11L, 12L)
        );

        when(articleMapper.selectOne(any())).thenReturn(null);
        when(categoryMapper.selectById(3L)).thenReturn(createCategory(3L, "backend"));
        when(tagMapper.selectByIds(List.of(11L, 12L))).thenReturn(List.of(
                createTag(11L, "java"),
                createTag(12L, "spring")
        ));
        doAnswer(invocation -> {
            ArticleEntity article = invocation.getArgument(0);
            article.setId(100L);
            return 1;
        }).when(articleMapper).insert(any(ArticleEntity.class));

        ArticleEntity result = articleService.createArticle(request);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo(ArticleStatus.DRAFT);
        assertThat(result.getPublishedAt()).isNull();
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();

        ArgumentCaptor<ArticleEntity> articleCaptor = ArgumentCaptor.forClass(ArticleEntity.class);
        verify(articleMapper).insert(articleCaptor.capture());
        ArticleEntity savedArticle = articleCaptor.getValue();
        assertThat(savedArticle.getTitle()).isEqualTo("Article title");
        assertThat(savedArticle.getSlug()).isEqualTo("article-title");
        assertThat(savedArticle.getSummary()).isEqualTo("Article summary");
        assertThat(savedArticle.getContent()).isEqualTo("# Markdown");
        assertThat(savedArticle.getCoverImage()).isEqualTo("https://example.com/cover.png");
        assertThat(savedArticle.getCategoryId()).isEqualTo(3L);
        assertThat(savedArticle.getStatus()).isEqualTo(ArticleStatus.DRAFT);

        verify(articleTagMapper).insertBatch(100L, List.of(11L, 12L));
    }

    @Test
    void updateArticleShouldReplaceTagsAndUpdateFields() {
        ArticleEntity existingArticle = new ArticleEntity();
        existingArticle.setId(200L);
        existingArticle.setTitle("Old title");
        existingArticle.setSlug("old-title");
        existingArticle.setSummary("Old summary");
        existingArticle.setContent("Old content");
        existingArticle.setStatus(ArticleStatus.DRAFT);
        existingArticle.setCreatedAt(LocalDateTime.now().minusDays(1));

        UpdateArticleRequest request = new UpdateArticleRequest(
                "New title",
                "new-title",
                "New summary",
                "New content",
                "https://example.com/new-cover.png",
                5L,
                List.of(21L, 22L)
        );

        when(articleMapper.selectById(200L)).thenReturn(existingArticle);
        when(articleMapper.selectOne(any())).thenReturn(existingArticle);
        when(categoryMapper.selectById(5L)).thenReturn(createCategory(5L, "architecture"));
        when(tagMapper.selectByIds(List.of(21L, 22L))).thenReturn(List.of(
                createTag(21L, "ddd"),
                createTag(22L, "clean-code")
        ));

        ArticleEntity result = articleService.updateArticle(200L, request);

        assertThat(result.getTitle()).isEqualTo("New title");
        assertThat(result.getSlug()).isEqualTo("new-title");
        assertThat(result.getSummary()).isEqualTo("New summary");
        assertThat(result.getContent()).isEqualTo("New content");
        assertThat(result.getCoverImage()).isEqualTo("https://example.com/new-cover.png");
        assertThat(result.getCategoryId()).isEqualTo(5L);
        assertThat(result.getUpdatedAt()).isNotNull();

        verify(articleMapper).updateById(existingArticle);
        verify(articleTagMapper).deleteByArticleId(200L);
        verify(articleTagMapper).insertBatch(200L, List.of(21L, 22L));
    }

    @Test
    void publishArticleShouldSetPublishedStatusAndTimestamp() {
        ArticleEntity draftArticle = new ArticleEntity();
        draftArticle.setId(300L);
        draftArticle.setStatus(ArticleStatus.DRAFT);

        when(articleMapper.selectById(300L)).thenReturn(draftArticle);

        ArticleEntity result = articleService.publishArticle(300L);

        assertThat(result.getStatus()).isEqualTo(ArticleStatus.PUBLISHED);
        assertThat(result.getPublishedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(articleMapper).updateById(draftArticle);
    }

    @Test
    void unpublishArticleShouldClearPublishedAt() {
        ArticleEntity publishedArticle = new ArticleEntity();
        publishedArticle.setId(400L);
        publishedArticle.setStatus(ArticleStatus.PUBLISHED);
        publishedArticle.setPublishedAt(LocalDateTime.now().minusHours(2));

        when(articleMapper.selectById(400L)).thenReturn(publishedArticle);

        ArticleEntity result = articleService.unpublishArticle(400L);

        assertThat(result.getStatus()).isEqualTo(ArticleStatus.DRAFT);
        assertThat(result.getPublishedAt()).isNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(articleMapper).updateById(publishedArticle);
    }

    @Test
    void createArticleShouldRejectDuplicateTagIds() {
        CreateArticleRequest request = new CreateArticleRequest(
                "Article title",
                "article-title",
                "Article summary",
                "# Markdown",
                null,
                null,
                List.of(11L, 11L)
        );

        when(articleMapper.selectOne(any())).thenReturn(null);

        assertThatThrownBy(() -> articleService.createArticle(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Tag ids contain duplicates");

        verify(articleMapper, never()).insert(any(ArticleEntity.class));
        verify(articleTagMapper, never()).insertBatch(any(), any());
    }

    @Test
    void getPublishedArticleBySlugShouldThrowWhenArticleDoesNotExist() {
        when(articleMapper.selectOne(any())).thenReturn(null);

        assertThatThrownBy(() -> articleService.getPublishedArticleBySlug("missing-article"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Published article not found, slug=missing-article");
    }

    private CategoryEntity createCategory(Long id, String slug) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName(slug);
        category.setSlug(slug);
        category.setSortOrder(0);
        return category;
    }

    private TagEntity createTag(Long id, String slug) {
        TagEntity tag = new TagEntity();
        tag.setId(id);
        tag.setName(slug);
        tag.setSlug(slug);
        return tag;
    }
}
