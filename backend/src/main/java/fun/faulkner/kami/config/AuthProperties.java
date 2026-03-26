package fun.faulkner.kami.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "kami.auth")
public record AuthProperties(
        @NotBlank String adminPassword,
        @NotBlank String jwtSecret,
        @NotBlank String issuer,
        @NotNull Duration accessTokenTtl
) {
}
