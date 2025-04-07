package hoango.gofitwear.service;

import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.WishlistItem;
import hoango.gofitwear.domain.request.wishlistitem.WishlistItemRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.product.ProductResponse;
import hoango.gofitwear.domain.response.wishlistitem.WishlistItemResponse;
import hoango.gofitwear.repository.ProductRepository;
import hoango.gofitwear.repository.UserRepository;
import hoango.gofitwear.repository.WishlistItemRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WishlistItemService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public WishlistItemService(
            WishlistItemRepository wishlistItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ModelMapper modelMapper
    ) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    public ResultPagination getUserWishlist(Long userId, Specification<WishlistItem> specification, Pageable pageable) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the requested wishlist belongs to the current user or the user is an admin
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You don't have permission to view this wishlist");
//        }

        // Get the user whose wishlist we want to retrieve
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the wishlist items for this user
        Page<WishlistItem> wishlistItems = wishlistItemRepository.findByUser(user, pageable);

        // Create result pagination
        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(wishlistItems.getTotalPages());
        meta.setTotal(wishlistItems.getTotalElements());

        resultPagination.setMeta(meta);

        // Convert wishlist items to response DTOs
        List<WishlistItemResponse> wishlistItemResponses = new ArrayList<>();
        for (WishlistItem item : wishlistItems.getContent()) {
            WishlistItemResponse response = convertToWishlistItemResponse(item);
            wishlistItemResponses.add(response);
        }

        resultPagination.setData(wishlistItemResponses);
        return resultPagination;
    }

    public WishlistItemResponse addToWishlist(Long userId, WishlistItemRequest request) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the wishlist belongs to the current user
//        if (!currentUser.getUserId().equals(userId)) {
//            throw new AccessDeniedException("You can only add items to your own wishlist");
//        }
//
//        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if the product is already in the wishlist
        if (wishlistItemRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product already in wishlist");
        }

        // Create new wishlist item
        WishlistItem wishlistItem = new WishlistItem(user, product);
        WishlistItem savedItem = wishlistItemRepository.save(wishlistItem);

        return convertToWishlistItemResponse(savedItem);
    }

    public void removeFromWishlist(Long userId, Long wishlistItemId) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the wishlist belongs to the current user
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You don't have permission to modify this wishlist");
//        }

        // Get the wishlist item
        WishlistItem wishlistItem = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        // Check if the wishlist item belongs to the specified user
        if (!wishlistItem.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This wishlist item does not belong to the specified user");
        }

        // Delete the wishlist item
        wishlistItemRepository.delete(wishlistItem);
    }

    public void removeProductFromWishlist(Long userId, Long productId) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the wishlist belongs to the current user
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You don't have permission to modify this wishlist");
//        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if the product is in the wishlist
        Optional<WishlistItem> wishlistItem = wishlistItemRepository.findByUserAndProduct(user, product);
        if (wishlistItem.isEmpty()) {
            throw new RuntimeException("Product not in wishlist");
        }

        // Delete the wishlist item
        wishlistItemRepository.delete(wishlistItem.get());
    }

    public boolean isProductInWishlist(Long userId, Long productId) {
        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if the product is in the wishlist
        return wishlistItemRepository.existsByUserAndProduct(user, product);
    }

    // Helper method to convert WishlistItem to WishlistItemResponse
    private WishlistItemResponse convertToWishlistItemResponse(WishlistItem wishlistItem) {
        WishlistItemResponse response = new WishlistItemResponse();
        response.setId(wishlistItem.getId());
        response.setCreatedAt(wishlistItem.getCreatedAt());

        // Map the product to ProductResponse
        ProductResponse productResponse = modelMapper.map(wishlistItem.getProduct(), ProductResponse.class);
        response.setProduct(productResponse);

        return response;
    }

    // Helper method to get the current authenticated user
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
