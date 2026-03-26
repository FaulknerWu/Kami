package fun.faulkner.kami;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@MapperScan("fun.faulkner.kami.repository")
@ConfigurationPropertiesScan
@SpringBootApplication
public class KamiApplication {

    public static void main(String[] args) {
        SpringApplication.run(KamiApplication.class, args);
    }

}
