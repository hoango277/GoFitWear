package hoango.gofitwear.domain.request.auth;


import lombok.Data;


@Data
public class LoginDTO {
    String username;
    String password;
}
