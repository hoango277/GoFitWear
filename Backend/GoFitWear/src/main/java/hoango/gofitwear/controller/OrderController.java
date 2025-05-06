package hoango.gofitwear.controller;

import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.Order;
import hoango.gofitwear.domain.Order.OrderStatus;
import hoango.gofitwear.domain.request.order.CartCheckoutRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.order.OrderResponse;
import hoango.gofitwear.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResultPagination> getAllOrders(
            @Filter Specification<Order> specification,
            Pageable pageable
    ) {
        ResultPagination result = orderService.getAllOrders(specification, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/{userId}/orders")
    public ResponseEntity<ResultPagination> getUserOrders(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        ResultPagination result = orderService.getUserOrders(userId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/users/{userId}/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @PathVariable Long userId,
            @Valid @RequestBody CartCheckoutRequest checkoutRequest
    ) {
        try {
            OrderResponse createdOrder = orderService.createOrderFromCart(userId, checkoutRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/admin/orders/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        try {
            OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/users/{userId}/orders/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId
    ) {
        try {
            OrderResponse cancelledOrder = orderService.cancelOrder(userId, orderId);
            return ResponseEntity.ok(cancelledOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
