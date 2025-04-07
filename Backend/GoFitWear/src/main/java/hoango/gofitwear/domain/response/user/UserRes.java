package hoango.gofitwear.domain.response.user;


import hoango.gofitwear.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserRes {
    private Long userId;
    private String username;

    private String email;



    private String fullName;


    private String phone;

    private String address;


    private User.UserRole role = User.UserRole.CUSTOMER;


    private Instant createdAt;
}
