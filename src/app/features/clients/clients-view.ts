import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCheckCircle2,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucidePlus,
  LucideSquarePen,
  LucideUser,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { Client } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

/**
 * Clientes tab of the Clients/Prov module: tab bar, client list, detail card
 * and the create/edit modal.
 *
 * NEW component built from the Clients/Prov mockup — the original React app
 * had no client directory. `/clients` and `/suppliers` are the two tabs of the
 * same screen, one route each.
 */
@Component({
  selector: 'app-clients-view',
  imports: [
    FormsModule,
    LucideCheckCircle2,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucidePhone,
    LucidePlus,
    LucideSquarePen,
    LucideUser,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './clients-view.html',
})
export class ClientsView {
  protected readonly store = inject(AppStore);

  /** The mockup opens with the first client selected. */
  protected readonly selectedId = signal(this.store.clients()[0]?.id ?? '');

  protected readonly selected = computed<Client>(
    () =>
      this.store.clients().find((c) => c.id === this.selectedId()) ?? this.store.clients()[0],
  );

  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Client>(ClientsView.emptyDraft());

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar cliente' : 'Añadir nuevo cliente',
  );

  protected select(id: string): void {
    this.selectedId.set(id);
  }

  protected openCreate(): void {
    this.editingId.set('');
    this.draft.set(ClientsView.emptyDraft());
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

  protected updateDraft(patch: Partial<Client>): void {
    this.draft.update((prev) => ({ ...prev, ...patch }));
  }

  protected save(): void {
    const draft = this.draft();
    if (!draft.name.trim() || !draft.docId.trim()) return;

    const editingId = this.editingId();
    if (editingId) {
      this.store.updateClient(editingId, {
        name: draft.name,
        docId: draft.docId,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      });
      this.selectedId.set(editingId);
    } else {
      const id = `cli-${Date.now()}`;
      this.store.addClient({ ...draft, id });
      this.selectedId.set(id);
    }
    this.modalOpen.set(false);
  }

  /** WhatsApp deep link for the floating chat button of the detail card. */
  protected chatHref(): string {
    return `https://wa.me/57${this.selected().phone.replace(/\D/g, '')}`;
  }

  private static emptyDraft(): Client {
    return { id: '', name: '', docId: '', phone: '', email: '', address: '' };
  }
}
