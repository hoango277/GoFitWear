package hoango.gofitwear.service;


import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.request.auth.RegisterDTO;
import hoango.gofitwear.domain.response.user.UserRes;
import hoango.gofitwear.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
    }


    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public void setUserRefreshToken(String refreshToken, User user) {
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }

    public User register(RegisterDTO registerDTO) {
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setFullName(registerDTO.getFullName());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByRefreshTokenAndUsername(String refreshToken, String username) {
        return userRepository.findByRefreshTokenAndUsername(refreshToken, username);
    }

    public UserRes fetchUserById(long id) {
        User user = userRepository.findByUserId(id);
        return modelMapper.map(user, UserRes.class);
    }

    public UserRes updateUserById(User user) {
        User userInDB = userRepository.findByUserId(user.getUserId());
        userInDB.setFullName(user.getFullName());
        userInDB.setAddress(user.getAddress());
        userInDB.setPhone(user.getPhone());
        userInDB.setEmail(user.getEmail());
        userRepository.save(userInDB);
        return modelMapper.map(userInDB, UserRes.class);
    }
}
