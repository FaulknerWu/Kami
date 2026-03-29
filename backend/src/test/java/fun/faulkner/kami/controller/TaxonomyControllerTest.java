package fun.faulkner.kami.controller;

import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
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

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TaxonomyControllerTest {

    @Mock
    private CategoryService categoryService;

    @Mock
    private TagService tagService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        TaxonomyController controller = new TaxonomyController(categoryService, tagService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new org.springframework.http.converter.json.JacksonJsonHttpMessageConverter())
                .build();
    }

    @Test
    void listCategoriesShouldIncludePublishedArticleCount() throws Exception {
        CategoryEntity category = new CategoryEntity();
        category.setId(1L);
        category.setName("Backend");
        category.setSlug("backend");
        category.setDescription("Backend posts");
        category.setSortOrder(1);

        when(categoryService.listCategories()).thenReturn(List.of(category));
        when(categoryService.countPublishedArticlesByCategory()).thenReturn(Map.of(1L, 3L));

        mockMvc.perform(get("/api/categories").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].slug").value("backend"))
                .andExpect(jsonPath("$[0].articleCount").value(3));
    }

    @Test
    void listTagsShouldIncludePublishedArticleCount() throws Exception {
        TagEntity tag = new TagEntity();
        tag.setId(2L);
        tag.setName("Spring");
        tag.setSlug("spring");

        when(tagService.listTags()).thenReturn(List.of(tag));
        when(tagService.countPublishedArticlesByTag()).thenReturn(Map.of(2L, 5L));

        mockMvc.perform(get("/api/tags").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].slug").value("spring"))
                .andExpect(jsonPath("$[0].articleCount").value(5));
    }
}
