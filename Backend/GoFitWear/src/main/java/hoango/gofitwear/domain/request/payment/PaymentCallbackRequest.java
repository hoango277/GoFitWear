package hoango.gofitwear.domain.request.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;
    private String transactionId;
    private String status;
    private String message;
}
