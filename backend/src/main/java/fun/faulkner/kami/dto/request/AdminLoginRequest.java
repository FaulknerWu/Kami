package fun.faulkner.kami.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
        @NotBlank
        String password
) {
}
