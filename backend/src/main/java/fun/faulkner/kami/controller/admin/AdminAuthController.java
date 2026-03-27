package fun.faulkner.kami.controller.admin;

import fun.faulkner.kami.dto.request.AdminLoginRequest;
import fun.faulkner.kami.dto.response.AdminLoginResponse;
import fun.faulkner.kami.service.AdminAuthService;
import fun.faulkner.kami.service.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
    private final AdminAuthService adminAuthService;
    private final JwtTokenService jwtTokenService;

    public AdminAuthController(AdminAuthService adminAuthService, JwtTokenService jwtTokenService) {
        this.adminAuthService = adminAuthService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@RequestBody @Valid AdminLoginRequest request) {
        String subject = adminAuthService.authenticate(request.password());
        String accessToken = jwtTokenService.generateAccessToken(subject);

        return new AdminLoginResponse(
                accessToken,
                "Bearer",
                jwtTokenService.getAccessTokenExpiresInSeconds()
        );
    }
}
