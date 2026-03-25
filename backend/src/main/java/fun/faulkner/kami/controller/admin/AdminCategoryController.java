package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.CreateCategoryRequest;
import fun.faulkner.kami.dto.request.UpdateCategoryRequest;
import fun.faulkner.kami.dto.response.CategoryResponse;
import fun.faulkner.kami.entity.CategoryEntity;
import fun.faulkner.kami.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/admin/categories")
@RestController
public class AdminCategoryController {
    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> listCategories() {
        List<CategoryEntity> categories = categoryService.listCategories();
        return categories.stream().map(this::toCategoryResponse).toList();
    }

    @PostMapping
    public CategoryResponse createCategory(@RequestBody @Valid CreateCategoryRequest request) {
        CategoryEntity category = categoryService.createCategory(request);
        return toCategoryResponse(category);
    }

    @PutMapping("/{id}")
    public CategoryResponse updateCategory(@PathVariable Long id, @RequestBody @Valid UpdateCategoryRequest request) {
        CategoryEntity category = categoryService.updateCategory(id, request);
        return toCategoryResponse(category);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    private CategoryResponse toCategoryResponse(CategoryEntity category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getSortOrder()
        );
    }
}
