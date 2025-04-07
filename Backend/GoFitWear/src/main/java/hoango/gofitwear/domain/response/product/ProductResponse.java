package hoango.gofitwear.domain.response.product;

import hoango.gofitwear.domain.Brand;
import hoango.gofitwear.domain.Category;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class ProductResponse {
    private Long productId;
    private String name;
    private String description;
    private Category category;
    private Brand brand;
    private BigDecimal price;
    private String imageUrl;
    private Instant createdAt;
}
