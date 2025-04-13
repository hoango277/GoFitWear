package hoango.gofitwear.service;

import hoango.gofitwear.domain.Cart;
import hoango.gofitwear.domain.CartItem;
import hoango.gofitwear.domain.ProductVariant;
import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.request.cartitem.CartItemRequest;
import hoango.gofitwear.domain.response.cart.CartResponse;
import hoango.gofitwear.domain.response.cartitem.CartItemResponse;
import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import hoango.gofitwear.repository.CartItemRepository;
import hoango.gofitwear.repository.CartRepository;
import hoango.gofitwear.repository.ProductVariantRepository;
import hoango.gofitwear.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductVariantRepository productVariantRepository,
            ModelMapper modelMapper
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
        this.modelMapper = modelMapper;
    }

    public CartResponse getCartByUserId(Long userId) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the requested cart belongs to the current user or the user is an admin
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You don't have permission to view this cart");
//        }

        // Get the user whose cart we want to retrieve
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get or create the cart
        Cart cart = getOrCreateCart(user);

        return convertToCartResponse(cart);
    }

    public CartResponse addItemToCart(Long userId, CartItemRequest cartItemRequest) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the cart belongs to the current user
//        if (!currentUser.getUserId().equals(userId)) {
//            throw new AccessDeniedException("You can only add items to your own cart");
//        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the variant
        ProductVariant variant = productVariantRepository.findById(cartItemRequest.getVariantId())
                .orElseThrow(() -> new RuntimeException("Product variant not found"));

        // Check if stock is sufficient
        if (variant.getStockQuantity() < cartItemRequest.getQuantity()) {
            throw new RuntimeException("Not enough stock available");
        }

        // Get or create the cart
        Cart cart = getOrCreateCart(user);

        // Check if the item is already in the cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndVariant(cart, variant);

        if (existingItem.isPresent()) {
            // Update the quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItemRequest.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Create a new cart item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(cartItemRequest.getQuantity());
            cartItemRepository.save(newItem);

            // Add to cart's item list
            if (cart.getCartItems() == null) {
                cart.setCartItems(new ArrayList<>());
            }
            cart.getCartItems().add(newItem);
        }

        // Save the cart
        cartRepository.save(cart);

        return convertToCartResponse(cart);
    }

    public CartResponse updateCartItem(Long userId, Long cartItemId, CartItemRequest cartItemRequest) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the cart belongs to the current user
//        if (!currentUser.getUserId().equals(userId)) {
//            throw new AccessDeniedException("You can only update items in your own cart");
//        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Get the cart item
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Check if the cart item belongs to the cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new AccessDeniedException("This cart item does not belong to your cart");
        }

        // Get the variant
        ProductVariant variant = productVariantRepository.findById(cartItemRequest.getVariantId())
                .orElseThrow(() -> new RuntimeException("Product variant not found"));

        // Check if stock is sufficient
        if (variant.getStockQuantity() < cartItemRequest.getQuantity()) {
            throw new RuntimeException("Not enough stock available");
        }

        // Update cart item
        cartItem.setVariant(variant);
        cartItem.setQuantity(cartItemRequest.getQuantity());
        cartItemRepository.save(cartItem);

        return convertToCartResponse(cart);
    }

    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the cart belongs to the current user
//        if (!currentUser.getUserId().equals(userId)) {
//            throw new AccessDeniedException("You can only remove items from your own cart");
//        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Get the cart item
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Check if the cart item belongs to the cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new AccessDeniedException("This cart item does not belong to your cart");
        }

        // Remove the cart item
        cart.getCartItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);

        return convertToCartResponse(cart);
    }

    public CartResponse clearCart(Long userId) {
        // Get the current authenticated user
        User currentUser = getCurrentUser();

        // Check if the cart belongs to the current user
        if (!currentUser.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only clear your own cart");
        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Clear the cart items
        if (cart.getCartItems() != null) {
            cartItemRepository.deleteAll(cart.getCartItems());
            cart.getCartItems().clear();
        }

        cartRepository.save(cart);

        return convertToCartResponse(cart);
    }

    // Helper method to get or create a cart for a user
    private Cart getOrCreateCart(User user) {
        Optional<Cart> cartOptional = cartRepository.findByUser(user);

        if (cartOptional.isPresent()) {
            return cartOptional.get();
        } else {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCartItems(new ArrayList<>());
            return cartRepository.save(newCart);
        }
    }

    // Helper method to convert Cart to CartResponse
    private CartResponse convertToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setCartId(cart.getCartId());
        response.setUserId(cart.getUser().getUserId());
        response.setUsername(cart.getUser().getUsername());
        response.setCreatedAt(cart.getCreatedAt());

        List<CartItemResponse> cartItemResponses = new ArrayList<>();
        int totalItems = 0;
        double totalPrice = 0.0;

        if (cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                CartItemResponse itemResponse = new CartItemResponse();
                itemResponse.setCartItemId(item.getCartItemId());
                itemResponse.setQuantity(item.getQuantity());

                // Map the variant to ProductVariantResponse
                ProductVariantResponse variantResponse = modelMapper.map(item.getVariant(), ProductVariantResponse.class);
                itemResponse.setVariant(variantResponse);

                cartItemResponses.add(itemResponse);

                // Calculate totals
                totalItems += item.getQuantity();

                BigDecimal itemPrice = item.getVariant().getPrice();
                totalPrice += itemPrice.doubleValue() * item.getQuantity();
            }
        }

        response.setCartItems(cartItemResponses);
        response.setTotalItems(totalItems);
        response.setTotalPrice(totalPrice);

        return response;
    }

    // Helper method to get the current authenticated user
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
