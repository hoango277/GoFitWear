package hoango.gofitwear.repository;

import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>, JpaSpecificationExecutor<ProductVariant> {
    List<ProductVariant> findByProduct(Product product);
    Page<ProductVariant> findByProduct(Product product, Pageable pageable);
    Optional<ProductVariant> findByProductAndSizeAndColor(Product product, String size, String color);
    boolean existsByProductAndSizeAndColor(Product product, String size, String color);
}
