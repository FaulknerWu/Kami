package fun.faulkner.kami.controller;

import fun.faulkner.kami.dto.response.PublicCategoryResponse;
import fun.faulkner.kami.dto.response.PublicTagResponse;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.entity.TagEntity;
import fun.faulkner.kami.service.CategoryService;
import fun.faulkner.kami.service.TagService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TaxonomyController {
    private final CategoryService categoryService;
    private final TagService tagService;

    public TaxonomyController(CategoryService categoryService, TagService tagService) {
        this.categoryService = categoryService;
        this.tagService = tagService;
    }

    @GetMapping("/categories")
    public List<PublicCategoryResponse> listCategories() {
        List<CategoryEntity> categories = categoryService.listCategories();
        Map<Long, Long> articleCountMap = categoryService.countPublishedArticlesByCategory();

        return categories.stream()
                .map(category -> new PublicCategoryResponse(
                        category.getId(),
                        category.getName(),
                        category.getSlug(),
                        category.getDescription(),
                        category.getSortOrder(),
                        articleCountMap.getOrDefault(category.getId(), 0L)
                ))
                .toList();
    }

    @GetMapping("/tags")
    public List<PublicTagResponse> listTags() {
        List<TagEntity> tags = tagService.listTags();
        Map<Long, Long> articleCountMap = tagService.countPublishedArticlesByTag();

        return tags.stream()
                .map(tag -> new PublicTagResponse(
                        tag.getId(),
                        tag.getName(),
                        tag.getSlug(),
                        articleCountMap.getOrDefault(tag.getId(), 0L)
                ))
                .toList();
    }
}
