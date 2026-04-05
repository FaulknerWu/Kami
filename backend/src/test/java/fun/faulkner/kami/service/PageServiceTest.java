package fun.faulkner.kami.service;

import fun.faulkner.kami.dto.request.CreatePageRequest;
import fun.faulkner.kami.entity.PageEntity;
import fun.faulkner.kami.repository.PageMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PageServiceTest {

    @Mock
    private PageMapper pageMapper;

    @InjectMocks
    private PageService pageService;

    @Test
    void createPageShouldRejectReservedSlug() {
        CreatePageRequest request = new CreatePageRequest(
                "archive",
                "归档页",
                null,
                null,
                "# 归档页",
                null,
                null
        );

        assertThatThrownBy(() -> pageService.createPage(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Page slug is reserved: archive");

        verify(pageMapper, never()).selectOne(any());
        verify(pageMapper, never()).insert(any(PageEntity.class));
    }
}
