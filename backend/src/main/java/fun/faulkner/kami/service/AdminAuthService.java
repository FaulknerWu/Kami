package fun.faulkner.kami.service;

import fun.faulkner.kami.config.AuthProperties;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {
    public static final String ADMIN_SUBJECT = "admin";

    private final AuthProperties authProperties;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthService(AuthProperties authProperties, PasswordEncoder passwordEncoder) {
        this.authProperties = authProperties;
        this.passwordEncoder = passwordEncoder;
    }

    public String authenticate(String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, authProperties.adminPassword())) {
            throw new BadCredentialsException("管理员密码错误");
        }

        return ADMIN_SUBJECT;
    }
}
