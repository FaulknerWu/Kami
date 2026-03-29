package fun.faulkner.kami.controller.admin;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import fun.faulkner.kami.dto.request.CreatePageRequest;
import fun.faulkner.kami.dto.request.UpdatePageRequest;
import fun.faulkner.kami.dto.response.AdminPageDetailResponse;
import fun.faulkner.kami.dto.response.PageResponse;
import fun.faulkner.kami.dto.response.PageSummaryResponse;
import fun.faulkner.kami.entity.PageEntity;
import fun.faulkner.kami.service.PageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pages")
public class AdminPageController {
    private final PageService pageService;

    public AdminPageController(PageService pageService) {
        this.pageService = pageService;
    }

    @GetMapping
    public PageResponse<PageSummaryResponse> listPages(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size
    ) {
        Page<PageEntity> pageResult = pageService.listPages(page, size);
        List<PageSummaryResponse> items = pageResult.getRecords().stream()
                .map(this::toPageSummaryResponse)
                .toList();

        return new PageResponse<>(
                items,
                pageResult.getCurrent(),
                pageResult.getSize(),
                pageResult.getTotal(),
                pageResult.getPages()
        );
    }

    @GetMapping("/{id}")
    public AdminPageDetailResponse getPageById(@PathVariable Long id) {
        return toAdminPageDetailResponse(pageService.getPageById(id));
    }

    @PostMapping
    public AdminPageDetailResponse createPage(@RequestBody @Valid CreatePageRequest request) {
        return toAdminPageDetailResponse(pageService.createPage(request));
    }

    @PutMapping("/{id}")
    public AdminPageDetailResponse updatePage(@PathVariable Long id, @RequestBody @Valid UpdatePageRequest request) {
        return toAdminPageDetailResponse(pageService.updatePage(id, request));
    }

    @DeleteMapping("/{id}")
    public void deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
    }

    @PutMapping("/{id}/publish")
    public AdminPageDetailResponse publishPage(@PathVariable Long id) {
        return toAdminPageDetailResponse(pageService.publishPage(id));
    }

    @PutMapping("/{id}/unpublish")
    public AdminPageDetailResponse unpublishPage(@PathVariable Long id) {
        return toAdminPageDetailResponse(pageService.unpublishPage(id));
    }

    private PageSummaryResponse toPageSummaryResponse(PageEntity page) {
        return new PageSummaryResponse(
                page.getId(),
                page.getTitle(),
                page.getSlug(),
                page.getSummary(),
                page.getRenderMode(),
                page.getStatus(),
                page.getPublishedAt(),
                page.getUpdatedAt()
        );
    }

    private AdminPageDetailResponse toAdminPageDetailResponse(PageEntity page) {
        return new AdminPageDetailResponse(
                page.getId(),
                page.getSlug(),
                page.getTitle(),
                page.getSummary(),
                page.getCoverImage(),
                page.getRenderMode(),
                page.getContentMarkdown(),
                page.getPayload(),
                page.getSeoTitle(),
                page.getSeoDescription(),
                page.getStatus(),
                page.getPublishedAt(),
                page.getCreatedAt(),
                page.getUpdatedAt()
        );
    }
}
