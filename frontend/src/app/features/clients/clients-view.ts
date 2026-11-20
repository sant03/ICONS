import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { CustomersApi, CustomerResponse } from '../../core/api';

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
export class ClientsView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(CustomersApi);

  protected readonly clients = signal<Client[]>([]);
  protected readonly selectedId = signal('');

  protected readonly selected = computed<Client | null>(
    () =>
      this.clients().find((c) => c.id === this.selectedId()) ?? this.clients()[0] ?? null,
  );

  ngOnInit(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        const mapped = page.content.map((c) => ClientsView.mapCustomer(c));
        this.clients.set(mapped);
        if (mapped.length && !this.selectedId()) this.selectedId.set(mapped[0].id);
      },
    });
  }

  private static mapCustomer(c: CustomerResponse): Client {
    return {
      id: String(c.id),
      name: c.name,
      docId: c.docId ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      avatarUrl: c.avatarUrl ?? undefined,
    };
  }

  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Client>(ClientsView.emptyDraft());

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar cliente' : 'Añadir nuevo cliente',
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
    this.draft.set(ClientsView.emptyDraft());
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

  protected updateDraft(patch: Partial<Client>): void {
    this.draft.update((prev) => ({ ...prev, ...patch }));
  }

  protected save(): void {
    const draft = this.draft();
    if (!draft.name.trim()) return;

    const editingId = this.editingId();
    if (editingId) {
      this.api.update(Number(editingId), {
        name: draft.name,
        docId: draft.docId,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      }).subscribe({
        next: (res) => {
          const mapped = ClientsView.mapCustomer(res);
          this.clients.update((list) => list.map((c) => (c.id === editingId ? mapped : c)));
          this.selectedId.set(editingId);
        },
      });
    } else {
      this.api.create({
        name: draft.name,
        docId: draft.docId,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
      }).subscribe({
        next: (res) => {
          const mapped = ClientsView.mapCustomer(res);
          this.clients.update((list) => [...list, mapped]);
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

  private static emptyDraft(): Client {
    return { id: '', name: '', docId: '', phone: '', email: '', address: '' };
  }
}
