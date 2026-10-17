package com.livingdocs.config;

import com.livingdocs.model.ERole;
import com.livingdocs.model.User;
import com.livingdocs.repository.RoleRepository;
import com.livingdocs.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Chạy một lần khi ứng dụng khởi động:
 *  1. Thêm 5 vai trò vào bảng roles nếu chưa có (không có thì đăng ký sẽ lỗi "Role not found").
 *  2. Tạo tài khoản admin đầu tiên nếu có đặt mật khẩu admin trong cấu hình.
 */
@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    RoleRepository roleRepo;
    @Autowired
    UserRepository userRepo;
    @Autowired
    PasswordEncoder encoder;

    @Value("${livingdocs.app.adminUsername:admin}")
    private String adminUsername;

    @Value("${livingdocs.app.adminPassword:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        for (ERole eRole : ERole.values()) {
            if (roleRepo.findByName(eRole).isEmpty()) {
                roleRepo.save(new Role(eRole));
                logger.info("Da tao role {}", eRole);
            }
        }

        if (!adminPassword.isBlank() && !userRepo.existsByUsername(adminUsername)) {
            User admin = new User(adminUsername, adminUsername + "@livingdocs.local", encoder.encode(adminPassword));
            Role adminRole = roleRepo.findByName(ERole.ADMIN).orElseThrow();
            admin.setRoles(Set.of(adminRole));
            userRepo.save(admin);
            logger.info("Da tao tai khoan admin '{}'", adminUsername);
        }
    }
}