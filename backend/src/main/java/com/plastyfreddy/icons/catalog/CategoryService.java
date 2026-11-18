package com.plastyfreddy.icons.catalog;

import com.plastyfreddy.icons.catalog.domain.Category;
import com.plastyfreddy.icons.catalog.domain.CategoryRepository;
import com.plastyfreddy.icons.catalog.dto.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        Long tenantId = TenantContext.require();
        return categoryRepository.findByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(findOrFail(id));
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        Long tenantId = TenantContext.require();

        if (categoryRepository.existsByTenantIdAndNameAndDeletedAtIsNull(tenantId, request.name())) {
            throw BusinessException.conflict("Ya existe una categoría con ese nombre");
        }

        Category category = Category.builder()
            .name(request.name())
            .build();
        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        Long tenantId = TenantContext.require();
        Category category = findOrFail(id);

        if (request.name() != null && !request.name().equals(category.getName())) {
            if (categoryRepository.existsByTenantIdAndNameAndDeletedAtIsNull(tenantId, request.name())) {
                throw BusinessException.conflict("Ya existe una categoría con ese nombre");
            }
            category.setName(request.name());
        }

        return toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findOrFail(id);
        category.softDelete();
    }

    private Category findOrFail(Long id) {
        Long tenantId = TenantContext.require();
        return categoryRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Categoría", id));
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getStatus());
    }
}
