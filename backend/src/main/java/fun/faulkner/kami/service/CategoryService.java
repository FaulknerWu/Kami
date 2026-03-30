package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.CreateCategoryRequest;
import fun.faulkner.kami.dto.request.UpdateCategoryRequest;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.exception.ResourceNotFoundException;
import fun.faulkner.kami.repository.CategoryMapper;
import fun.faulkner.kami.repository.projection.CategoryArticleCount;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<CategoryEntity> listCategories() {
        LambdaQueryWrapper<CategoryEntity> query = new LambdaQueryWrapper<>();
        query.orderByAsc(CategoryEntity::getSortOrder);

        return categoryMapper.selectList(query);
    }

    public List<CategoryEntity> listCategoriesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        return categoryMapper.selectByIds(ids);
    }

    public Map<Long, Long> countPublishedArticlesByCategory() {
        List<CategoryArticleCount> categoryArticleCounts = categoryMapper.countPublishedArticlesByCategory();
        if (categoryArticleCounts.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> articleCountByCategoryId = new HashMap<>();
        for (CategoryArticleCount categoryArticleCount : categoryArticleCounts) {
            articleCountByCategoryId.put(categoryArticleCount.categoryId(), categoryArticleCount.articleCount());
        }

        return articleCountByCategoryId;
    }

    public CategoryEntity getCategoryById(Long id) {
        CategoryEntity category = categoryMapper.selectById(id);
        if (category == null) {
            throw new ResourceNotFoundException("Category not found, id=" + id);
        }
        return category;
    }

    public CategoryEntity createCategory(CreateCategoryRequest request) {
        ensureCategorySlugAvailable(request.slug(), null);
        ensureCategoryNameAvailable(request.name(), null);

        CategoryEntity category = new CategoryEntity();
        applyEditableFields(
                category,
                request.name(),
                request.slug(),
                request.description(),
                request.sortOrder()
        );

        categoryMapper.insert(category);
        return category;
    }

    public CategoryEntity updateCategory(Long id, UpdateCategoryRequest request) {
        CategoryEntity category = getCategoryById(id);
        ensureCategorySlugAvailable(request.slug(), id);
        ensureCategoryNameAvailable(request.name(), id);

        applyEditableFields(
                category,
                request.name(),
                request.slug(),
                request.description(),
                request.sortOrder()
        );

        categoryMapper.updateById(category);
        return category;
    }

    public void deleteCategory(Long id) {
        getCategoryById(id);
        categoryMapper.deleteById(id);
    }

    private void applyEditableFields(
            CategoryEntity category,
            String name,
            String slug,
            String description,
            Integer sortOrder
    ) {
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setSortOrder(sortOrder);
    }

    private void ensureCategorySlugAvailable(String slug, Long excludedCategoryId) {
        CategoryEntity existingCategory = findCategoryBySlug(slug);
        if (existingCategory != null && !existingCategory.getId().equals(excludedCategoryId)) {
            throw new IllegalArgumentException("Category slug already exists: " + slug);
        }
    }

    private void ensureCategoryNameAvailable(String name, Long excludedCategoryId) {
        CategoryEntity existingCategory = findCategoryByName(name);
        if (existingCategory != null && !existingCategory.getId().equals(excludedCategoryId)) {
            throw new IllegalArgumentException("Category name already exists: " + name);
        }
    }

    private CategoryEntity findCategoryBySlug(String slug) {
        LambdaQueryWrapper<CategoryEntity> query = new LambdaQueryWrapper<>();
        query.eq(CategoryEntity::getSlug, slug);
        return categoryMapper.selectOne(query);
    }

    private CategoryEntity findCategoryByName(String name) {
        LambdaQueryWrapper<CategoryEntity> query = new LambdaQueryWrapper<>();
        query.eq(CategoryEntity::getName, name);
        return categoryMapper.selectOne(query);
    }
}
