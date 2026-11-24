package com.plastyfreddy.icons.shared.storage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@Tag(name = "Almacenamiento")
public class StorageController {

    private final StorageService storageService;

    @PostMapping("/upload")
    @Operation(summary = "Subir un archivo (imagen)")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) {
        return ResponseEntity.ok(storageService.upload(file, folder));
    }

    @DeleteMapping
    @Operation(summary = "Eliminar un archivo del almacenamiento")
    public ResponseEntity<Void> delete(@RequestParam("key") String key) {
        storageService.delete(key);
        return ResponseEntity.noContent().build();
    }
}
