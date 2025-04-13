package hoango.gofitwear.domain.response.productvariant;

import hoango.gofitwear.domain.response.product.ProductResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {
    private Long variantId;
    private ProductResponse product;
    private String size;
    private String color;
    private BigDecimal price;
    private String imageUrl;
    private Integer stockQuantity;
}
