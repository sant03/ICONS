package com.plastyfreddy.icons.shared.storage;

public record UploadResponse(
    String url,
    String key,
    String filename,
    long size,
    String contentType
) {}
