package hoango.gofitwear.domain.request.order;

import hoango.gofitwear.domain.Order.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartCheckoutRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotEmpty(message = "Selected cart items are required")
    private List<Long> cartItemIds; // IDs của các CartItem được chọn để thanh toán
}
