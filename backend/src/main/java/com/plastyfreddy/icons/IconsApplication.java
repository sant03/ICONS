package com.plastyfreddy.icons;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IconsApplication {

    public static void main(String[] args) {
        SpringApplication.run(IconsApplication.class, args);
    }
}
