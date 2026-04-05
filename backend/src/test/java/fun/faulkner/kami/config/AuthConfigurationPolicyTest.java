package fun.faulkner.kami.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class AuthConfigurationPolicyTest {

    private static final Path APPLICATION_YAML_PATH = Path.of("src/main/resources/application.yaml");

    @Test
    void applicationYamlShouldRequireExternalAuthSecrets() throws IOException {
        String applicationYaml = Files.readString(APPLICATION_YAML_PATH);

        assertThat(applicationYaml).contains("admin-password: ${KAMI_ADMIN_PASSWORD}");
        assertThat(applicationYaml).contains("jwt-secret: ${KAMI_JWT_SECRET}");
        assertThat(applicationYaml).contains("issuer: ${KAMI_JWT_ISSUER}");
        assertThat(applicationYaml).contains("access-token-ttl: ${KAMI_ACCESS_TOKEN_TTL}");
        assertThat(applicationYaml).doesNotContain("${KAMI_ADMIN_PASSWORD:");
        assertThat(applicationYaml).doesNotContain("${KAMI_JWT_SECRET:");
        assertThat(applicationYaml).doesNotContain("${KAMI_JWT_ISSUER:");
        assertThat(applicationYaml).doesNotContain("${KAMI_ACCESS_TOKEN_TTL:");
        assertThat(applicationYaml).doesNotContain("change-me");
    }
}
