package fun.faulkner.kami.controller;

import fun.faulkner.kami.entity.PageEntity;
import fun.faulkner.kami.enums.PageStatus;
import fun.faulkner.kami.service.PageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PageControllerTest {

    @Mock
    private PageService pageService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        PageController controller = new PageController(pageService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new org.springframework.http.converter.json.JacksonJsonHttpMessageConverter())
                .build();
    }

    @Test
    void getPageBySlugShouldReturnPublishedPagePayload() throws Exception {
        PageEntity page = new PageEntity();
        page.setId(1L);
        page.setSlug("about");
        page.setTitle("关于我");
        page.setContentMarkdown("# 关于我");
        page.setStatus(PageStatus.PUBLISHED);
        page.setPublishedAt(LocalDateTime.of(2026, 3, 29, 10, 0));

        when(pageService.getPublishedPageBySlug("about")).thenReturn(page);

        mockMvc.perform(get("/api/pages/about").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.slug").value("about"))
                .andExpect(jsonPath("$.contentMarkdown").value("# 关于我"))
                .andExpect(jsonPath("$.renderMode").doesNotExist())
                .andExpect(jsonPath("$.payload").doesNotExist());
    }
}
