package hoango.gofitwear.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.Category;
import hoango.gofitwear.domain.request.category.CategoryRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.category.CategoryResponse;
import hoango.gofitwear.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final ObjectMapper objectMapper;

    @Autowired
    public CategoryController(CategoryService categoryService, ObjectMapper objectMapper) {
        this.categoryService = categoryService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("")
    public ResponseEntity<ResultPagination> getAllCategories(
            @Filter Specification<Category> specification,
            Pageable pageable
    ) {
        ResultPagination result = categoryService.getAllCategories(specification, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-level")
    public ResponseEntity<List<CategoryResponse>> getTopLevelCategories() {
        List<CategoryResponse> categories = categoryService.getTopLevelCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/dropdown")
    public ResponseEntity<List<CategoryResponse>> getAllCategoriesForDropdown() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesForDropdown();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse categoryResponse = categoryService.getCategoryById(id);

        if (categoryResponse != null) {
            return ResponseEntity.ok(categoryResponse);
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody CategoryRequest categoryRequest) {
        CategoryResponse createdCategory = categoryService.createCategory(categoryRequest);

        if (createdCategory != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        }

        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest categoryRequest
    ) {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, categoryRequest);

        if (updatedCategory != null) {
            return ResponseEntity.ok(updatedCategory);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        boolean deleted = categoryService.deleteCategory(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.badRequest().build();
    }
}
