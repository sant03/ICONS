import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AppStore } from './core/state/app-store';

const PATHS: { path: string; needle: string }[] = [
  { path: '/welcome', needle: 'Welcome' },
  { path: '/login', needle: 'Log in' },
  { path: '/register', needle: 'Create a new account' },
  { path: '/dashboard', needle: 'Panel de Control General' },
  { path: '/sales', needle: 'Sales' },
  { path: '/orders', needle: 'Ventas / Pedidos' },
  { path: '/purchase-order', needle: 'Purchase Order' },
  { path: '/purchase-orders', needle: 'Todas las Órdenes de Compra' },
  { path: '/users', needle: 'Gestión de cuentas de personal y roles de acceso' },
  { path: '/profile', needle: 'BACK TO USERS' },
  { path: '/products', needle: 'Catálogo general de inventario por categoría' },
  { path: '/settings', needle: 'Ajustes del Sistema' },
  { path: '/clients', needle: 'Todos los Clientes' },
  { path: '/suppliers', needle: 'Todos los Proveedores' },
];

describe('view smoke tests', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  for (const { path, needle } of PATHS) {
    it(`renders ${path}`, async () => {
      const router = TestBed.inject(Router);
      const store = TestBed.inject(AppStore);
      await router.navigateByUrl(path);
      await new Promise((r) => setTimeout(r));

      // The feature view renders inside the shell outlet, so mount the whole app tree.
      const shell = TestBed.createComponent(
        (await import('./layout/shell/shell')).Shell,
      );
      shell.detectChanges();
      await new Promise((r) => setTimeout(r));
      shell.detectChanges();

      const text = (shell.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain(needle);
      expect(store.currentView()).toBe(path.replace('/', ''));
    });
  }
});

describe('Orden de Compra module', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  const mountShell = async () => {
    const shell = TestBed.createComponent((await import('./layout/shell/shell')).Shell);
    shell.detectChanges();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    return shell;
  };

  it('opens the document of the order in the URL', async () => {
    const router = TestBed.inject(Router);
    const store = TestBed.inject(AppStore);
    await router.navigateByUrl('/purchase-order-detail/003');
    await new Promise((r) => setTimeout(r));

    const shell = await mountShell();
    const text = (shell.nativeElement as HTMLElement).textContent ?? '';

    expect(store.currentView()).toBe('purchase-order-detail');
    expect(text).toContain('Datos de Proveedor');
    expect(text).toContain('Plastidias');
    expect(text).toContain('Gerencia General');
  });

  it('keeps "Orden de Compra" highlighted on the list, the detail and the form', async () => {
    const router = TestBed.inject(Router);
    const shell = TestBed.createComponent((await import('./layout/shell/shell')).Shell);
    shell.detectChanges();

    for (const path of [
      '/purchase-orders',
      '/purchase-order-detail/003',
      '/purchase-order',
    ]) {
      await router.navigateByUrl(path);
      await new Promise((r) => setTimeout(r));
      shell.detectChanges();

      const item = [...(shell.nativeElement as HTMLElement).querySelectorAll('aside nav button')]
        .find((b) => b.textContent?.includes('Orden de Compra'));
      expect(item?.className).toContain('bg-cyan-500');
    }
  });
});

describe('sidebar Clients/Prov entry', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  const findItem = (shell: { nativeElement: HTMLElement }, label: string) =>
    [...shell.nativeElement.querySelectorAll('aside nav button')].find((b) =>
      b.textContent?.includes(label),
    );

  for (const path of ['/clients', '/suppliers']) {
    it(`stays highlighted on ${path}`, async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl(path);
      await new Promise((r) => setTimeout(r));

      const shell = TestBed.createComponent(
        (await import('./layout/shell/shell')).Shell,
      );
      shell.detectChanges();
      await new Promise((r) => setTimeout(r));
      shell.detectChanges();

      const item = findItem(shell, 'Clientes / Proveedores');
      expect(item).toBeTruthy();
      expect(item!.className).toContain('bg-cyan-500');
      expect(findItem(shell, 'Inicio')!.className).not.toContain('bg-cyan-500');
    });
  }

  it('releases the entry on /dashboard', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    await new Promise((r) => setTimeout(r));

    const shell = TestBed.createComponent(
      (await import('./layout/shell/shell')).Shell,
    );
    shell.detectChanges();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(findItem(shell, 'Clientes / Proveedores')!.className).not.toContain(
      'bg-cyan-500',
    );
    expect(findItem(shell, 'Inicio')!.className).toContain('bg-cyan-500');
  });
});
