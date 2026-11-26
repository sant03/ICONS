package com.plastyfreddy.icons.notifications;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "icons.web-push")
@Validated
@Getter
@Setter
public class WebPushProperties {

    @NotBlank
    private String publicKey;

    @NotBlank
    private String privateKey;

    @NotBlank
    private String subject;
}
