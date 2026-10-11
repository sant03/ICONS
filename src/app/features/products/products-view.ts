import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertCircle,
  LucideBox,
  LucideEdit,
  LucideFolderPlus,
  LucideImage,
  LucidePackage,
  LucidePlus,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { ProductCatalogItem, ProductUnit } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

/**
 * Productos: grilla por categoria + panel lateral de detalle, portado de
 * "ICONS COMPLETE/src/views/ProductsView.tsx".
 *
 * Mapeo del source (props/state) a signals de Angular:
 *   products            -> store.products()
 *   searchQuery         -> searchTerm
 *   selectedProduct     -> selectedProductId (computed)
 *   showStockOnly       -> showStockOnly
 *   showAddProductModal -> isProductModalOpen
 *   showAddCategoryModal-> isCategoryModalOpen
 *   newCategoryName     -> newCategoryName
 *   newProduct          -> formulario (referencia/codigo/categoria/cantidad/...)
 *   onAddProduct        -> saveProduct()
 *   onUpdateProduct     -> saveProduct() en modo edicion (el source solo avisa)
 *   handleAddCategory   -> saveCategory() sobre store.productCategories
 *
 * Se conservan los chips de busqueda por categoria y la barra de busqueda, y
 * el estado de stock se muestra con el formato de chip del Design System
 * (DISPONIBLE / STOCK BAJO / AGOTADO) dentro de la card del producto.
 */
@Component({
  selector: 'app-products-view',
  imports: [
    FormsModule,
    LucideAlertCircle,
    LucideBox,
    LucideEdit,
    LucideFolderPlus,
    LucideImage,
    LucidePackage,
    LucidePlus,
    LucideSearch,
    LucideX,
  ],
  templateUrl: './products-view.html',
})
export class ProductsView {
  protected readonly store = inject(AppStore);

  /** Primera categoria; el source deriva las categorias de `products`. */
  protected readonly allCategory = 'Todas';

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal(this.allCategory);
  protected readonly showStockOnly = signal(true);

  protected readonly selectedProductId = signal<string | null>(null);
  protected readonly isProductModalOpen = signal(false);
  protected readonly isCategoryModalOpen = signal(false);
  protected readonly editingProductId = signal<string | null>(null);
  protected readonly newCategoryName = signal('');

  // Formulario de producto (alta y edicion comparten modal).
  protected readonly reference = signal('');
  protected readonly code = signal('1247');
  protected readonly category = signal('');
  protected readonly stock = signal(10);
  protected readonly salePrice = signal(1500);
  protected readonly purchasePrice = signal(1000);
  protected readonly minPurchase = signal(10);
  protected readonly unit = signal<ProductUnit>('Und');

  protected readonly units: ProductUnit[] = ['Und', 'Pqt', 'Kg', 'Lb'];

  protected readonly categories = computed(() => [
    this.allCategory,
    ...this.store.productCategories(),
  ]);

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    return this.store.products().filter((p) => {
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term);
      const matchesCategory = category === this.allCategory || p.category === category;
      const matchesStock = !this.showStockOnly() || p.stock > 0;
      return matchesTerm && matchesCategory && matchesStock;
    });
  });

  /** `categories.map(...)` del source: un panel por categoria con productos. */
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

  /** `setSelectedProduct` del source; por defecto muestra el primer producto. */
  protected readonly selectedProduct = computed<ProductCatalogItem | null>(() => {
    const products = this.store.products();
    const id = this.selectedProductId();
    return products.find((p) => p.id === id) ?? products.at(0) ?? null;
  });

  protected readonly isEditing = computed(() => this.editingProductId() !== null);

  /** Etiqueta del chip de estado de stock. */
  protected stockLabel(product: ProductCatalogItem): string {
    if (product.status === 'OUT_OF_STOCK') return 'AGOTADO';
    return product.status === 'LOW_STOCK' ? 'STOCK BAJO' : 'DISPONIBLE';
  }

  protected selectProduct(product: ProductCatalogItem): void {
    this.selectedProductId.set(product.id);
  }

  protected openProductModal(): void {
    this.editingProductId.set(null);
    const [firstCategory] = this.store.productCategories();
    this.reference.set('');
    this.code.set('1247');
    this.category.set(firstCategory ?? '');
    this.stock.set(10);
    this.salePrice.set(1500);
    this.purchasePrice.set(1000);
    this.minPurchase.set(10);
    this.unit.set('Und');
    this.isProductModalOpen.set(true);
  }

  /** El source abre el modal con `onUpdateProduct` (stub alert). */
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
    this.isProductModalOpen.set(true);
  }

  protected closeProductModal(): void {
    this.isProductModalOpen.set(false);
  }

  protected saveProduct(): void {
    const reference = this.reference().trim();
    if (!reference) return;
    const base = {
      name: reference,
      code: this.code().trim(),
      category: this.category(),
      stock: Math.max(0, this.stock()),
      unitPrice: this.salePrice(),
      purchasePrice: this.purchasePrice(),
      minPurchase: Math.max(0, this.minPurchase()),
      unit: this.unit(),
    };
    const editingId = this.editingProductId();
    if (editingId) {
      this.store.updateProduct(editingId, base);
    } else {
      this.store.addProduct({ id: `p-${Date.now()}`, ...base, status: 'IN_STOCK' });
    }
    this.isProductModalOpen.set(false);
  }

  protected saveCategory(): void {
    this.store.addCategory(this.newCategoryName());
    const created = this.newCategoryName().trim();
    if (created) this.selectedCategory.set(created);
    this.newCategoryName.set('');
    this.isCategoryModalOpen.set(false);
  }
}