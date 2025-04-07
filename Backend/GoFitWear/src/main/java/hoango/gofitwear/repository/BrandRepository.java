package hoango.gofitwear.repository;

import hoango.gofitwear.domain.Brand;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long>, JpaSpecificationExecutor<Brand> {
    List<Brand> findByNameContainingIgnoreCase(String name);

    boolean existsByName(@NotBlank(message = "Brand name is required") String name);
}
