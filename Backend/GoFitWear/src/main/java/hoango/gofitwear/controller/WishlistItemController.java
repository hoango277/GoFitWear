package hoango.gofitwear.controller;

import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.WishlistItem;
import hoango.gofitwear.domain.request.wishlistitem.WishlistItemRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.wishlistitem.WishlistItemResponse;
import hoango.gofitwear.service.WishlistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
public class WishlistItemController {

    private final WishlistItemService wishlistItemService;

    @Autowired
    public WishlistItemController(WishlistItemService wishlistItemService) {
        this.wishlistItemService = wishlistItemService;
    }

    @GetMapping("")
    public ResponseEntity<ResultPagination> getUserWishlist(
            @PathVariable Long userId,
            @Filter Specification<WishlistItem> specification,
            Pageable pageable
    ) {
        ResultPagination result = wishlistItemService.getUserWishlist(userId, specification, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("")
    public ResponseEntity<WishlistItemResponse> addToWishlist(
            @PathVariable Long userId,
            @RequestBody WishlistItemRequest request
    ) {
        WishlistItemResponse addedItem = wishlistItemService.addToWishlist(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedItem);
    }

    @DeleteMapping("/{wishlistItemId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long wishlistItemId
    ) {
        wishlistItemService.removeFromWishlist(userId, wishlistItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> removeProductFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        wishlistItemService.removeProductFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isProductInWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        boolean isInWishlist = wishlistItemService.isProductInWishlist(userId, productId);
        return ResponseEntity.ok(isInWishlist);
    }
}
