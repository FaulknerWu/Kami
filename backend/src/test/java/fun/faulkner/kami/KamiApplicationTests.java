package fun.faulkner.kami;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"kami.auth.admin-password={noop}test-admin-password",
		"kami.auth.jwt-secret=0123456789abcdef0123456789abcdef",
		"kami.auth.issuer=kami-test-suite",
		"kami.auth.access-token-ttl=PT2H"
})
class KamiApplicationTests {

	@Test
	void contextLoads() {
	}

}
