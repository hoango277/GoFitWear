package hoango.gofitwear.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", columnDefinition = "MEDIUMTEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role = UserRole.CUSTOMER;

    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Review> reviews;

    @Column(name = "refresh_token", columnDefinition = "MEDIUMTEXT")  // Thêm trường refresh_token
    private String refreshToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    // Helper methods
    public void addToWishlist(Product product) {
        WishlistItem wishlistItem = new WishlistItem(this, product);
        wishlistItems.add(wishlistItem);
    }

    public void removeFromWishlist(Long wishlistItemId) {
        wishlistItems.removeIf(item -> item.getId().equals(wishlistItemId));
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum UserRole {
        CUSTOMER, ADMIN
    }
}
