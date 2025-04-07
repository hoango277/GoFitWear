package hoango.gofitwear.repository;

import hoango.gofitwear.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    // Find all top-level categories (categories without a parent)
    List<Category> findByParentIsNull();

    // Check if a category with the given name exists
    boolean existsByName(String name);

    // Check if a category has any products
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p WHERE p.category.categoryId = ?1")
    boolean hasProducts(Long categoryId);
}
