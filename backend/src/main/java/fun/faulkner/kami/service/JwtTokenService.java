package fun.faulkner.kami.service;

import fun.faulkner.kami.config.AuthProperties;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtTokenService {
    public static final String ADMIN_SCOPE = "admin";

    private final JwtEncoder jwtEncoder;
    private final AuthProperties authProperties;

    public JwtTokenService(JwtEncoder jwtEncoder, AuthProperties authProperties) {
        this.jwtEncoder = jwtEncoder;
        this.authProperties = authProperties;
    }

    public String generateAccessToken(String subject) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(authProperties.accessTokenTtl());

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer(authProperties.issuer())
                .subject(subject)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("scope", ADMIN_SCOPE)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claimsSet)).getTokenValue();
    }

    public long getAccessTokenExpiresInSeconds() {
        return authProperties.accessTokenTtl().toSeconds();
    }
}
