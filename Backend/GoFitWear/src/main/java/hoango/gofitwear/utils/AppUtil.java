package hoango.gofitwear.utils;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;




@Component
@Order(0)
public class AppUtil {


    public static String[] whitelist;
    public static String[] whiteListInterceptor;

    @PostConstruct
    public void init() {
        whitelist = new String[]{
                 "/auth/login",
                 "/auth/register",
                 "/auth/refresh",
                 "/companies/**",
                 "/jobs/**",
                 "/emails/**",
                "/storage/**",
                "/"
        };
        whiteListInterceptor = new String[]{
                 "/auth/**",
                 "/companies/**",
                 "/jobs/**",
                 "/emails/**",
                 "/skills",
                 "/resumes/by-user",
                 "/subscribers/**",
                "/storage/**",
                "/"
        };
    }
}
