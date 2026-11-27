import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideAlertCircle,
  LucideAlertTriangle,
  LucideArrowDownToLine,
  LucideBarcode,
  LucideBoxes,
  LucideCamera,
  LucideCheckCircle,
  LucideDollarSign,
  LucideEdit,
  LucideFolderPlus,
  LucideImage,
  LucidePackage,
  LucidePlus,
  LucideRotateCcw,
  LucideSearch,
  LucideShoppingCart,
  LucideSparkles,
  LucideTag,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { AvatarConfig, ProductCatalogItem, ProductUnit } from '../../core/models/types';
import { UploadPhotoModalComponent } from '../../shared/ui/upload-photo-modal/upload-photo-modal';
import { SwipeDismissDirective } from '../../shared/directives/swipe-dismiss.directive';
import { StorageUrlPipe } from '../../shared/pipes/resolve-storage-url.pipe';
import { AppStore } from '../../core/state/app-store';
import { AuthService } from '../../core/auth/auth.service';
import { ProductsApi, ProductResponse, CategoriesApi, CategoryResponse } from '../../core/api';

@Component({
  selector: 'app-products-view',
  imports: [
    DecimalPipe,
    FormsModule,
    CustomSelectComponent,
    SwipeDismissDirective,
    UploadPhotoModalComponent,
    StorageUrlPipe,
    LucideAlertCircle,
    LucideAlertTriangle,
    LucideArrowDownToLine,
    LucideBarcode,
    LucideBoxes,
    LucideCamera,
    LucideCheckCircle,
    LucideDollarSign,
    LucideEdit,
    LucideFolderPlus,
    LucideImage,
    LucidePackage,
    LucidePlus,
    LucideRotateCcw,
    LucideSearch,
    LucideShoppingCart,
    LucideSparkles,
    LucideTag,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './products-view.html',
})
export class ProductsView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly auth = inject(AuthService);

  protected readonly canCreate = computed(() =>
    this.auth.currentUser()?.permissions?.includes('PRODUCTS_CREATE') ?? false
  );
  protected readonly canEdit = computed(() =>
    this.auth.currentUser()?.permissions?.includes('PRODUCTS_EDIT') ?? false
  );
  protected readonly canDelete = computed(() =>
    this.auth.currentUser()?.permissions?.includes('PRODUCTS_DELETE') ?? false
  );
  protected readonly canWrite = computed(() => this.canCreate() || this.canEdit() || this.canDelete());

  protected readonly isLoading = signal(true);
  protected readonly products = signal<ProductCatalogItem[]>([]);
  private readonly apiCategories = signal<CategoryResponse[]>([]);

  protected readonly allCategory = 'Todas';

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal(this.allCategory);
  protected readonly showStockOnly = signal(true);

  protected readonly selectedProductId = signal<string | null>(null);
  protected readonly isProductModalOpen = signal(false);
  protected readonly productModalAnimatingOut = signal(false);
  protected readonly isCategoryModalOpen = signal(false);
  protected readonly categoryModalAnimatingOut = signal(false);
  protected readonly editingProductId = signal<string | null>(null);
  protected readonly newCategoryName = signal('');

  protected readonly deletePopupOpen = signal(false);
  protected readonly deletePopupAnimatingOut = signal(false);

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly reference = signal('');
  protected readonly code = signal('1247');
  protected readonly category = signal('');
  protected readonly stock = signal(10);
  protected readonly salePrice = signal(1500);
  protected readonly purchasePrice = signal(1000);
  protected readonly minPurchase = signal(10);
  protected readonly unit = signal<ProductUnit>('Und');
  protected readonly productImageUrl = signal<string | null>(null);
  protected readonly isPhotoModalOpen = signal(false);

  protected readonly units: ProductUnit[] = ['Und', 'Pqt', 'Kg', 'Lb'];

  protected readonly categoryNames = computed(() => (this.apiCategories() ?? []).map((c) => c.name));

  protected readonly categories = computed(() => [
    this.allCategory,
    ...this.categoryNames(),
  ]);

  protected readonly formCategories = computed(() => this.categories().slice(1));

  ngOnInit(): void {
    this.categoriesApi.list().subscribe({
      next: (list) => this.apiCategories.set(list),
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al cargar categorías', 'error'),
    });
    this.productsApi.list({ size: 500 }).subscribe({
      next: (page) => {
        this.products.set(page.content.map((p) => this.mapProduct(p)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err?.error?.detail ?? 'Error al cargar productos', 'error');
      },
    });
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(this.allCategory);
    this.showStockOnly.set(false);
  }

  private mapProduct(p: ProductResponse): ProductCatalogItem {
    const status: ProductCatalogItem['status'] =
      p.stock <= 0 ? 'OUT_OF_STOCK' : p.stock <= p.minPurchase ? 'LOW_STOCK' : 'IN_STOCK';
    const category = p.categoryName
      ?? this.apiCategories().find((c) => c.id === p.categoryId)?.name
      ?? '';
    return {
      id: String(p.id),
      name: p.reference,
      code: p.code,
      stock: p.stock,
      unitPrice: p.salePrice,
      purchasePrice: p.purchasePrice,
      minPurchase: p.minPurchase,
      unit: (p.unit as ProductUnit) || 'Und',
      status,
      category,
      imageUrl: p.imageUrl,
    };
  }

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    return this.products().filter((p) => {
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term);
      const matchesCategory = category === this.allCategory || p.category === category;
      const matchesStock = !this.showStockOnly() || p.stock > 0;
      return matchesTerm && matchesCategory && matchesStock;
    });
  });

  protected readonly groupedProducts = computed(() => {
    const groups = new Map<string, ProductCatalogItem[]>();
    for (const product of this.filteredProducts()) {
      const bucket = groups.get(product.category);
      if (bucket) bucket.push(product);
      else groups.set(product.category, [product]);
    }
    return this.categories()
      .filter((cat) => cat !== this.allCategory && groups.has(cat))
      .map((cat) => ({ category: cat, products: groups.get(cat) ?? [] }));
  });

  protected readonly selectedProduct = computed<ProductCatalogItem | null>(() => {
    const list = this.products();
    const id = this.selectedProductId();
    return list.find((p) => p.id === id) ?? list.at(0) ?? null;
  });

  protected readonly hasDetailVisible = computed(
    () => !this.isLoading() && this.filteredProducts().length > 0 && this.selectedProduct() !== null,
  );

  protected readonly isEditing = computed(() => this.editingProductId() !== null);

  protected stockLabel(product: ProductCatalogItem): string {
    if (product.status === 'OUT_OF_STOCK') return 'AGOTADO';
    return product.status === 'LOW_STOCK' ? 'STOCK BAJO' : 'DISPONIBLE';
  }

  protected readonly isMobileDrawerOpen = signal(false);
  protected readonly isMobileDrawerReady = signal(false);

  protected selectProduct(product: ProductCatalogItem): void {
    this.selectedProductId.set(product.id);
    this.isMobileDrawerReady.set(true);
    this.isMobileDrawerOpen.set(true);
  }

  protected closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  protected openProductModal(): void {
    this.editingProductId.set(null);
    const activeFilter = this.selectedCategory();
    const preselected = activeFilter !== this.allCategory ? activeFilter : '';
    this.reference.set('');
    this.code.set('');
    this.category.set(preselected);
    this.stock.set(0);
    this.salePrice.set(0);
    this.purchasePrice.set(0);
    this.minPurchase.set(0);
    this.unit.set('Und');
    this.productImageUrl.set(null);
    this.productModalAnimatingOut.set(false);
    this.isProductModalOpen.set(true);
  }

  protected openEditProduct(product: ProductCatalogItem): void {
    this.editingProductId.set(product.id);
    this.reference.set(product.name);
    this.code.set(product.code);
    this.category.set(product.category);
    this.stock.set(product.stock);
    this.salePrice.set(product.unitPrice);
    this.purchasePrice.set(product.purchasePrice);
    this.minPurchase.set(product.minPurchase);
    this.unit.set(product.unit);
    this.productImageUrl.set(product.imageUrl ?? null);
    this.productModalAnimatingOut.set(false);
    this.isProductModalOpen.set(true);
  }

  protected closeProductModal(): void {
    this.productModalAnimatingOut.set(true);
    setTimeout(() => {
      this.isProductModalOpen.set(false);
      this.productModalAnimatingOut.set(false);
    }, 220);
  }

  protected onProductModalBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeProductModal();
  }

  protected saveProduct(): void {
    const reference = this.reference().trim();
    if (!reference || !this.category()) return;
    const catObj = this.apiCategories().find((c) => c.name === this.category());
    const editingId = this.editingProductId();
    if (editingId) {
      this.productsApi.update(Number(editingId), {
        reference,
        categoryId: catObj?.id,
        stock: Math.max(0, this.stock()),
        minPurchase: Math.max(0, this.minPurchase()),
        purchasePrice: this.purchasePrice(),
        salePrice: this.salePrice(),
        unit: this.unit(),
        imageUrl: this.productImageUrl() ?? undefined,
      }).subscribe({
        next: (res) => {
          const mapped = this.mapProduct(res);
          this.products.update((list) => list.map((p) => (p.id === editingId ? mapped : p)));
          this.showToast('Producto actualizado exitosamente', 'success');
        },
        error: (err) => this.showToast(err?.error?.detail ?? 'Error al actualizar producto', 'error'),
      });
    } else {
      this.productsApi.create({
        reference,
        categoryId: catObj?.id ?? 0,
        stock: Math.max(0, this.stock()),
        minPurchase: Math.max(0, this.minPurchase()),
        purchasePrice: this.purchasePrice(),
        salePrice: this.salePrice(),
        unit: this.unit(),
        imageUrl: this.productImageUrl() ?? undefined,
      }).subscribe({
        next: (res) => {
          const mapped = this.mapProduct(res);
          this.products.update((list) => [...list, mapped]);
          this.showToast('Producto creado exitosamente', 'success');
        },
        error: (err) => this.showToast(err?.error?.detail ?? 'Error al crear producto', 'error'),
      });
    }
    this.closeProductModal();
  }

  protected openCategoryModal(): void {
    this.newCategoryName.set('');
    this.categoryModalAnimatingOut.set(false);
    this.isCategoryModalOpen.set(true);
  }

  protected closeCategoryModal(): void {
    this.categoryModalAnimatingOut.set(true);
    setTimeout(() => {
      this.isCategoryModalOpen.set(false);
      this.categoryModalAnimatingOut.set(false);
    }, 220);
  }

  protected onCategoryModalBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeCategoryModal();
  }

  protected saveCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.categoriesApi.create(name).subscribe({
      next: (res) => {
        this.apiCategories.update((list) => [...list, res]);
        this.selectedCategory.set(res.name);
        this.showToast('Categoría creada exitosamente', 'success');
      },
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al crear categoría', 'error'),
    });
    this.closeCategoryModal();
  }

  protected openDeletePopup(): void {
    this.deletePopupAnimatingOut.set(false);
    this.deletePopupOpen.set(true);
  }

  protected closeDeletePopup(): void {
    this.deletePopupAnimatingOut.set(true);
    setTimeout(() => {
      this.deletePopupOpen.set(false);
      this.deletePopupAnimatingOut.set(false);
    }, 220);
  }

  protected onDeleteBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeDeletePopup();
  }

  protected confirmDelete(): void {
    const sel = this.selectedProduct();
    if (!sel) return;
    this.closeDeletePopup();
    this.productsApi.delete(Number(sel.id)).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== sel.id));
        this.showToast('Producto eliminado exitosamente', 'success');
      },
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al eliminar producto', 'error'),
    });
  }

  protected showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastOpen.set(true);
    this.toastTimer = setTimeout(() => this.toastOpen.set(false), 4000);
  }

  protected closeToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastOpen.set(false);
  }

  protected handlePhotoSaved(event: { avatarUrl: string; config: AvatarConfig }): void {
    this.productImageUrl.set(event.avatarUrl);
    const editingId = this.editingProductId();
    if (editingId) {
      this.productsApi.update(Number(editingId), { imageUrl: event.avatarUrl }).subscribe({
        next: (res) => {
          const mapped = this.mapProduct(res);
          this.products.update((list) => list.map((p) => (p.id === editingId ? mapped : p)));
        },
      });
    }
  }
}
