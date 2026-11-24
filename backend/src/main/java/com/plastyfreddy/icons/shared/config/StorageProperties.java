package com.plastyfreddy.icons.shared.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.Set;

@ConfigurationProperties(prefix = "icons.storage")
@Validated
@Getter
@Setter
public class StorageProperties {

    @NotBlank
    private String endpoint;

    private String region = "us-east-1";

    @NotBlank
    private String bucket;

    @NotBlank
    private String accessKey;

    @NotBlank
    private String secretKey;

    @NotBlank
    private String publicUrl;

    private long maxFileSize = 5_242_880; // 5 MB

    private Set<String> allowedTypes = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );
}
