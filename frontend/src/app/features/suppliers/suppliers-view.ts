import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertTriangle,
  LucideBuilding,
  LucideCheckCircle2,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucidePlus,
  LucideRotateCcw,
  LucideSearch,
  LucideSquarePen,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { Supplier } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { SuppliersApi, SupplierResponse } from '../../core/api';
import { ImageUploadComponent } from '../../shared/ui/image-upload/image-upload';

@Component({
  selector: 'app-suppliers-view',
  imports: [
    FormsModule,
    LucideAlertTriangle,
    LucideBuilding,
    LucideCheckCircle2,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucidePhone,
    LucidePlus,
    LucideRotateCcw,
    LucideSearch,
    LucideSquarePen,
    LucideTrash2,
    LucideX,
    ImageUploadComponent,
  ],
  templateUrl: './suppliers-view.html',
})
export class SuppliersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(SuppliersApi);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly selectedId = signal('');
  protected readonly searchTerm = signal('');

  protected readonly filteredSuppliers = computed(() => {
    const list = this.suppliers();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.phone.includes(term),
    );
  });

  protected readonly selected = computed<Supplier | null>(
    () =>
      this.filteredSuppliers().find((s) => s.id === this.selectedId()) ??
      this.filteredSuppliers()[0] ??
      null,
  );

  protected readonly hasDetailVisible = computed(
    () => !this.isLoading() && !this.hasError() && this.filteredSuppliers().length > 0 && this.selected() !== null
  );

  ngOnInit(): void {
    this.loadSuppliers();
  }

  protected loadSuppliers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        const mapped = page.content.map((s) => SuppliersView.mapSupplier(s));
        this.suppliers.set(mapped);
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
  protected readonly modalAnimatingOut = signal(false);
  protected readonly editingId = signal('');
  protected readonly draft = signal<Supplier>(SuppliersView.emptyDraft());

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar proveedor' : 'Añadir nuevo proveedor',
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
    this.draft.set(SuppliersView.emptyDraft());
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
        avatarUrl: draft.avatarUrl,
      }).subscribe({
        next: (res) => {
          const mapped = SuppliersView.mapSupplier(res);
          this.suppliers.update((list) => list.map((s) => (s.id === editingId ? mapped : s)));
          this.selectedId.set(editingId);
        },
        error: (err) => this.notify(err?.error?.detail ?? 'Error al actualizar proveedor'),
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
        error: (err) => this.notify(err?.error?.detail ?? 'Error al crear proveedor'),
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
        this.suppliers.update((list) => list.filter((s) => s.id !== sel.id));
      },
      error: (err) => this.notify(err?.error?.detail ?? 'Error al eliminar proveedor'),
    });
  }

  protected chatHref(): string {
    return `https://wa.me/57${(this.selected()?.phone ?? '').replace(/\D/g, '')}`;
  }

  protected notify(message: string): void {
    window.alert(message);
  }

  private static emptyDraft(): Supplier {
    return { id: '', name: '', code: '', phone: '', email: '', address: '' };
  }
}
