import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertTriangle,
  LucideCamera,
  LucideCheckCircle2,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucidePlus,
  LucideRotateCcw,
  LucideSearch,
  LucideSparkles,
  LucideSquarePen,
  LucideTrash2,
  LucideUser,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { AvatarConfig, Client } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { CustomersApi, CustomerResponse } from '../../core/api';
import { UploadPhotoModalComponent } from '../../shared/ui/upload-photo-modal/upload-photo-modal';

@Component({
  selector: 'app-clients-view',
  imports: [
    FormsModule,
    UploadPhotoModalComponent,
    LucideAlertTriangle,
    LucideCamera,
    LucideCheckCircle2,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucidePhone,
    LucidePlus,
    LucideRotateCcw,
    LucideSearch,
    LucideSparkles,
    LucideSquarePen,
    LucideTrash2,
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
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly selectedId = signal('');
  protected readonly searchTerm = signal('');

  protected readonly filteredClients = computed(() => {
    const list = this.clients();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.docId.toLowerCase().includes(term) ||
        c.phone.includes(term),
    );
  });

  protected readonly selected = computed<Client | null>(
    () =>
      this.filteredClients().find((c) => c.id === this.selectedId()) ??
      this.filteredClients()[0] ??
      null,
  );

  protected readonly hasDetailVisible = computed(
    () => !this.isLoading() && !this.hasError() && this.filteredClients().length > 0 && this.selected() !== null
  );

  ngOnInit(): void {
    this.loadClients();
  }

  protected loadClients(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        const mapped = page.content.map((c) => ClientsView.mapCustomer(c));
        this.clients.set(mapped);
        this.isLoading.set(false);
        if (mapped.length && !this.selectedId()) this.selectedId.set(mapped[0].id);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.error?.detail || err?.message || 'Error al conectar con el servidor.');
      },
    });
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
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
  protected readonly modalAnimatingOut = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Client>(ClientsView.emptyDraft());
  protected readonly isPhotoModalOpen = signal(false);

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar cliente' : 'Añadir nuevo cliente',
  );

  protected readonly deletePopupOpen = signal(false);
  protected readonly deletePopupAnimatingOut = signal(false);

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
    this.modalAnimatingOut.set(false);
    this.modalOpen.set(true);
  }

  protected openEdit(): void {
    const sel = this.selected();
    if (!sel) return;
    this.editingId.set(sel.id);
    this.draft.set({ ...sel });
    this.modalAnimatingOut.set(false);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalAnimatingOut.set(true);
    setTimeout(() => {
      this.modalOpen.set(false);
      this.modalAnimatingOut.set(false);
    }, 220);
  }

  protected onModalBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
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
        avatarUrl: draft.avatarUrl,
      }).subscribe({
        next: (res) => {
          const mapped = ClientsView.mapCustomer(res);
          this.clients.update((list) => list.map((c) => (c.id === editingId ? mapped : c)));
          this.selectedId.set(editingId);
        },
        error: (err) => this.notify(err?.error?.detail ?? 'Error al actualizar cliente'),
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
        error: (err) => this.notify(err?.error?.detail ?? 'Error al crear cliente'),
      });
    }
    this.closeModal();
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
    const sel = this.selected();
    if (!sel) return;
    this.closeDeletePopup();
    this.api.delete(Number(sel.id)).subscribe({
      next: () => {
        this.clients.update((list) => list.filter((c) => c.id !== sel.id));
      },
      error: (err) => this.notify(err?.error?.detail ?? 'Error al eliminar cliente'),
    });
  }

  protected chatHref(): string {
    return `https://wa.me/57${(this.selected()?.phone ?? '').replace(/\D/g, '')}`;
  }

  protected notify(message: string): void {
    window.alert(message);
  }

  protected handlePhotoSaved(event: { avatarUrl: string; config: AvatarConfig }): void {
    this.updateDraft({ avatarUrl: event.avatarUrl });
  }

  private static emptyDraft(): Client {
    return { id: '', name: '', docId: '', phone: '', email: '', address: '' };
  }
}
