package fun.faulkner.kami.controller.admin;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import fun.faulkner.kami.service.AdminAuthService;
import fun.faulkner.kami.service.ArticleService;
import fun.faulkner.kami.service.CategoryService;
import fun.faulkner.kami.service.JwtTokenService;
import fun.faulkner.kami.service.TagService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = JsonMapper.builder()
            .findAndAddModules()
            .build();

    @MockitoBean
    private ArticleService articleService;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private TagService tagService;

    @MockitoBean
    private AdminAuthService adminAuthService;

    @MockitoBean
    private JwtTokenService jwtTokenService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void adminEndpointsShouldRequireJwt() throws Exception {
        mockMvc.perform(get("/api/admin/posts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminEndpointsShouldAllowJwtWithAdminScope() throws Exception {
        when(articleService.listArticles(1, 10)).thenReturn(new Page<>(1, 10));

        mockMvc.perform(get("/api/admin/posts")
                        .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void loginEndpointShouldBeAccessibleWithoutJwt() throws Exception {
        when(adminAuthService.authenticate("change-me")).thenReturn("admin");
        when(jwtTokenService.generateAccessToken("admin")).thenReturn("test-token");
        when(jwtTokenService.getAccessTokenExpiresInSeconds()).thenReturn(7200L);

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new LoginRequest("change-me"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(7200));
    }

    private record LoginRequest(String password) {
    }
}
