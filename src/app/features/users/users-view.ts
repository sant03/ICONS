import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCamera,
  LucideCheckCircle2,
  LucideClock,
  LucideEdit,
  LucideLock,
  LucidePower,
  LucideTrash2,
  LucideUser,
} from '@lucide/angular';
import { StaffGroup, StaffMember, UserProfile, UserActivity } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

type GroupFilter = 'Todos' | StaffGroup;

/**
 * Users module (staff directory): role filters, personal list, detail form,
 * advanced account configuration and the activity feed.
 *
 * NEW component built from the module mockup — the original React app had no
 * user-list screen. The personal profile editor that used to live here was
 * moved to `features/profile/profile` (`/profile`).
 */
@Component({
  selector: 'app-users-view',
  imports: [
    FormsModule,
    LucideEdit,
    LucideCamera,
    LucideLock,
    LucidePower,
    LucideClock,
    LucideTrash2,
    LucideCheckCircle2,
    LucideUser,
  ],
  templateUrl: './users-view.html',
})
export class UsersView {
  protected readonly store = inject(AppStore);

  protected readonly filters: GroupFilter[] = [
    'Todos',
    'Administrativos',
    'Gerenciales',
    'Auxiliares',
  ];
  protected readonly activeFilter = signal<GroupFilter>('Todos');

  /** The mockup opens with `Santiago03` selected. */
  protected readonly selectedId = signal(
    this.store.staff().find((m) => m.username === 'Santiago03')?.idNumber ??
      this.store.staff()[0].idNumber,
  );

  protected readonly isEditing = signal(false);
  protected readonly isSaved = signal(false);

  protected readonly visibleStaff = computed(() => {
    const list = this.store.staff();
    const filter = this.activeFilter();
    return filter === 'Todos' ? list : list.filter((m) => m.group === filter);
  });

  /** Falls back to the first visible member when the selected one is filtered out. */
  protected readonly selected = computed<StaffMember>(() => {
    const list = this.visibleStaff();
    return list.find((m) => m.idNumber === this.selectedId()) ?? list[0];
  });

  protected readonly draft = signal<StaffMember>({ ...this.selected() });

  protected readonly statusStyles: Record<UserProfile['status'], { label: string; cls: string }> = {
    ACTIVE: {
      label: 'Activo',
      cls: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    },
    LOCKED: {
      label: 'Bloqueado',
      cls: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    },
    SUSPENDED: {
      label: 'Suspendido',
      cls: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    },
  };

  protected setFilter(filter: GroupFilter): void {
    this.activeFilter.set(filter);
    this.syncDraft();
  }

  protected selectMember(idNumber: string): void {
    this.selectedId.set(idNumber);
    this.isEditing.set(false);
    this.syncDraft();
  }

  protected startEdit(): void {
    this.isEditing.set(true);
    this.isSaved.set(false);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
    this.syncDraft();
  }

  protected updateDraft(patch: Partial<StaffMember>): void {
    this.draft.update((prev) => ({ ...prev, ...patch }));
  }

  protected save(): void {
    const member = this.selected();
    const draft = this.draft();
    this.store.updateStaff(member.idNumber, {
      username: draft.username,
      fullName: draft.fullName,
      dateOfBirth: draft.dateOfBirth,
      age: draft.age,
      phone: draft.phone,
      email: draft.email,
      role: draft.role,
      positionName: draft.positionName,
    });
    this.isEditing.set(false);
    this.isSaved.set(true);
    setTimeout(() => this.isSaved.set(false), 3000);
  }

  protected toggleLock(): void {
    const status = this.selected().status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    this.store.updateStaff(this.selected().idNumber, { status });
    this.syncDraft();
  }

  protected toggleSuspend(): void {
    const status = this.selected().status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    this.store.updateStaff(this.selected().idNumber, { status });
    this.syncDraft();
  }

  protected disableAccount(): void {
    this.notify(`Cuenta de ${this.selected().username} desactivada`);
  }

  protected clearHistory(): void {
    this.store.clearStaffActivity(this.selected().idNumber);
    this.syncDraft();
  }

  protected viewActivity(activity: UserActivity): void {
    this.notify(`${activity.description} — Fecha: ${activity.date} • Hora: ${activity.time}`);
  }

  /** Mirrors the `alert(...)` calls allowed for this module by §10.2 of the design system. */
  protected notify(message: string): void {
    window.alert(message);
  }

  private syncDraft(): void {
    this.draft.set({ ...this.selected() });
    this.isSaved.set(false);
  }
}
