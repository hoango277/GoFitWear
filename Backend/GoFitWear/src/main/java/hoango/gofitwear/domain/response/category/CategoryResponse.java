package hoango.gofitwear.domain.response.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long categoryId;
    private String name;
    private String description;
    private ParentCategoryDTO parent;
    private List<SubcategoryDTO> subcategories;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParentCategoryDTO {
        private Long categoryId;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubcategoryDTO {
        private Long categoryId;
        private String name;
    }
}
