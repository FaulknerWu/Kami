package fun.faulkner.kami.dto.response;

public record AdminLoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
