package com.plastyfreddy.icons.users;

import com.plastyfreddy.icons.auth.domain.User;
import com.plastyfreddy.icons.users.dto.CreateUserRequest;
import com.plastyfreddy.icons.users.dto.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "failedAttempts", ignore = true)
    @Mapping(target = "lockedUntil", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(CreateUserRequest request);

    @Mapping(target = "roleName", source = "role.name")
    UserResponse toResponse(User user);
}
