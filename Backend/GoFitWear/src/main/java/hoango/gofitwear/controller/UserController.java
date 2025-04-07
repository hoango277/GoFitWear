package hoango.gofitwear.controller;


import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.response.user.UserRes;
import hoango.gofitwear.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
