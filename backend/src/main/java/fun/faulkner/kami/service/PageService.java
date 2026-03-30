package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import fun.faulkner.kami.dto.request.CreatePageRequest;
import fun.faulkner.kami.dto.request.UpdatePageRequest;
import fun.faulkner.kami.entity.PageEntity;
import fun.faulkner.kami.enums.PageRenderMode;
import fun.faulkner.kami.enums.PageStatus;
import fun.faulkner.kami.exception.ResourceNotFoundException;
import fun.faulkner.kami.repository.PageMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PageService {
    private final PageMapper pageMapper;

    public PageService(PageMapper pageMapper) {
        this.pageMapper = pageMapper;
    }

    public Page<PageEntity> listPages(long page, long size) {
        Page<PageEntity> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<PageEntity> query = new LambdaQueryWrapper<>();
        query.orderByDesc(PageEntity::getUpdatedAt)
                .orderByDesc(PageEntity::getId);
        return pageMapper.selectPage(pageRequest, query);
    }

    public PageEntity getPageById(Long id) {
        PageEntity page = pageMapper.selectById(id);
        if (page == null) {
            throw new ResourceNotFoundException("Page not found, id=" + id);
        }

        return page;
    }

    public PageEntity getPublishedPageBySlug(String slug) {
        LambdaQueryWrapper<PageEntity> query = new LambdaQueryWrapper<>();
        query.eq(PageEntity::getSlug, slug)
                .eq(PageEntity::getStatus, PageStatus.PUBLISHED);

        PageEntity page = pageMapper.selectOne(query);
        if (page == null) {
            throw new ResourceNotFoundException("Published page not found, slug=" + slug);
        }

        return page;
    }

    public PageEntity createPage(CreatePageRequest request) {
        ensurePageSlugAvailable(request.slug(), null);

        PageEntity page = new PageEntity();
        LocalDateTime now = LocalDateTime.now();
        applyEditableFields(
                page,
                request.slug(),
                request.title(),
                request.summary(),
                request.coverImage(),
                request.renderMode(),
                request.seoTitle(),
                request.seoDescription(),
                request.contentMarkdown(),
                request.payload()
        );
        page.setStatus(PageStatus.DRAFT);
        page.setCreatedAt(now);
        page.setUpdatedAt(now);

        pageMapper.insert(page);
        return page;
    }

    public PageEntity updatePage(Long id, UpdatePageRequest request) {
        PageEntity page = getPageById(id);
        ensurePageSlugAvailable(request.slug(), id);

        applyEditableFields(
                page,
                request.slug(),
                request.title(),
                request.summary(),
                request.coverImage(),
                request.renderMode(),
                request.seoTitle(),
                request.seoDescription(),
                request.contentMarkdown(),
                request.payload()
        );
        LocalDateTime now = LocalDateTime.now();
        page.setUpdatedAt(now);

        pageMapper.updateById(page);
        return page;
    }

    public void deletePage(Long id) {
        getPageById(id);
        pageMapper.deleteById(id);
    }

    public PageEntity publishPage(Long id) {
        PageEntity page = getPageById(id);
        if (page.getStatus() == PageStatus.PUBLISHED) {
            return page;
        }

        LocalDateTime now = LocalDateTime.now();
        page.setStatus(PageStatus.PUBLISHED);
        page.setPublishedAt(now);
        page.setUpdatedAt(now);

        pageMapper.updateById(page);
        return page;
    }

    public PageEntity unpublishPage(Long id) {
        PageEntity page = getPageById(id);
        if (page.getStatus() == PageStatus.DRAFT) {
            return page;
        }

        LocalDateTime now = LocalDateTime.now();
        page.setStatus(PageStatus.DRAFT);
        page.setPublishedAt(null);
        page.setUpdatedAt(now);

        pageMapper.updateById(page);
        return page;
    }

    private void applyEditableFields(
            PageEntity page,
            String slug,
            String title,
            String summary,
            String coverImage,
            PageRenderMode renderMode,
            String seoTitle,
            String seoDescription,
            String contentMarkdown,
            JsonNode payload
    ) {
        page.setSlug(slug);
        page.setTitle(title);
        page.setSummary(summary);
        page.setCoverImage(coverImage);
        page.setRenderMode(renderMode);
        page.setSeoTitle(seoTitle);
        page.setSeoDescription(seoDescription);
        applyRenderModeContent(page, renderMode, contentMarkdown, payload);
    }

    private void applyRenderModeContent(PageEntity page, PageRenderMode renderMode, String contentMarkdown, JsonNode payload) {
        if (renderMode == PageRenderMode.MARKDOWN) {
            if (contentMarkdown == null || contentMarkdown.isBlank()) {
                throw new IllegalArgumentException("Markdown page content cannot be blank");
            }

            page.setContentMarkdown(contentMarkdown);
            page.setPayload(null);
            return;
        }

        page.setContentMarkdown(null);
        page.setPayload(payload);
    }

    private void ensurePageSlugAvailable(String slug, Long excludedPageId) {
        PageEntity existingPage = findPageBySlug(slug);
        if (existingPage != null && !existingPage.getId().equals(excludedPageId)) {
            throw new IllegalArgumentException("Page slug already exists: " + slug);
        }
    }

    private PageEntity findPageBySlug(String slug) {
        LambdaQueryWrapper<PageEntity> query = new LambdaQueryWrapper<>();
        query.eq(PageEntity::getSlug, slug);
        return pageMapper.selectOne(query);
    }
}
