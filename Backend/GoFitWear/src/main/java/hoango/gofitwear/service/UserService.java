package hoango.gofitwear.service;


import hoango.gofitwear.domain.User;
import hoango.gofitwear.domain.request.auth.RegisterDTO;
import hoango.gofitwear.domain.request.user.PasswordChangeRequest;
import hoango.gofitwear.domain.request.user.UserCreateRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.user.UserRes;
import hoango.gofitwear.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    private final JavaMailSender mailSender;


    private final TemplateEngine templateEngine;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ModelMapper modelMapper, JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
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
        user.setFullName(registerDTO.getFullName());
        if (registerDTO.getUsername() != null) {
            if (userRepository.existsByUsername(registerDTO.getUsername())) {
                throw new IllegalArgumentException("Username đã tồn tại");
            }
            user.setUsername(registerDTO.getUsername());
        }

        if (registerDTO.getEmail() != null ) {
            if (userRepository.existsByEmail(registerDTO.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            user.setEmail(registerDTO.getEmail());
        }
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



    public UserRes updateUserById(User updatedUser) {
        // Kiểm tra người dùng hiện tại
        User currentUser = getCurrentUser();

        // Chỉ cho phép cập nhật thông tin của chính mình hoặc là admin
        if (!currentUser.getUserId().equals(updatedUser.getUserId()) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật thông tin của người dùng khác");
        }

        // Tìm user cần cập nhật
        User user = userRepository.findById(updatedUser.getUserId())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với ID: " + updatedUser.getUserId()));

        // Cập nhật các trường
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updatedUser.getUsername())) {
                throw new IllegalArgumentException("Username đã tồn tại");
            }
            user.setUsername(updatedUser.getUsername());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getFullName() != null) {
            user.setFullName(updatedUser.getFullName());
        }

        if (updatedUser.getPhone() != null) {
            user.setPhone(updatedUser.getPhone());
        }

        if (updatedUser.getAddress() != null) {
            user.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    // Lấy danh sách tất cả người dùng - sử dụng AccessDeniedException
    public ResultPagination getAllUsers(Specification<User> specification, Pageable pageable) {
        // Chỉ admin mới có quyền xem tất cả users
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Chỉ admin mới có quyền xem danh sách người dùng");
        }

        Page<User> userPage = userRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(userPage.getTotalPages());
        meta.setTotal(userPage.getTotalElements());

        resultPagination.setMeta(meta);

        List<UserRes> userResponses = userPage.getContent().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        resultPagination.setData(userResponses);
        return resultPagination;
    }

    // Tạo người dùng mới - sử dụng IllegalArgumentException
    public UserRes createUser(UserCreateRequest request) {
        // Kiểm tra xem username hoặc email đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        // Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole() != null ? request.getRole() : User.UserRole.CUSTOMER);

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    // Xóa người dùng - sử dụng AccessDeniedException và NoSuchElementException
    public void deleteUser(Long userId) {
        // Chỉ admin mới có quyền xóa user
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Chỉ admin mới có quyền xóa người dùng");
        }

        // Không cho phép xóa chính mình
        if (currentUser.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Không thể xóa tài khoản của chính mình");
        }

        // Kiểm tra user có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("Không tìm thấy người dùng với ID: " + userId);
        }

        userRepository.deleteById(userId);
    }

    // Đổi mật khẩu - sử dụng AccessDeniedException và IllegalArgumentException
    public UserRes changePassword(Long userId, PasswordChangeRequest request) {
        // Kiểm tra người dùng hiện tại
        User currentUser = getCurrentUser();

        // Chỉ cho phép đổi mật khẩu của chính mình
        if (!currentUser.getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền đổi mật khẩu của người dùng khác");
        }

        // Kiểm tra xác nhận mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác");
        }

        // Cập nhật mật khẩu mới
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User updatedUser = userRepository.save(currentUser);

        return convertToUserResponse(updatedUser);
    }

    // Cập nhật vai trò người dùng - sử dụng AccessDeniedException và NoSuchElementException
    public UserRes updateUserRole(Long userId, User.UserRole newRole) {
        // Chỉ admin mới có quyền thay đổi role
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Chỉ admin mới có quyền thay đổi vai trò người dùng");
        }

        // Không cho phép thay đổi role của chính mình
        if (currentUser.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Không thể thay đổi vai trò của chính mình");
        }

        // Tìm user cần cập nhật
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng với ID: " + userId));

        // Cập nhật role
        user.setRole(newRole);
        User updatedUser = userRepository.save(user);

        return convertToUserResponse(updatedUser);
    }

    public void adminChangeUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Mã hóa mật khẩu mới trước khi lưu
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }

    // Lấy thông tin người dùng hiện tại
    public UserRes getCurrentUserProfile() {
        User currentUser = getCurrentUser();
        return convertToUserResponse(currentUser);
    }

    // Helper method để chuyển đổi User thành UserRes
    private UserRes convertToUserResponse(User user) {
        return modelMapper.map(user, UserRes.class);
    }

    // Helper method để lấy người dùng hiện tại
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    public void resetPasswordAndSendEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này"));

        String newPassword = "123456";
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        sendResetPasswordEmail(user, newPassword);
    }

    private void sendResetPasswordEmail(User user, String newPassword) {
        Context context = new Context();
        context.setVariable("username", user.getUsername());
        context.setVariable("password", newPassword);

        String htmlContent = templateEngine.process("reset-password-template", context);

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("Yêu cầu đặt lại mật khẩu");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không gửi được email", e);
        }
    }
}
