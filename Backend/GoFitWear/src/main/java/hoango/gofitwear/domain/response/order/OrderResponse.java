package hoango.gofitwear.domain.response.order;

import hoango.gofitwear.domain.Order.OrderStatus;
import hoango.gofitwear.domain.Order.PaymentMethod;
import hoango.gofitwear.domain.Order.PaymentStatus;
import hoango.gofitwear.domain.response.orderitem.OrderItemResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long orderId;
    private Long userId;
    private String username;
    private Instant orderDate;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String shippingPhone;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private List<OrderItemResponse> orderItems;
}
