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
        LambdaQueryWrapper<PageEntity> pageQuery = new LambdaQueryWrapper<>();
        pageQuery.orderByDesc(PageEntity::getUpdatedAt)
                .orderByDesc(PageEntity::getId);
        return pageMapper.selectPage(pageRequest, pageQuery);
    }

    public PageEntity getPageById(Long id) {
        PageEntity page = pageMapper.selectById(id);
        if (page == null) {
            throw new ResourceNotFoundException("Page not found, id=" + id);
        }

        return page;
    }

    public PageEntity getPublishedPageBySlug(String slug) {
        LambdaQueryWrapper<PageEntity> pageQuery = new LambdaQueryWrapper<>();
        pageQuery.eq(PageEntity::getSlug, slug)
                .eq(PageEntity::getStatus, PageStatus.PUBLISHED);

        PageEntity page = pageMapper.selectOne(pageQuery);
        if (page == null) {
            throw new ResourceNotFoundException("Published page not found, slug=" + slug);
        }

        return page;
    }

    public PageEntity createPage(CreatePageRequest request) {
        ensurePageSlugAvailable(request.slug(), null);

        PageEntity page = new PageEntity();
        LocalDateTime now = LocalDateTime.now();
        page.setSlug(request.slug());
        page.setTitle(request.title());
        page.setSummary(request.summary());
        page.setCoverImage(request.coverImage());
        page.setRenderMode(request.renderMode());
        page.setSeoTitle(request.seoTitle());
        page.setSeoDescription(request.seoDescription());
        page.setStatus(PageStatus.DRAFT);
        page.setCreatedAt(now);
        page.setUpdatedAt(now);
        applyRenderModeContent(page, request.contentMarkdown(), request.payload());

        pageMapper.insert(page);
        return page;
    }

    public PageEntity updatePage(Long id, UpdatePageRequest request) {
        PageEntity page = getPageById(id);
        ensurePageSlugAvailable(request.slug(), id);

        page.setSlug(request.slug());
        page.setTitle(request.title());
        page.setSummary(request.summary());
        page.setCoverImage(request.coverImage());
        page.setRenderMode(request.renderMode());
        page.setSeoTitle(request.seoTitle());
        page.setSeoDescription(request.seoDescription());
        page.setUpdatedAt(LocalDateTime.now());
        applyRenderModeContent(page, request.contentMarkdown(), request.payload());

        pageMapper.updateById(page);
        return page;
    }

    public void deletePage(Long id) {
        PageEntity page = getPageById(id);
        pageMapper.deleteById(page.getId());
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

    private void ensurePageSlugAvailable(String slug, Long excludedPageId) {
        PageEntity existingPage = findPageBySlug(slug);
        if (existingPage != null && !existingPage.getId().equals(excludedPageId)) {
            throw new IllegalArgumentException("Page slug already exists: " + slug);
        }
    }

    private PageEntity findPageBySlug(String slug) {
        LambdaQueryWrapper<PageEntity> pageQuery = new LambdaQueryWrapper<>();
        pageQuery.eq(PageEntity::getSlug, slug);
        return pageMapper.selectOne(pageQuery);
    }

    private void applyRenderModeContent(PageEntity page, String contentMarkdown, JsonNode payload) {
        if (page.getRenderMode() == PageRenderMode.MARKDOWN) {
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
}
