package hoango.gofitwear.domain.response.cartitem;

import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long cartItemId;
    private ProductVariantResponse variant;
    private Integer quantity;
}
