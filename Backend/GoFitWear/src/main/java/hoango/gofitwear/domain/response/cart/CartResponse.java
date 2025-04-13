package hoango.gofitwear.domain.response.cart;

import hoango.gofitwear.domain.response.cartitem.CartItemResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long cartId;
    private Long userId;
    private String username;
    private Instant createdAt;
    private List<CartItemResponse> cartItems;
    private int totalItems;
    private double totalPrice;
}
