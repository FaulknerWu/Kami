package fun.faulkner.kami.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.entity.ArticleEntity;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.enums.ArticleStatus;
import fun.faulkner.kami.service.ArticleService;
import fun.faulkner.kami.service.CategoryService;
import fun.faulkner.kami.service.TagService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock
    private ArticleService articleService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private TagService tagService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        PostController controller = new PostController(articleService, categoryService, tagService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new org.springframework.http.converter.json.JacksonJsonHttpMessageConverter())
                .build();
    }

    @Test
    void listPostsShouldReturnCategoryAndTagsInPayload() throws Exception {
        ArticleEntity article = createArticle(1L, "spring-boot-4", 10L);
        CategoryEntity category = createCategory(10L, "backend");
        TagEntity javaTag = createTag(100L, "java");
        TagEntity springTag = createTag(101L, "spring");

        Page<ArticleEntity> page = new Page<>(1, 10);
        page.setRecords(List.of(article));
        page.setTotal(1);

        when(articleService.listPublishedArticles(1, 10, null, null)).thenReturn(page);
        when(categoryService.listCategoriesByIds(List.of(10L))).thenReturn(List.of(category));
        when(tagService.listTagsGroupedByArticleIds(List.of(1L))).thenReturn(Map.of(1L, List.of(javaTag, springTag)));

        mockMvc.perform(get("/api/posts")
                        .param("page", "1")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.items[0].slug").value("spring-boot-4"))
                .andExpect(jsonPath("$.items[0].category.slug").value("backend"))
                .andExpect(jsonPath("$.items[0].tags[0].slug").value("java"))
                .andExpect(jsonPath("$.items[0].tags[1].slug").value("spring"))
                .andExpect(jsonPath("$.items[0].wordCount").value(321))
                .andExpect(jsonPath("$.items[0].readingTimeMinutes").value(2))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void getPostBySlugShouldReturnDetailWithCategoryAndTags() throws Exception {
        ArticleEntity article = createArticle(2L, "java-25", 20L);
        CategoryEntity category = createCategory(20L, "java");
        TagEntity tag = createTag(200L, "lts");

        when(articleService.getPublishedArticleBySlug("java-25")).thenReturn(article);
        when(categoryService.getCategoryById(20L)).thenReturn(category);
        when(articleService.getArticleTags(2L)).thenReturn(List.of(tag));

        mockMvc.perform(get("/api/posts/java-25").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("java-25"))
                .andExpect(jsonPath("$.category.slug").value("java"))
                .andExpect(jsonPath("$.tags[0].slug").value("lts"))
                .andExpect(jsonPath("$.wordCount").value(321))
                .andExpect(jsonPath("$.readingTimeMinutes").value(2));
    }

    private ArticleEntity createArticle(Long id, String slug, Long categoryId) {
        ArticleEntity article = new ArticleEntity();
        article.setId(id);
        article.setTitle(slug);
        article.setSlug(slug);
        article.setSummary("summary");
        article.setContent("content");
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setCategoryId(categoryId);
        article.setWordCount(321);
        article.setReadingTimeMinutes(2);
        article.setPublishedAt(LocalDateTime.of(2026, 3, 28, 12, 0));
        return article;
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
