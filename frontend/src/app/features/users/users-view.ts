import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomDatePickerComponent } from '../../shared/ui/custom-datepicker/custom-datepicker';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import {
  LucideAlertCircle,
  LucideAlertTriangle,
  LucideCamera,
  LucideCheckCircle,
  LucideCheckCircle2,
  LucideClock,
  LucideEdit,
  LucidePower,
  LucideRotateCcw,
  LucideSearch,
  LucideShieldAlert,
  LucideTrash2,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { StaffGroup, StaffMember, UserProfile, UserActivity } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { AuthService } from '../../core/auth/auth.service';
import { UsersApi, UserResponse } from '../../core/api';

type GroupFilter = 'Todos' | StaffGroup;
type ActionPopup = 'restrict' | 'unrestrict' | 'suspend' | 'unsuspend' | 'deactivate' | null;

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
    CustomDatePickerComponent,
    ScrollRevealDirective,
    LucideAlertCircle,
    LucideAlertTriangle,
    LucideEdit,
    LucideCamera,
    LucidePower,
    LucideShieldAlert,
    LucideClock,
    LucideTrash2,
    LucideCheckCircle,
    LucideCheckCircle2,
    LucideRotateCcw,
    LucideSearch,
    LucideUser,
    LucideX,
  ],
  templateUrl: './users-view.html',
})
export class UsersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(UsersApi);
  private readonly auth = inject(AuthService);

  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly searchTerm = signal('');

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly hasBlockPermission = computed(() =>
    this.auth.currentUser()?.permissions?.includes('USERS_BLOCK') ?? false
  );
  protected readonly hasDeletePermission = computed(() =>
    this.auth.currentUser()?.permissions?.includes('USERS_DELETE') ?? false
  );
  protected readonly actionLoading = signal(false);

  protected readonly activePopup = signal<ActionPopup>(null);
  protected readonly popupAnimatingOut = signal(false);
  protected readonly selectedDuration = signal<string | null>(null);

  protected readonly suspendDurations = [
    { value: 'PT1H', label: '1 hora' },
    { value: 'PT24H', label: '24 horas' },
    { value: 'P7D', label: '7 días' },
    { value: 'P30D', label: '30 días' },
  ];

  protected readonly isMobileDrawerOpen = signal(false);
  protected readonly isMobileDrawerReady = signal(false);

  protected readonly filters: GroupFilter[] = [
    'Todos',
    'Administrativos',
    'Gerenciales',
    'Auxiliares',
  ];
  protected readonly activeFilter = signal<GroupFilter>('Todos');

  protected readonly selectedId = signal('');
  protected readonly isEditing = signal(false);
  protected readonly isSaved = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        const mapped = page.content.map((u) => UsersView.mapUser(u));
        this.staff.set(mapped);
        this.isLoading.set(false);
        if (mapped.length) {
          this.selectedId.set(mapped[0].idNumber);
          this.syncDraft();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.error?.detail || err?.message || 'Error al conectar con el servidor.');
      },
    });
  }

  private static mapUser(u: UserResponse): StaffMember {
    const roleGroup: StaffGroup =
      u.roleName === 'Gerencial' ? 'Gerenciales' :
      u.roleName === 'Administrativo' ? 'Administrativos' : 'Auxiliares';
    return {
      username: u.username,
      fullName: u.fullName,
      idNumber: String(u.id),
      memberSince: u.createdAt?.slice(0, 10) ?? '',
      dateOfBirth: u.dateOfBirth ?? '',
      age: u.dateOfBirth ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / 31557600000) : 0,
      phone: u.phone ?? '',
      landline: u.landline ?? '',
      email: u.email,
      role: u.roleName,
      positionName: u.positionName ?? '',
      avatarUrl: u.avatarUrl ?? '',
      status: (u.status as UserProfile['status']) ?? 'ACTIVE',
      suspendedUntil: u.suspendedUntil,
      group: roleGroup,
      activities: [],
    };
  }

  protected readonly visibleStaff = computed(() => {
    const list = this.staff();
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return list.filter((m) => {
      const matchesFilter = filter === 'Todos' || m.group === filter;
      if (!matchesFilter) return false;
      if (!term) return true;
      return (
        m.fullName.toLowerCase().includes(term) ||
        m.username.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.positionName && m.positionName.toLowerCase().includes(term)) ||
        (m.role && m.role.toLowerCase().includes(term)) ||
        (m.phone && m.phone.includes(term))
      );
    });
  });

  /** Falls back to the first visible member when the selected one is filtered out. */
  protected readonly selected = computed<StaffMember | null>(() => {
    const list = this.visibleStaff();
    return list.find((m) => m.idNumber === this.selectedId()) ?? list[0] ?? null;
  });

  /** Detail form and activity cards are hidden when loading, no matches, or error */
  protected readonly hasDetailVisible = computed(
    () => !this.isLoading() && !this.hasError() && this.visibleStaff().length > 0 && this.selected() !== null
  );

  protected readonly draft = signal<StaffMember>(UsersView.emptyMember());

  protected statusStyle(): { label: string; cls: string } {
    const s = this.selected();
    return s ? this.statusStyles[s.status] : { label: '', cls: '' };
  }

  protected readonly statusStyles: Record<UserProfile['status'], { label: string; cls: string }> = {
    ACTIVE: {
      label: 'Activo',
      cls: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    },
    LOCKED: {
      label: 'Bloqueado',
      cls: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    },
    RESTRICTED: {
      label: 'Restringido',
      cls: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    },
    SUSPENDED: {
      label: 'Suspendido',
      cls: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    },
    DEACTIVATED: {
      label: 'Desactivado',
      cls: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
    },
  };

  protected setFilter(filter: GroupFilter): void {
    this.activeFilter.set(filter);
    this.syncDraft();
  }

  protected resetFilters(): void {
    this.activeFilter.set('Todos');
    this.searchTerm.set('');
    this.syncDraft();
  }

  protected selectMember(idNumber: string): void {
    this.selectedId.set(idNumber);
    this.isEditing.set(false);
    this.syncDraft();
    this.isMobileDrawerReady.set(true);
    this.isMobileDrawerOpen.set(true);
  }

  protected closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
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
    if (!member) return;
    const draft = this.draft();
    const id = Number(member.idNumber);
    this.api.update(id, {
      fullName: draft.fullName,
      dateOfBirth: draft.dateOfBirth,
      phone: draft.phone,
      email: draft.email,
      positionName: draft.positionName,
    }).subscribe({
      next: (res) => {
        const mapped = UsersView.mapUser(res);
        this.staff.update((list) => list.map((m) => (m.idNumber === member.idNumber ? mapped : m)));
        this.showToast('Información de usuario actualizada correctamente', 'success');
      },
      error: (err) => {
        this.showToast(err?.error?.detail ?? 'Error al actualizar usuario', 'error');
      },
    });
    this.isEditing.set(false);
    this.isSaved.set(true);
    setTimeout(() => this.isSaved.set(false), 3000);
  }

  protected openPopup(type: ActionPopup): void {
    if (type === 'suspend') this.selectedDuration.set(null);
    this.popupAnimatingOut.set(false);
    this.activePopup.set(type);
  }

  protected closePopup(): void {
    this.popupAnimatingOut.set(true);
    setTimeout(() => {
      this.activePopup.set(null);
      this.popupAnimatingOut.set(false);
    }, 220);
  }

  protected onPopupBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closePopup();
  }

  protected confirmAction(): void {
    const popup = this.activePopup();
    this.closePopup();
    switch (popup) {
      case 'restrict': return this.executeRestrict();
      case 'unrestrict': return this.executeUnrestrict();
      case 'suspend': return this.executeSuspend();
      case 'unsuspend': return this.executeUnsuspend();
      case 'deactivate': return this.executeDeactivate();
    }
  }

  private executeRestrict(): void {
    const member = this.selected();
    if (!member) return;
    this.actionLoading.set(true);
    this.api.restrict(Number(member.idNumber)).subscribe({
      next: (res) => {
        this.updateMember(member.idNumber, res);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.notify(err?.error?.detail ?? 'Error al restringir usuario');
      },
    });
  }

  private executeUnrestrict(): void {
    const member = this.selected();
    if (!member) return;
    this.actionLoading.set(true);
    this.api.unrestrict(Number(member.idNumber)).subscribe({
      next: (res) => {
        this.updateMember(member.idNumber, res);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.notify(err?.error?.detail ?? 'Error al quitar restricción');
      },
    });
  }

  private executeSuspend(): void {
    const member = this.selected();
    const duration = this.selectedDuration();
    if (!member || !duration) return;
    this.actionLoading.set(true);
    this.api.suspend(Number(member.idNumber), duration).subscribe({
      next: (res) => {
        this.updateMember(member.idNumber, res);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.notify(err?.error?.detail ?? 'Error al suspender usuario');
      },
    });
  }

  private executeUnsuspend(): void {
    const member = this.selected();
    if (!member) return;
    this.actionLoading.set(true);
    this.api.unsuspend(Number(member.idNumber)).subscribe({
      next: (res) => {
        this.updateMember(member.idNumber, res);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.notify(err?.error?.detail ?? 'Error al reactivar usuario');
      },
    });
  }

  private executeDeactivate(): void {
    const member = this.selected();
    if (!member) return;
    this.actionLoading.set(true);
    this.api.deactivate(Number(member.idNumber)).subscribe({
      next: () => {
        this.staff.update((list) => list.filter((m) => m.idNumber !== member.idNumber));
        this.syncDraft();
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.notify(err?.error?.detail ?? 'Error al desactivar cuenta');
      },
    });
  }

  private updateMember(idNumber: string, res: UserResponse): void {
    const mapped = UsersView.mapUser(res);
    this.staff.update((list) => list.map((m) => (m.idNumber === idNumber ? mapped : m)));
    this.syncDraft();
  }

  protected formatSuspensionRemaining(): string {
    const until = this.selected()?.suspendedUntil;
    if (!until) return '';
    const remaining = new Date(until).getTime() - Date.now();
    if (remaining <= 0) return 'Expirada';
    const hours = Math.floor(remaining / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h restantes`;
    const mins = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${mins}m restantes`;
  }

  protected clearHistory(): void {
    const member = this.selected();
    if (!member) return;
    this.staff.update((list) =>
      list.map((m) => (m.idNumber === member.idNumber ? { ...m, activities: [] } : m)),
    );
    this.syncDraft();
  }

  protected viewActivity(activity: UserActivity): void {
    this.notify(`${activity.description} — Fecha: ${activity.date} • Hora: ${activity.time}`);
  }

  protected showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastOpen.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastOpen.set(false), 3500);
  }

  protected closeToast(): void {
    this.toastOpen.set(false);
  }

  protected notify(message: string): void {
    this.showToast(message, 'error');
  }

  private syncDraft(): void {
    const sel = this.selected();
    if (!sel) return;
    this.draft.set({ ...sel });
    this.isSaved.set(false);
  }

  private static emptyMember(): StaffMember {
    return {
      username: '', fullName: '', idNumber: '', memberSince: '', dateOfBirth: '',
      age: 0, phone: '', landline: '', email: '', role: '', positionName: '',
      avatarUrl: '', status: 'ACTIVE', suspendedUntil: null, group: 'Auxiliares', activities: [],
    };
  }
}
