import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { AppStore } from '../../core/state/app-store';
import { Shell } from '../../layout/shell/shell';

/**
 * Sales module: the "ESTADO DE PAGO" / "ACCIONES" columns, the row selection
 * with "Agrupar en Pedido" and the "Ordenar Por" modal, all ported from
 * "ICONS COMPLETE/src/views/SalesView.tsx".
 */
describe('Sales module (pago / acciones / agrupar / ordenar)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  const mountSales = async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/sales');
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

  const historicalRows = (host: HTMLElement): HTMLTableRowElement[] => {
    const tables = [...host.querySelectorAll('table')];
    const table = tables[tables.length - 1];
    return [...table.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  };

  /** Row action of the archive table (the last one), so the two tables do not collide. */
  const historicalAction = (host: HTMLElement, title: string): HTMLButtonElement =>
    historicalRows(host)[0].querySelector(`button[title="${title}"]`) as HTMLButtonElement;

  const totalsOfArchive = (host: HTMLElement): (string | undefined)[] =>
    historicalRows(host).map((row) => row.querySelectorAll('td')[6]?.textContent?.trim());

  /** Implicit form submission is not triggered by `.click()` in the test browser. */
  const submitOf = (host: HTMLElement, submitLabel: string): void => {
    const form = buttonByText(host, submitLabel).closest('form');
    if (!form) throw new Error(`form of "${submitLabel}" not found`);
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  it('shows the ESTADO DE PAGO and ACCIONES columns with payment badges', async () => {
    const shell = await mountSales();
    const text = root(shell).textContent ?? '';

    expect(text).toContain('ESTADO DE PAGO');
    expect(text).toContain('ACCIONES');
    expect(text).toContain('Pagado');
    expect(text).toContain('Debe $3000');
  });

  it('warns when grouping without a selection and groups the checked records into an order', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountSales();
    const host = root(shell);

    buttonByText(host, 'Agrupar en Pedido').click();
    shell.detectChanges();
    expect(host.textContent).toContain('Marque los registros que desea agrupar');

    const ordersBefore = store.orders().length;
    const historicalBefore = store.historicalSales().length;

    (host.querySelector('input[title="Seleccionar todo"]') as HTMLInputElement).click();
    shell.detectChanges();
    expect(host.textContent).toContain('6 seleccionados');

    buttonByText(host, 'Agrupar en Pedido').click();
    shell.detectChanges();
    expect(host.textContent).toContain('Crear Pedido');
    expect(host.textContent).toContain('Productos a agrupar (6)');

    submitOf(host, 'Guardar Pedido');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(store.orders().length).toBe(ordersBefore + 1);
    expect(store.historicalSales().length).toBe(0);
    expect(store.currentView()).toBe('orders');
  });

  it('sorts the historical records from the Ordenar Por modal', async () => {
    const shell = await mountSales();
    const host = root(shell);

    // Default: most recent date first (12/02/2022 -> Andres Ruiz).
    expect(historicalRows(host)[0].textContent).toContain('Andres Ruiz');

    (host.querySelector('button[title="Ordenar"]') as HTMLButtonElement).click();
    shell.detectChanges();
    expect(host.textContent).toContain('Ordenar Por');

    (host.querySelector('input[value="amount_desc"]') as HTMLInputElement).click();
    buttonByText(host, 'Listo').click();
    shell.detectChanges();

    // 7.500 is the highest total of the archive.
    expect(totalsOfArchive(host)[0]).toBe('$7500');
  });

  it('edits a record from the ACCIONES column and recalculates the total', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountSales();
    const host = root(shell);

    historicalAction(host, 'Editar Registro').click();
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();
    expect(host.textContent).toContain('Editar Registro, Ventas');

    const quantity = host.querySelector('input[name="editQuantity"]') as HTMLInputElement;
    quantity.value = '4';
    quantity.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    submitOf(host, 'Guardar cambios');
    await new Promise((r) => setTimeout(r));
    shell.detectChanges();

    expect(host.textContent).not.toContain('Editar Registro, Ventas');

    // #001 Andres Ruiz (first archive row): 3 x $1.200 -> 4 x $1.200 = $4.800
    const edited = store.historicalSales().find((s) => s.code === '001');
    expect(edited?.quantity).toBe(4);
    expect(edited?.total).toBe(4800);
  });

  it('deletes a record after confirming in the modal', async () => {
    const store = TestBed.inject(AppStore);
    const shell = await mountSales();
    const host = root(shell);

    const before = store.historicalSales().length;
    historicalAction(host, 'Eliminar Registro').click();
    shell.detectChanges();
    expect(host.textContent).toContain('¿Seguro que desea eliminar este registro?');

    buttonByText(host, 'Eliminar').click();
    shell.detectChanges();

    expect(store.historicalSales().length).toBe(before - 1);
  });
});