package com.plastyfreddy.icons.shared.config;

import com.plastyfreddy.icons.auth.domain.User;
import com.plastyfreddy.icons.auth.domain.UserRepository;
import com.plastyfreddy.icons.auth.domain.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements ApplicationRunner {

    private static final Long TENANT_ID = 1L;
    private static final Long GERENCIAL_ROLE_ID = 1L;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByTenantIdAndUsername(TENANT_ID, "admin")) {
            log.info("Admin user already exists, skipping seed");
            return;
        }

        User admin = User.builder()
                .username("admin")
                .email("admin@plastyfreddy.com")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .fullName("Administrador General")
                .docId("1234567890")
                .phone("3001234567")
                .positionName("Gerente General")
                .roleId(GERENCIAL_ROLE_ID)
                .status(UserStatus.ACTIVE)
                .build();
        admin.setTenantId(TENANT_ID);

        userRepository.save(admin);
        log.info("Seeded admin user: admin / Admin123!");
    }
}
