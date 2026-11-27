package com.plastyfreddy.icons.shared.storage;

import com.plastyfreddy.icons.shared.config.StorageProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@Tag(name = "Almacenamiento")
public class StorageController {

    private final StorageService storageService;
    private final S3Client s3Client;
    private final StorageProperties storageProperties;

    @PostMapping("/upload")
    @Operation(summary = "Subir un archivo (imagen)")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) {
        return ResponseEntity.ok(storageService.upload(file, folder));
    }

    @GetMapping("/files/**")
    @Operation(summary = "Servir un archivo desde el almacenamiento")
    public ResponseEntity<byte[]> serveFile(HttpServletRequest request) {
        String path = request.getRequestURI();
        String key = path.substring(path.indexOf("/storage/files/") + "/storage/files/".length());

        if (key.isBlank() || key.contains("..")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ResponseInputStream<GetObjectResponse> obj = s3Client.getObject(
                GetObjectRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .key(key)
                    .build()
            );

            String contentType = obj.response().contentType();
            byte[] bytes = obj.readAllBytes();

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .body(bytes);
        } catch (NoSuchKeyException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping
    @Operation(summary = "Eliminar un archivo del almacenamiento")
    public ResponseEntity<Void> delete(@RequestParam("key") String key) {
        storageService.delete(key);
        return ResponseEntity.noContent().build();
    }
}
