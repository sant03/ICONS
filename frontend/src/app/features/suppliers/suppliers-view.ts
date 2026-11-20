import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideBuilding,
  LucideCheckCircle2,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucidePlus,
  LucideSquarePen,
  LucideX,
} from '@lucide/angular';
import { Supplier } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { SuppliersApi, SupplierResponse } from '../../core/api';

/**
 * Proveedores tab of the Clients/Prov module: tab bar, supplier list, detail
 * card and the create/edit modal.
 *
 * NEW component built from the Clients/Prov mockup — the original React app
 * had no supplier directory. `/clients` and `/suppliers` are the two tabs of
 * the same screen, one route each.
 */
@Component({
  selector: 'app-suppliers-view',
  imports: [
    FormsModule,
    LucideBuilding,
    LucideCheckCircle2,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucidePhone,
    LucidePlus,
    LucideSquarePen,
    LucideX,
  ],
  templateUrl: './suppliers-view.html',
})
export class SuppliersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(SuppliersApi);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly selectedId = signal('');

  protected readonly selected = computed<Supplier | null>(
    () =>
      this.suppliers().find((s) => s.id === this.selectedId()) ?? this.suppliers()[0] ?? null,
  );

  ngOnInit(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        const mapped = page.content.map((s) => SuppliersView.mapSupplier(s));
        this.suppliers.set(mapped);
        if (mapped.length && !this.selectedId()) this.selectedId.set(mapped[0].id);
      },
    });
  }

  private static mapSupplier(s: SupplierResponse): Supplier {
    return {
      id: String(s.id),
      name: s.name,
      code: s.code ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      avatarUrl: s.avatarUrl ?? undefined,
    };
  }

  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Supplier>(SuppliersView.emptyDraft());

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar proveedor' : 'Añadir nuevo proveedor',
  );

  protected readonly isMobileDrawerOpen = signal(false);
  protected readonly isMobileDrawerReady = signal(false);

  protected select(id: string): void {
    this.selectedId.set(id);
    this.isMobileDrawerReady.set(true);
    this.isMobileDrawerOpen.set(true);
  }

  protected closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  protected openCreate(): void {
    this.editingId.set('');
    this.draft.set(SuppliersView.emptyDraft());
    this.modalOpen.set(true);
  }

  protected openEdit(): void {
    const sel = this.selected();
    if (!sel) return;
    this.editingId.set(sel.id);
    this.draft.set({ ...sel });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected updateDraft(patch: Partial<Supplier>): void {
    this.draft.update((prev) => ({ ...prev, ...patch }));
  }

  protected save(): void {
    const draft = this.draft();
    if (!draft.name.trim()) return;

    const editingId = this.editingId();
    if (editingId) {
      this.api.update(Number(editingId), {
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      }).subscribe({
        next: (res) => {
          const mapped = SuppliersView.mapSupplier(res);
          this.suppliers.update((list) => list.map((s) => (s.id === editingId ? mapped : s)));
          this.selectedId.set(editingId);
        },
      });
    } else {
      this.api.create({
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      }).subscribe({
        next: (res) => {
          const mapped = SuppliersView.mapSupplier(res);
          this.suppliers.update((list) => [...list, mapped]);
          this.selectedId.set(mapped.id);
        },
      });
    }
    this.modalOpen.set(false);
  }

  /** WhatsApp deep link for the floating chat button of the detail card. */
  protected chatHref(): string {
    return `https://wa.me/57${(this.selected()?.phone ?? '').replace(/\D/g, '')}`;
  }

  private static emptyDraft(): Supplier {
    return { id: '', name: '', code: '', phone: '', email: '', address: '' };
  }
}
