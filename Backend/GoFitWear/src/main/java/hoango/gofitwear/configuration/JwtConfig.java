package hoango.gofitwear.configuration;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Collections;
import java.util.Map;


@Getter
@Configuration
public class JwtConfig {
    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${jwt.secretKey}")
    private String key;

    @Value("${jwt.accessTokenExpirationSecond}")
    private Long accessTokenExpirationSecond;

    @Value("${jwt.refreshTokenExpirationSecond}")
    private Long refreshTokenExpirationSecond;

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(
                getSecretKey()).macAlgorithm(JWT_ALGORITHM).build();
        return token -> {
            try {
                return jwtDecoder.decode(token);
            } catch (Exception e) {
                System.out.println(">>> JWT error: " + e.getMessage());
                throw e;
            }
        };
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    public SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(key).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();

        // Tạo converter tùy chỉnh để trích xuất thông tin từ cấu trúc phức tạp
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Lấy đối tượng user từ JWT
            Map<String, Object> userMap = jwt.getClaimAsMap("user");
            if (userMap == null) {
                return Collections.emptyList();
            }

            // Lấy role từ user.role
            String role = (String) userMap.get("role");
            if (role == null || role.isEmpty()) {
                return Collections.emptyList();
            }

            // Tạo quyền với tiền tố ROLE_ để làm việc với hasRole() trong Spring Security
            // Nếu role đã có tiền tố ROLE_, thì không thêm nữa
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            return Collections.singletonList(new SimpleGrantedAuthority(role));
        });

        return jwtAuthenticationConverter;
    }

}
