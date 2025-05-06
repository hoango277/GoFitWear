package hoango.gofitwear.domain.response.orderitem;

import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long orderItemId;
    private ProductVariantResponse variant;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
