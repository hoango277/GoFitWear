package hoango.gofitwear.domain.response.user;

import hoango.gofitwear.domain.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private UserRole role;
    private Instant createdAt;
}
