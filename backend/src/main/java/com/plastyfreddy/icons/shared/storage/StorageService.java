package com.plastyfreddy.icons.shared.storage;

import com.plastyfreddy.icons.shared.config.StorageProperties;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.tenants.domain.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private static final Set<String> ALLOWED_FOLDERS = Set.of(
        "products", "avatars", "customers", "suppliers", "logos"
    );

    private final S3Client s3Client;
    private final StorageProperties storageProperties;
    private final TenantRepository tenantRepository;

    public UploadResponse upload(MultipartFile file, String folder) {
        validateFile(file);
        validateFolder(folder);

        String tenantSlug = resolveTenantSlug();
        String extension = extractExtension(file.getOriginalFilename(), file.getContentType());
        String key = "%s/%s/%s.%s".formatted(tenantSlug, folder, UUID.randomUUID(), extension);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(storageProperties.getBucket())
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al leer el archivo");
        }

        String url = "/api/v1/storage/files/" + key;

        return new UploadResponse(
            url,
            key,
            file.getOriginalFilename(),
            file.getSize(),
            file.getContentType()
        );
    }

    public void delete(String key) {
        String tenantSlug = resolveTenantSlug();
        if (!key.startsWith(tenantSlug + "/")) {
            throw BusinessException.forbidden("No tiene permisos para eliminar este archivo");
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(storageProperties.getBucket())
                .key(key)
                .build());
        } catch (NoSuchKeyException e) {
            log.debug("Archivo no encontrado en storage: {}", key);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }
        if (file.getSize() > storageProperties.getMaxFileSize()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                "El archivo excede el tamaño máximo permitido (5 MB)");
        }
        if (!storageProperties.getAllowedTypes().contains(file.getContentType())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)");
        }
    }

    private void validateFolder(String folder) {
        if (folder == null || !ALLOWED_FOLDERS.contains(folder)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                "Carpeta no válida. Permitidas: " + ALLOWED_FOLDERS);
        }
    }

    private String resolveTenantSlug() {
        Long tenantId = TenantContext.require();
        return tenantRepository.findById(tenantId)
            .orElseThrow(() -> BusinessException.notFound("Tenant", tenantId))
            .getSlug();
    }

    private String extractExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        }
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "bin";
        };
    }
}
