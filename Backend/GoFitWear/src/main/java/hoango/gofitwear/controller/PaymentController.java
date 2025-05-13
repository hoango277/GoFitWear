package hoango.gofitwear.controller;

import hoango.gofitwear.configuration.VNPayConfig;
import hoango.gofitwear.domain.Order;
import hoango.gofitwear.domain.response.order.OrderResponse;
import hoango.gofitwear.repository.OrderRepository;
import hoango.gofitwear.service.OrderService;
import hoango.gofitwear.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class PaymentController {

    @Autowired
    private PaymentService paymentService;


    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/create-payment/{orderId}")
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            HttpServletRequest request
    )
    {
        try {
        OrderResponse orderResponse = orderService.getOrderById(orderId);
        String ipAddress = request.getRemoteAddr();
        long amount = orderResponse.getTotalAmount().longValue();
        String paymentUrl = paymentService.createPaymentUrl(
                orderResponse.getOrderId(),
                amount,
                "Thanh toan don hang #" + orderResponse.getOrderId(),
                ipAddress);

        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Tạo URL thanh toán thành công");
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/vnpay-payment-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) {
        Map<String, String> vnp_Params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();

        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                vnp_Params.put(paramName, paramValue);
            }
        }

        String orderId = vnp_Params.get("vnp_TxnRef");

        if (vnPayConfig.validatePaymentResponse(vnp_Params)) {
            String vnp_ResponseCode = vnp_Params.get("vnp_ResponseCode");
            if ("00".equals(vnp_ResponseCode)) {
                Optional<Order> orderOptional = orderRepository.findById(Long.parseLong(orderId));
                if (orderOptional.isPresent()) {
                    Order order = orderOptional.get();
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    orderRepository.save(order);
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("message", "Thanh toán thành công");
                    response.put("orderId", orderId);
                    return ResponseEntity.ok(response);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Thanh toán thất bại");
                response.put("responseCode", vnp_ResponseCode);
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Có lỗi trong quá trình xác thực thanh toán");
    }

}
