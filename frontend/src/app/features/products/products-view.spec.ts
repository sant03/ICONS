import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { AppStore } from '../../core/state/app-store';
import { Shell } from '../../layout/shell/shell';

/**
 * Products module: grid by category, "Detalles del Producto" sidebar and the
 * two modals of "ICONS COMPLETE/src/views/ProductsView.tsx", keeping the
 * category search chips, the search bar and the stock status chip of the
 * Design System inside the product card.
 */
describe('Products module (chips / busqueda / detalle / modales)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  const mountProducts = async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/products');
    await new Promise((r) => setTimeout(r));

    const shell = TestBed.createComponent(Shell);
    shell.detectChanges();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    return shell;
  };

  const root = (shell: { nativeElement: HTMLElement }): HTMLElement =>
    shell.nativeElement as HTMLElement;

  const buttonByText = (host: HTMLElement, needle: string): HTMLButtonElement => {
    const button = [...host.querySelectorAll('button')].find((b) =>
      b.textContent?.includes(needle),
    );
    if (!button) throw new Error(`button "${needle}" not found`);
    return button;
  };

  /** Implicit form submission is not triggered by `.click()` in the test browser. */
  const submitOf = (host: HTMLElement, submitLabel: string): void => {
    const form = buttonByText(host, submitLabel).closest('form');
    if (!form) throw new Error(`form of "${submitLabel}" not found`);
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  const typeInto = (host: HTMLElement, name: string, value: string): void => {
    const input = host.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('keeps the category chips, the search bar and the stock filter', async () => {
    const shell = await mountProducts();
    const text = root(shell).textContent ?? '';

    expect(text).toContain('Productos');
    expect(text).toContain('Catálogo general de inventario por categoría');
    for (const chip of ['Todas', 'Bolsas de Libra', 'Bolsas de Kilo', 'Hielo', 'Desechables']) {
      expect(text).toContain(chip);
    }
    expect(root(shell).querySelector('input[name="productSearch"]')).toBeTruthy();
    expect(root(shell).querySelector('input[name="stockOnly"]')).toBeTruthy();
    expect(text).toContain('Mostrar solo con Stock disponible');
  });

  it('groups the catalog by category and counts the filtered products', async () => {
    const shell = await mountProducts();
    const text = root(shell).textContent ?? '';

    expect(text).toContain('Hielo Largo');
    expect(text).toContain('Paquete Pitillo');
    // "Stock disponible" is on by default, so the 0-unit product (p4) is hidden.
    expect(text).not.toContain('P/B 3 Libras');
    expect(text).toContain('Total de productos: 13');

    (root(shell).querySelector('input[name="stockOnly"]') as HTMLInputElement).click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(root(shell).textContent).toContain('P/B 3 Libras');
    expect(root(shell).textContent).toContain('Total de productos: 14');
  });

  it('shows the stock status chip inside the product card', async () => {
    const shell = await mountProducts();
    const text = root(shell).textContent ?? '';

    expect(text).toContain('DISPONIBLE');
    expect(text).toContain('STOCK BAJO');

    // p1 (3 units, min 13) is "Por Agotarse" in the detail sidebar.
    buttonByText(root(shell), 'Hielo Jumbo T').click();
    shell.detectChanges();
    expect(root(shell).textContent).toContain('Este producto está por agotarse');

    (root(shell).querySelector('input[name="stockOnly"]') as HTMLInputElement).click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(root(shell).textContent).toContain('AGOTADO');
  });

  it('filters by reference or code', async () => {
    const shell = await mountProducts();
    const host = root(shell);

    typeInto(host, 'productSearch', '1243');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(host.textContent).toContain('Total de productos: 1');
    expect(host.textContent).toContain('P/B 1/2 Libra');

    typeInto(host, 'productSearch', 'hielo');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(host.textContent).toContain('Total de productos: 4');
    expect(host.textContent).not.toContain('Paquete Pitillo');
  });

  it('shows the detail of the selected product and edits it', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountProducts();
    const host = root(shell);

    buttonByText(host, 'P/B 1 Libra').click();
    shell.detectChanges();

    expect(host.textContent).toContain('Detalles del Producto');
    expect(host.textContent).toContain('Sin imagen asignada');
    expect(host.textContent).toContain('Precio Venta');
    expect(host.textContent).toContain('Mínimo Compra');

    buttonByText(host, 'Editar').click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(host.textContent).toContain('Editar Producto');

    typeInto(host, 'reference', 'P/B 1 Libra Premium');
    await new Promise((r) => setTimeout(r));
    submitOf(host, 'Guardar');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    const edited = store.products().find((p) => p.id === 'p2');
    expect(edited?.name).toBe('P/B 1 Libra Premium');
    expect(host.textContent).toContain('P/B 1 Libra Premium');
  });

  it('creates a category from the Nueva Categoría modal', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountProducts();
    const host = root(shell);

    buttonByText(host, 'Nueva Categoría').click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(host.textContent).toContain('Crear nueva categoría');

    typeInto(host, 'categoryName', 'Bolsas de/onza');
    await new Promise((r) => setTimeout(r));
    submitOf(host, 'Crear Categoría');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(store.productCategories()).toContain('Bolsas de/onza');
    // The modal closes and the new chip takes the selection.
    expect(host.textContent).not.toContain('Crear nueva categoría');
    expect(buttonByText(host, 'Bolsas de/onza').className).toContain('bg-cyan-500');
  });

  it('adds a product from the Añadir Producto modal', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountProducts();
    const host = root(shell);
    const before = store.products().length;

    buttonByText(host, 'Añadir Producto').click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(host.textContent).toContain('Añadir Nuevo Producto');

    typeInto(host, 'reference', 'P/B 1/2 Libra');
    typeInto(host, 'code', '1299');
    const stock = host.querySelector('input[name="stock"]') as HTMLInputElement;
    stock.value = '40';
    stock.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    submitOf(host, 'Guardar');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(store.products().length).toBe(before + 1);
    const created = store.products().find((p) => p.code === '1299');
    expect(created?.name).toBe('P/B 1/2 Libra');
    expect(created?.category).toBe('Bolsas de Libra');
    expect(created?.status).toBe('IN_STOCK');
    expect(host.textContent).toContain('P/B 1/2 Libra');
  });
});