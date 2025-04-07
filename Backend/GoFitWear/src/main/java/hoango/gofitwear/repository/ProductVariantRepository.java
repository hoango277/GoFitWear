package hoango.gofitwear.repository;

import hoango.gofitwear.domain.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>, JpaSpecificationExecutor<ProductVariant> {
    List<ProductVariant> findByProductProductId(Long productId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.productId = :productId AND pv.size = :size AND pv.color = :color")
    List<ProductVariant> findByProductAndSizeAndColor(
            @Param("productId") Long productId,
            @Param("size") String size,
            @Param("color") String color);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.productId = :productId AND pv.stockQuantity > 0")
    List<ProductVariant> findAvailableVariantsByProductId(@Param("productId") Long productId);

    @Query("SELECT DISTINCT pv.size FROM ProductVariant pv WHERE pv.product.productId = :productId ORDER BY pv.size")
    List<String> findAvailableSizesByProductId(@Param("productId") Long productId);

    @Query("SELECT DISTINCT pv.color FROM ProductVariant pv WHERE pv.product.productId = :productId ORDER BY pv.color")
    List<String> findAvailableColorsByProductId(@Param("productId") Long productId);
}
