package hoango.gofitwear.domain.request.wishlistitem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
}
