import { Component, computed, inject, signal } from '@angular/core';
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
export class SuppliersView {
  protected readonly store = inject(AppStore);

  /** The mockup opens with the first supplier selected. */
  protected readonly selectedId = signal(this.store.suppliers()[0]?.id ?? '');

  protected readonly selected = computed<Supplier>(
    () =>
      this.store.suppliers().find((s) => s.id === this.selectedId()) ?? this.store.suppliers()[0],
  );

  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Supplier>(SuppliersView.emptyDraft());

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar proveedor' : 'Añadir nuevo proveedor',
  );

  protected select(id: string): void {
    this.selectedId.set(id);
  }

  protected openCreate(): void {
    this.editingId.set('');
    this.draft.set(SuppliersView.emptyDraft());
    this.modalOpen.set(true);
  }

  protected openEdit(): void {
    this.editingId.set(this.selected().id);
    this.draft.set({ ...this.selected() });
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
    if (!draft.name.trim() || !draft.code.trim()) return;

    const editingId = this.editingId();
    if (editingId) {
      this.store.updateSupplier(editingId, {
        name: draft.name,
        code: draft.code,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      });
      this.selectedId.set(editingId);
    } else {
      const id = `sup-${Date.now()}`;
      this.store.addSupplier({ ...draft, id });
      this.selectedId.set(id);
    }
    this.modalOpen.set(false);
  }

  /** WhatsApp deep link for the floating chat button of the detail card. */
  protected chatHref(): string {
    return `https://wa.me/57${this.selected().phone.replace(/\D/g, '')}`;
  }

  private static emptyDraft(): Supplier {
    return { id: '', name: '', code: '', phone: '', email: '', address: '' };
  }
}
