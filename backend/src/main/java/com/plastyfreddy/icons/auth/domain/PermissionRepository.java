package com.plastyfreddy.icons.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByCodeIn(Set<String> codes);

    List<Permission> findAllByOrderByCodeAsc();
}
