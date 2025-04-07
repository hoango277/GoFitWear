package hoango.gofitwear.repository;

import hoango.gofitwear.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long>, JpaSpecificationExecutor<OrderItem> {
    List<OrderItem> findByOrderOrderId(Long orderId);

    @Query("SELECT oi.product.productId, COUNT(oi) as count FROM OrderItem oi GROUP BY oi.product.productId ORDER BY count DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);

    @Query("SELECT SUM(oi.quantity * oi.unitPrice) FROM OrderItem oi WHERE oi.order.orderId = :orderId")
    Double calculateOrderTotal(@Param("orderId") Long orderId);
}
