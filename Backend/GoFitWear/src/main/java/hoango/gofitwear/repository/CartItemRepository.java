package hoango.gofitwear.repository;

import hoango.gofitwear.domain.Cart;
import hoango.gofitwear.domain.CartItem;
import hoango.gofitwear.domain.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndVariant(Cart cart, ProductVariant variant);
}
