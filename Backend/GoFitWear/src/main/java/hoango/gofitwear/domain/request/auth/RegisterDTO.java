package hoango.gofitwear.domain.request.auth;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDTO {
    String username;
    String password;
    String fullName;
    String email;
}
