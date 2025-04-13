package hoango.gofitwear.controller;

import hoango.gofitwear.domain.request.cartitem.CartItemRequest;
import hoango.gofitwear.domain.response.cart.CartResponse;
import hoango.gofitwear.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/cart")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userId) {
        CartResponse cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @PathVariable Long userId,
            @Valid @RequestBody CartItemRequest cartItemRequest
    ) {
        try {
            CartResponse updatedCart = cartService.addItemToCart(userId, cartItemRequest);
            return ResponseEntity.ok(updatedCart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long userId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartItemRequest cartItemRequest
    ) {
        try {
            CartResponse updatedCart = cartService.updateCartItem(userId, cartItemId, cartItemRequest);
            return ResponseEntity.ok(updatedCart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long userId,
            @PathVariable Long cartItemId
    ) {
        try {
            CartResponse updatedCart = cartService.removeCartItem(userId, cartItemId);
            return ResponseEntity.ok(updatedCart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(@PathVariable Long userId) {
        try {
            CartResponse updatedCart = cartService.clearCart(userId);
            return ResponseEntity.ok(updatedCart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
