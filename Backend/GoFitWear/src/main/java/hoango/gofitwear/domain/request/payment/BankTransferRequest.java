package hoango.gofitwear.domain.request.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankTransferRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;
    private String bankName;
    private String accountName;
    private String transactionId;
    private String notes;
}
