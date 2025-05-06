package hoango.gofitwear.domain.response.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRedirectResponse {
    private String redirectUrl;
    private String paymentCode;
    private Long orderId;
    private String message;
}
