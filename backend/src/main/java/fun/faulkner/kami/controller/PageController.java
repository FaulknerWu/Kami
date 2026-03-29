package fun.faulkner.kami.controller;

import fun.faulkner.kami.dto.response.PublicPageResponse;
import fun.faulkner.kami.entity.PageEntity;
import fun.faulkner.kami.service.PageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pages")
public class PageController {
    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @GetMapping("/{slug}")
    public PublicPageResponse getPageBySlug(@PathVariable String slug) {
        PageEntity page = pageService.getPublishedPageBySlug(slug);

        return new PublicPageResponse(
                page.getSlug(),
                page.getTitle(),
                page.getSummary(),
                page.getCoverImage(),
                page.getRenderMode(),
                page.getContentMarkdown(),
                page.getPayload(),
                page.getSeoTitle(),
                page.getSeoDescription(),
                page.getPublishedAt()
        );
    }
}
