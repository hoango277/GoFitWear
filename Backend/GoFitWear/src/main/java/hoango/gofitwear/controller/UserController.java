package hoango.gofitwear.controller;


import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.request.user.AdminPasswordRequest;
import hoango.gofitwear.domain.request.user.PasswordChangeRequest;
import hoango.gofitwear.domain.request.user.UserCreateRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.user.UserRes;
import hoango.gofitwear.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class UserController {
    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserRes> fetchUserById(@PathVariable long id)
    {
        return ResponseEntity.ok(userService.fetchUserById(id));
    }

    @PutMapping("/users")
    public ResponseEntity<UserRes> updateUserById(@RequestBody User user)
    {
        return ResponseEntity.status(HttpStatus.OK).body(userService.updateUserById(user));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResultPagination> getAllUsers(
            @Filter Specification<User> specification,
            Pageable pageable,
             Authentication authentication
    ) {
        if (authentication != null) {
            System.out.println("User: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
        }
        try {
            ResultPagination result = userService.getAllUsers(specification, pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> createUser(@Valid @RequestBody UserCreateRequest request) {
        try {
            UserRes createdUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/users/{userId}/change-password")
    public ResponseEntity<Object> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        try {
            UserRes userResponse = userService.changePassword(userId, request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Mật khẩu đã được thay đổi thành công");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/admin/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> updateUserRole(
            @PathVariable Long userId,
            @RequestParam User.UserRole role
    ) {
        try {
            UserRes updatedUser = userService.updateUserRole(userId, role);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }



    @PostMapping("/users/register")
    public ResponseEntity<Object> registerUser(@Valid @RequestBody UserCreateRequest request) {
        try {
            // Đảm bảo vai trò là CUSTOMER cho đăng ký người dùng mới
            request.setRole(User.UserRole.CUSTOMER);
            UserRes createdUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/admin/{userId}/change-password")
    public ResponseEntity<?> adminChangeUserPassword(
            @PathVariable Long userId,
            @RequestBody AdminPasswordRequest request
    ) {
        userService.adminChangeUserPassword(userId, request.getNewPassword());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }



}
