package hoango.gofitwear.controller;

import hoango.gofitwear.configuration.JwtConfig;
import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.request.auth.LoginDTO;
import hoango.gofitwear.domain.request.auth.RegisterDTO;
import hoango.gofitwear.domain.response.auth.ResLogin;
import hoango.gofitwear.domain.response.auth.ResRegister;
import hoango.gofitwear.service.UserService;
import hoango.gofitwear.utils.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/auth")
public class AuthController {
    private final ModelMapper modelMapper;
    private AuthenticationManagerBuilder authenticationManagerBuilder;
    private JwtUtil jwtUtil;
    private UserService userService;
    private JwtConfig jwtConfig;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder,
                          JwtUtil jwtUtil,
                          UserService userService,
                          JwtConfig jwtConfig, ModelMapper modelMapper) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.jwtConfig = jwtConfig;
        this.modelMapper = modelMapper;
    }

    @PostMapping("/login")
    public ResponseEntity<ResLogin> login(@RequestBody LoginDTO login) {
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                login.getUsername(),
                login.getPassword()
        );
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(usernamePasswordAuthenticationToken);



        ResLogin resLogin = new ResLogin();
        User currentUser = userService.findByUsername(login.getUsername());
        ResLogin.UserLogin userLogin = modelMapper.map(currentUser, ResLogin.UserLogin.class);

        resLogin.setUser(userLogin);
        String accessToken =  jwtUtil.createAccessToken(currentUser.getUsername(), resLogin);
        resLogin.setAccessToken(accessToken);



        String refreshToken = jwtUtil.createRefreshToken(login.getUsername(), resLogin);
        userService.setUserRefreshToken(refreshToken, currentUser);

        ResponseCookie responseCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtConfig.getRefreshTokenExpirationSecond())
                .build();
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(resLogin);
    }

    @PostMapping("/register")
    public ResponseEntity<ResRegister> register(@RequestBody RegisterDTO registerDTO) {
        User user = userService.register(registerDTO);
        ResRegister resRegister = new ResRegister();
        resRegister.setFullName(user.getFullName());
        resRegister.setUsername(user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(
                resRegister
        );
    }

    @GetMapping("/refresh")
    public ResponseEntity<ResLogin> refreshToken(
            @CookieValue (name ="refreshToken", defaultValue = "abc") String refreshToken
    ) {

        Jwt jwt = jwtUtil.decodeRefreshToken(refreshToken);

        String username = jwt.getSubject();
        User user = userService.findByRefreshTokenAndUsername(refreshToken, username)
                .orElseThrow(() ->  new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ResLogin resLogin = new ResLogin();

        ResLogin.UserLogin userLogin = modelMapper.map(user, ResLogin.UserLogin.class);
        resLogin.setUser(userLogin);
        String accessToken =  jwtUtil.createAccessToken(username, resLogin);
        resLogin.setAccessToken(accessToken);


        String newRefreshToken = jwtUtil.createRefreshToken(username, resLogin);
        userService.setUserRefreshToken(refreshToken, user);

        ResponseCookie responseCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtConfig.getRefreshTokenExpirationSecond())
                .build();
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(resLogin);
    }
}
