package hoango.gofitwear.service;

import hoango.gofitwear.domain.*;
import hoango.gofitwear.domain.Order.OrderStatus;
import hoango.gofitwear.domain.Order.PaymentStatus;
import hoango.gofitwear.domain.request.order.CartCheckoutRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.order.OrderResponse;
import hoango.gofitwear.domain.response.orderitem.OrderItemResponse;
import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import hoango.gofitwear.repository.*;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository,
            ProductVariantRepository productVariantRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ModelMapper modelMapper
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.modelMapper = modelMapper;
    }

    public ResultPagination getAllOrders(Specification<Order> specification, Pageable pageable) {
        // Only admins should be able to see all orders
//        User currentUser = getCurrentUser();
//        if (currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("Only administrators can view all orders");
//        }

        Page<Order> orderPage = orderRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(orderPage.getTotalPages());
        meta.setTotal(orderPage.getTotalElements());

        resultPagination.setMeta(meta);

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());

        resultPagination.setData(orderResponses);
        return resultPagination;
    }

    public ResultPagination getUserOrders(Long userId, Pageable pageable) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the requested orders belong to the current user or the user is an admin
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You don't have permission to view these orders");
//        }

        // Get the user whose orders we want to retrieve
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get orders
        Page<Order> orderPage = orderRepository.findByUser(user, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(orderPage.getTotalPages());
        meta.setTotal(orderPage.getTotalElements());

        resultPagination.setMeta(meta);

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());

        resultPagination.setData(orderResponses);
        return resultPagination;
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Get the current authenticated user
        User currentUser = getCurrentUser();

        // Check if the order belongs to the current user or the user is an admin
        if (!order.getUser().getUserId().equals(currentUser.getUserId()) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("You don't have permission to view this order");
        }

        return convertToOrderResponse(order);
    }

    public OrderResponse createOrderFromCart(Long userId, CartCheckoutRequest checkoutRequest) {
        // Get the current authenticated user
//        User currentUser = getCurrentUser();
//
//        // Check if the order is being created for the current user
//        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
//            throw new AccessDeniedException("You can only create orders for yourself");
//        }

        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get the user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found or empty"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Filter cart items based on the selected IDs
        List<CartItem> selectedItems = cart.getCartItems().stream()
                .filter(item -> checkoutRequest.getCartItemIds().contains(item.getCartItemId()))
                .collect(Collectors.toList());

        if (selectedItems.isEmpty()) {
            throw new RuntimeException("No valid items selected for checkout");
        }

        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(checkoutRequest.getShippingAddress());
        order.setShippingPhone(checkoutRequest.getShippingPhone());
        order.setPaymentMethod(checkoutRequest.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Calculate total amount and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : selectedItems) {
            ProductVariant variant = cartItem.getVariant();

            // Check if stock is sufficient
            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock available for " + variant.getProduct().getName() + " - " + variant.getSize() + "/" + variant.getColor());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(variant.getPrice());

            // Calculate item subtotal
            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            // Update stock quantity
            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Remove the selected items from cart
        for (CartItem selectedItem : selectedItems) {
            cart.getCartItems().remove(selectedItem);
            cartItemRepository.delete(selectedItem);
        }

        cartRepository.save(cart);

        return convertToOrderResponse(savedOrder);
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        // Get the current authenticated user
        User currentUser = getCurrentUser();

        // Only admins can update order status
        if (currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Only administrators can update order status");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // If order is being cancelled and was previously not cancelled, restore stock
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        // Update order status
        order.setStatus(status);

        // For COD orders, update payment status to PAID when delivered
        if (status == OrderStatus.DELIVERED &&
                order.getPaymentMethod() == Order.PaymentMethod.COD &&
                order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }

    public OrderResponse cancelOrder(Long userId, Long orderId) {
        // Get the current authenticated user
        User currentUser = getCurrentUser();

        // Check if the order belongs to the current user or user is admin
        if (!currentUser.getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify the order belongs to the specified user if not admin
        if (!order.getUser().getUserId().equals(userId) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("This order does not belong to the specified user");
        }

        // Only PENDING and PROCESSING orders can be cancelled by customers
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING
                && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Cannot cancel order in " + order.getStatus() + " status");
        }

        // Restore stock
        restoreStock(order);

        // Update order status
        order.setStatus(OrderStatus.CANCELLED);

        // If payment was pending, mark it as failed
        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        Order cancelledOrder = orderRepository.save(order);
        return convertToOrderResponse(cancelledOrder);
    }

    // Helper method to restore stock when an order is cancelled
    private void restoreStock(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            ProductVariant variant = orderItem.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() + orderItem.getQuantity());
            productVariantRepository.save(variant);
        }
    }

    // Helper method to convert Order to OrderResponse
    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setUserId(order.getUser().getUserId());
        response.setUsername(order.getUser().getUsername());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setShippingAddress(order.getShippingAddress());
        response.setShippingPhone(order.getShippingPhone());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());

        // Get order items
        List<OrderItemResponse> orderItemResponses = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                OrderItemResponse itemResponse = new OrderItemResponse();
                itemResponse.setOrderItemId(item.getOrderItemId());
                itemResponse.setQuantity(item.getQuantity());
                itemResponse.setUnitPrice(item.getUnitPrice());

                // Calculate subtotal
                BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                itemResponse.setSubtotal(subtotal);

                // Map the variant to ProductVariantResponse
                ProductVariantResponse variantResponse = modelMapper.map(item.getVariant(), ProductVariantResponse.class);
                itemResponse.setVariant(variantResponse);

                orderItemResponses.add(itemResponse);
            }
        }

        response.setOrderItems(orderItemResponses);

        return response;
    }

    // Helper method to get the current authenticated user
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
