package com.plastyfreddy.icons.catalog;

import com.plastyfreddy.icons.catalog.domain.*;
import com.plastyfreddy.icons.catalog.dto.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String search, Long categoryId, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<Product> page;
        if (search != null && !search.isBlank()) {
            page = productRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (categoryId != null) {
            page = productRepository.findByTenantIdAndCategoryIdAndDeletedAtIsNull(
                tenantId, categoryId, pageable);
        } else {
            page = productRepository.findByTenantIdAndDeletedAtIsNull(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(findOrFail(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Long tenantId = TenantContext.require();

        Category category = categoryRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.categoryId(), tenantId)
            .orElseThrow(() -> BusinessException.notFound("Categoría", request.categoryId()));

        if (productRepository.existsByTenantIdAndReferenceAndDeletedAtIsNull(tenantId, request.reference())) {
            throw BusinessException.conflict("Ya existe un producto con esa referencia");
        }

        String prefix = categoryPrefix(category.getName());
        int nextNum = productRepository.findMaxCodeNumberByPrefix(tenantId, prefix) + 1;
        String code = prefix + "-" + nextNum;

        Product product = Product.builder()
            .code(code)
            .reference(request.reference())
            .categoryId(request.categoryId())
            .stock(request.stock())
            .minPurchase(request.minPurchase())
            .purchasePrice(request.purchasePrice())
            .salePrice(request.salePrice())
            .unit(request.unit() != null ? request.unit() : "Und")
            .build();

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Long tenantId = TenantContext.require();
        Product product = findOrFail(id);

        if (request.reference() != null && !request.reference().equals(product.getReference())) {
            if (productRepository.existsByTenantIdAndReferenceAndDeletedAtIsNull(tenantId, request.reference())) {
                throw BusinessException.conflict("Ya existe un producto con esa referencia");
            }
            product.setReference(request.reference());
        }
        if (request.categoryId() != null) {
            categoryRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.categoryId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Categoría", request.categoryId()));
            product.setCategoryId(request.categoryId());
        }
        if (request.stock() != null) product.setStock(request.stock());
        if (request.minPurchase() != null) product.setMinPurchase(request.minPurchase());
        if (request.purchasePrice() != null) product.setPurchasePrice(request.purchasePrice());
        if (request.salePrice() != null) product.setSalePrice(request.salePrice());
        if (request.unit() != null) product.setUnit(request.unit());
        if (request.blocked() != null) product.setBlocked(request.blocked());

        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findOrFail(id);
        if (product.getStock() > 0) {
            throw new BusinessException("No se puede eliminar un producto con stock disponible");
        }
        product.softDelete();
    }

    @Transactional
    public void toggleBlock(Long id) {
        Product product = findOrFail(id);
        product.setBlocked(!product.isBlocked());
    }

    private String categoryPrefix(String categoryName) {
        String[] words = categoryName.trim().split("\\s+");
        if (words.length >= 2) {
            return ("" + words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        }
        String word = words[0];
        return word.substring(0, Math.min(2, word.length())).toUpperCase();
    }

    private Product findOrFail(Long id) {
        Long tenantId = TenantContext.require();
        return productRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Producto", id));
    }

    private ProductResponse toResponse(Product p) {
        String categoryName = null;
        if (p.getCategory() != null) {
            categoryName = p.getCategory().getName();
        }
        return new ProductResponse(
            p.getId(),
            p.getCode(),
            p.getReference(),
            p.getCategoryId(),
            categoryName,
            p.getStock(),
            p.getMinPurchase(),
            p.getPurchasePrice(),
            p.getSalePrice(),
            p.getUnit(),
            p.getImageUrl(),
            p.isBlocked(),
            p.computeStatus(),
            p.getCreatedAt()
        );
    }
}
