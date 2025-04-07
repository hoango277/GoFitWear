package hoango.gofitwear.domain.response.auth;



import com.fasterxml.jackson.annotation.JsonProperty;
import hoango.gofitwear.domain.User;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ResLogin {
    @JsonProperty("access_token")
    private String accessToken;
    private UserLogin user;


    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class UserLogin{
        private Long userId;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private String address;
        private User.UserRole role = User.UserRole.CUSTOMER;
        private Instant createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public  static class UserGetAccount{
        private UserLogin user;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public  static class UserInsideToken{
        private Long id;
        private String username;
        private String name;
    }

}
