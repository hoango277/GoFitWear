package hoango.gofitwear.repository;

import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.WishlistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long>, JpaSpecificationExecutor<WishlistItem> {
    Page<WishlistItem> findByUser(User user, Pageable pageable);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
}
