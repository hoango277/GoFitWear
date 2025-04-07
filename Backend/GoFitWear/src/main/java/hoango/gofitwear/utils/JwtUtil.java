package hoango.gofitwear.utils;


import com.nimbusds.jose.util.Base64;
import hoango.gofitwear.configuration.JwtConfig;
import hoango.gofitwear.domain.response.auth.ResLogin;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static hoango.gofitwear.configuration.JwtConfig.JWT_ALGORITHM;


@Component
public class JwtUtil {
    private JwtEncoder jwtEncoder;
    private JwtConfig jwtConfig;

    public JwtUtil(JwtEncoder jwtEncoder, JwtConfig jwtConfig) {
        this.jwtEncoder = jwtEncoder;
        this.jwtConfig = jwtConfig;
    }

    public SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtConfig.getKey()).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }

    public Jwt decodeRefreshToken(String refreshToken) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey())
                .macAlgorithm(JWT_ALGORITHM)
                .build();
        try {
            Jwt decodedToken = jwtDecoder.decode(refreshToken);
            return decodedToken;
        } catch (Exception e) {
            System.out.println(">>> JWT error: " + e.getMessage());
            throw e;
        }
    }




    public String createAccessToken(String username, ResLogin resLogin) {
        ResLogin.UserInsideToken userInsideToken = new ResLogin.UserInsideToken();
        userInsideToken.setUsername(username);
        userInsideToken.setId(resLogin.getUser().getUserId());
        userInsideToken.setName(resLogin.getUser().getFullName());
        Instant now = Instant.now();
        Instant validity = now.plus(jwtConfig.getAccessTokenExpirationSecond(), ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(username)
                .claim("user", userInsideToken)
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,
                claims)).getTokenValue();
    }

    public String createRefreshToken(String username, ResLogin resLogin) {
        ResLogin.UserInsideToken userInsideToken = new ResLogin.UserInsideToken();
        userInsideToken.setUsername(username);
        userInsideToken.setId(resLogin.getUser().getUserId());
        userInsideToken.setName(resLogin.getUser().getFullName());

        Instant now = Instant.now();
        Instant validity = now.plus(jwtConfig.getRefreshTokenExpirationSecond(), ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(username)
                .claim("user", userInsideToken)
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,
                claims)).getTokenValue();
    }
}
