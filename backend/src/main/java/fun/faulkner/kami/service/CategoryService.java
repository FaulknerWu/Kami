package fun.faulkner.kami.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import fun.faulkner.kami.dto.request.CreateCategoryRequest;
import fun.faulkner.kami.dto.request.UpdateCategoryRequest;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.repository.CategoryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<CategoryEntity> listCategories() {
        LambdaQueryWrapper<CategoryEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(CategoryEntity::getSortOrder);

        return categoryMapper.selectList(queryWrapper);
    }

    public CategoryEntity createCategory(CreateCategoryRequest request) {
        LambdaQueryWrapper<CategoryEntity> slugQueryWrapper = new LambdaQueryWrapper<>();
        slugQueryWrapper.eq(CategoryEntity::getSlug, request.slug());

        CategoryEntity existingCategoryBySlug = categoryMapper.selectOne(slugQueryWrapper);
        if (existingCategoryBySlug != null) {
            throw new IllegalArgumentException("Category slug already exists: " + request.slug());
        }

        LambdaQueryWrapper<CategoryEntity> nameQueryWrapper = new LambdaQueryWrapper<>();
        nameQueryWrapper.eq(CategoryEntity::getName, request.name());

        CategoryEntity existingCategoryByName = categoryMapper.selectOne(nameQueryWrapper);
        if (existingCategoryByName != null) {
            throw new IllegalArgumentException("Category name already exists: " + request.name());
        }

        CategoryEntity category = new CategoryEntity();
        category.setName(request.name());
        category.setSlug(request.slug());
        category.setDescription(request.description());
        category.setSortOrder(request.sortOrder());

        categoryMapper.insert(category);
        return category;
    }

    public CategoryEntity getCategoryById(Long id){
        CategoryEntity category =  categoryMapper.selectById(id);
        if (category == null){
            throw new IllegalArgumentException("Category not found, id=" + id);
        }
        return category;
    }

    public CategoryEntity updateCategory(Long id, UpdateCategoryRequest request) {
        CategoryEntity category = getCategoryById(id);

        LambdaQueryWrapper<CategoryEntity> slugQueryWrapper = new LambdaQueryWrapper<>();
        slugQueryWrapper.eq(CategoryEntity::getSlug, request.slug());

        CategoryEntity existingCategoryBySlug = categoryMapper.selectOne(slugQueryWrapper);
        if (existingCategoryBySlug != null && !existingCategoryBySlug.getId().equals(id)) {
            throw new IllegalArgumentException("Category slug already exists: " + request.slug());
        }

        LambdaQueryWrapper<CategoryEntity> nameQueryWrapper = new LambdaQueryWrapper<>();
        nameQueryWrapper.eq(CategoryEntity::getName, request.name());

        CategoryEntity existingCategoryByName = categoryMapper.selectOne(nameQueryWrapper);
        if (existingCategoryByName != null && !existingCategoryByName.getId().equals(id)) {
            throw new IllegalArgumentException("Category name already exists: " + request.name());
        }

        category.setName(request.name());
        category.setSlug(request.slug());
        category.setDescription(request.description());
        category.setSortOrder(request.sortOrder());

        categoryMapper.updateById(category);

        return category;
    }

    public void deleteCategory(Long id) {
        CategoryEntity category = getCategoryById(id);
        categoryMapper.deleteById(category.getId());
    }
}
