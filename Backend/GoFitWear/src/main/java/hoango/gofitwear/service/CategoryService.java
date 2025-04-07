package hoango.gofitwear.service;

import hoango.gofitwear.domain.Category;
import hoango.gofitwear.domain.request.category.CategoryRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.category.CategoryResponse;
import hoango.gofitwear.repository.CategoryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, ModelMapper modelMapper) {
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
    }

    public ResultPagination getAllCategories(Specification<Category> specification, Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(categories.getTotalPages());
        meta.setTotal(categories.getTotalElements());

        resultPagination.setMeta(meta);

        List<CategoryResponse> categoryResponses = new ArrayList<>();
        for (Category category : categories.getContent()) {
            CategoryResponse categoryResponse = convertToCategoryResponse(category);
            categoryResponses.add(categoryResponse);
        }
        resultPagination.setData(categoryResponses);

        return resultPagination;
    }

    public CategoryResponse getCategoryById(Long id) {
        Optional<Category> categoryOptional = categoryRepository.findById(id);
        return categoryOptional.map(this::convertToCategoryResponse).orElse(null);
    }

    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            return null; // Category with this name already exists
        }

        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());

        // Set parent category if parentId is provided
        if (categoryRequest.getParentId() != null) {
            Optional<Category> parentOptional = categoryRepository.findById(categoryRequest.getParentId());
            parentOptional.ifPresent(category::setParent);
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToCategoryResponse(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest categoryRequest) {
        Optional<Category> categoryOptional = categoryRepository.findById(id);

        if (categoryOptional.isEmpty()) {
            return null;
        }

        Category category = categoryOptional.get();

        // Check if another category with the same name exists (excluding current category)
        if (!category.getName().equals(categoryRequest.getName()) &&
                categoryRepository.existsByName(categoryRequest.getName())) {
            return null; // Another category with this name already exists
        }

        // Prevent circular references - a category cannot be its own parent or child
        if (categoryRequest.getParentId() != null && categoryRequest.getParentId().equals(id)) {
            return null; // Can't set a category as its own parent
        }

        // Check if the new parent is one of the category's children (would create a cycle)
        if (categoryRequest.getParentId() != null && isChildOf(categoryRequest.getParentId(), id)) {
            return null; // Can't set a child category as parent
        }

        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());

        // Update parent category
        if (categoryRequest.getParentId() == null) {
            category.setParent(null);
        } else if (category.getParent() == null ||
                !categoryRequest.getParentId().equals(category.getParent().getCategoryId())) {
            Optional<Category> newParentOptional = categoryRepository.findById(categoryRequest.getParentId());
            category.setParent(newParentOptional.orElse(null));
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToCategoryResponse(updatedCategory);
    }

    public boolean deleteCategory(Long id) {
        Optional<Category> categoryOptional = categoryRepository.findById(id);

        if (categoryOptional.isEmpty()) {
            return false;
        }

        Category category = categoryOptional.get();

        // Check if category has subcategories
        if (category.getSubcategories() != null && !category.getSubcategories().isEmpty()) {
            return false; // Can't delete a category with subcategories
        }

        // Check if category has products
        if (categoryRepository.hasProducts(id)) {
            return false; // Can't delete a category with products
        }

        categoryRepository.deleteById(id);
        return true;
    }

    // Get all top-level categories for dropdown
    public List<CategoryResponse> getTopLevelCategories() {
        List<Category> topLevelCategories = categoryRepository.findByParentIsNull();
        return topLevelCategories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }

    // Get all categories for dropdown (flat list)
    public List<CategoryResponse> getAllCategoriesForDropdown() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {
                    CategoryResponse response = new CategoryResponse();
                    response.setCategoryId(category.getCategoryId());
                    response.setName(category.getName());

                    // Include parent info if it exists
                    if (category.getParent() != null) {
                        CategoryResponse.ParentCategoryDTO parentDTO = new CategoryResponse.ParentCategoryDTO(
                                category.getParent().getCategoryId(),
                                category.getParent().getName()
                        );
                        response.setParent(parentDTO);
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }

    // Helper method to convert Category to CategoryResponse
    private CategoryResponse convertToCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());

        // Set parent
        if (category.getParent() != null) {
            CategoryResponse.ParentCategoryDTO parentDTO = new CategoryResponse.ParentCategoryDTO(
                    category.getParent().getCategoryId(),
                    category.getParent().getName()
            );
            response.setParent(parentDTO);
        }

        // Set subcategories
        if (category.getSubcategories() != null && !category.getSubcategories().isEmpty()) {
            List<CategoryResponse.SubcategoryDTO> subcategoryDTOs = category.getSubcategories().stream()
                    .map(subcategory -> new CategoryResponse.SubcategoryDTO(
                            subcategory.getCategoryId(),
                            subcategory.getName()
                    ))
                    .collect(Collectors.toList());
            response.setSubcategories(subcategoryDTOs);
        }

        return response;
    }

    // Helper method to check if a category is a child of another category
    private boolean isChildOf(Long potentialChildId, Long parentId) {
        Optional<Category> categoryOptional = categoryRepository.findById(potentialChildId);

        if (categoryOptional.isEmpty()) {
            return false;
        }

        Category category = categoryOptional.get();

        if (category.getParent() == null) {
            return false;
        }

        if (category.getParent().getCategoryId().equals(parentId)) {
            return true;
        }

        // Recursive check
        return isChildOf(category.getParent().getCategoryId(), parentId);
    }
}
