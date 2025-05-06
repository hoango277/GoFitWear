package hoango.gofitwear.domain.request.order;

import hoango.gofitwear.domain.Order.OrderStatus;
import hoango.gofitwear.domain.Order.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {
    private OrderStatus status;
    private PaymentStatus paymentStatus;
}
