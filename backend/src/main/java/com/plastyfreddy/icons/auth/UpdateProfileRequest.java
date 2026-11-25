package com.plastyfreddy.icons.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateProfileRequest(
    @Size(max = 150) String fullName,
    @Email(message = "El email no es válido") String email,
    String docId,
    LocalDate dateOfBirth,
    String phone,
    String landline,
    String positionName,
    @Size(max = 500) String avatarUrl
) {}
