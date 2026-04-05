package fun.faulkner.kami.controller;

import fun.faulkner.kami.entity.SiteContactEntity;
import fun.faulkner.kami.entity.SiteProfileEntity;
import fun.faulkner.kami.service.SiteContactService;
import fun.faulkner.kami.service.SiteProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SiteControllerTest {

    @Mock
    private SiteProfileService siteProfileService;

    @Mock
    private SiteContactService siteContactService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        SiteController controller = new SiteController(siteProfileService, siteContactService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new org.springframework.http.converter.json.JacksonJsonHttpMessageConverter())
                .build();
    }

    @Test
    void getSiteProfileShouldIncludePublicContacts() throws Exception {
        SiteProfileEntity siteProfile = new SiteProfileEntity();
        siteProfile.setId(1L);
        siteProfile.setSiteName("My Blog");
        siteProfile.setHeroTitle("My Blog");
        siteProfile.setAuthorName("Author");

        SiteContactEntity contact = new SiteContactEntity();
        contact.setId(10L);
        contact.setType("EMAIL");
        contact.setLabel("hello@example.com");
        contact.setValue("hello@example.com");
        contact.setUrl("mailto:hello@example.com");
        contact.setSortOrder(0);
        contact.setIsPublic(true);

        when(siteProfileService.getSiteProfile()).thenReturn(siteProfile);
        when(siteContactService.listPublicContacts()).thenReturn(List.of(contact));

        mockMvc.perform(get("/api/site/profile").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.siteName").value("My Blog"))
                .andExpect(jsonPath("$.contacts[0].label").value("hello@example.com"))
                .andExpect(jsonPath("$.contacts[0].isPublic").value(true));
    }
}
