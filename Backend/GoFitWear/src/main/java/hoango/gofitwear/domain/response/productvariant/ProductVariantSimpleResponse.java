package hoango.gofitwear.domain.response.productvariant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantSimpleResponse {
    private Long variantId;
    private Long productId;
    private String size;
    private String color;
    private BigDecimal price;
    private String imageUrl;
    private Integer stockQuantity;
}
