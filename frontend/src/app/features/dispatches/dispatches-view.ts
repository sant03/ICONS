import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertTriangle,
  LucideArrowRightLeft,
  LucideBike,
  LucideCheck,
  LucideCheckCircle2,
  LucideHistory,
  LucideMapPin,
  LucideNavigation,
  LucidePackage,
  LucidePhone,
  LucidePlus,
  LucideRefreshCw,
  LucideSearch,
  LucideShieldAlert,
  LucideTruck,
  LucideUser,
  LucideUserCheck,
  LucideX,
  LucideXCircle,
} from '@lucide/angular';
import { DispatchStatus } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import { DispatchesApi, DispatchResponse } from '../../core/api/dispatches.api';
import { DriversApi, DeliveryDriverResponse } from '../../core/api/drivers.api';
import { OrdersApi, CustomerOrderResponse, CustomersApi, CustomerResponse, UsersApi, UserResponse } from '../../core/api';

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIG: Record<DispatchStatus, StatusConfig> = {
  POR_ASIGNAR: {
    label: 'Por Asignar',
    badgeClass: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    dotClass: 'bg-amber-500',
  },
  ASIGNADO: {
    label: 'Asignado',
    badgeClass: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    dotClass: 'bg-indigo-500',
  },
  EN_CAMINO: {
    label: 'En Camino',
    badgeClass: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    dotClass: 'bg-cyan-500 animate-pulse',
  },
  ENTREGADO: {
    label: 'Entregado',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  RECHAZADO: {
    label: 'Rechazado',
    badgeClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
};

const QUICK_REJECTION_REASONS = [
  'Sobrecupo de carga en el vehículo',
  'Dirección fuera de zona de cobertura',
  'Vehículo con falla mecánica',
  'Cliente no responde / local cerrado',
  'Horario incompatible con ruta actual',
];

type StatusFilter = 'ALL' | DispatchStatus;
type RoleView = 'dispatcher' | 'delivery';

@Component({
  selector: 'app-dispatches-view',
  imports: [
    FormsModule,
    CustomSelectComponent,
    LucideAlertTriangle,
    LucideArrowRightLeft,
    LucideBike,
    LucideCheck,
    LucideCheckCircle2,
    LucideHistory,
    LucideMapPin,
    LucideNavigation,
    LucidePackage,
    LucidePhone,
    LucidePlus,
    LucideRefreshCw,
    LucideSearch,
    LucideShieldAlert,
    LucideTruck,
    LucideUser,
    LucideUserCheck,
    LucideX,
    LucideXCircle,
  ],
  templateUrl: './dispatches-view.html',
})
export class DispatchesView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly dispatchesApi = inject(DispatchesApi);
  private readonly driversApi = inject(DriversApi);
  private readonly ordersApi = inject(OrdersApi);
  private readonly customersApi = inject(CustomersApi);
  private readonly usersApi = inject(UsersApi);

  protected readonly dispatches = signal<DispatchResponse[]>([]);
  protected readonly drivers = signal<DeliveryDriverResponse[]>([]);
  protected readonly availableOrders = signal<CustomerOrderResponse[]>([]);
  protected readonly customers = signal<CustomerResponse[]>([]);
  protected readonly deliveryUsers = signal<UserResponse[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly activeRoleView = signal<RoleView>('dispatcher');
  protected readonly selectedDriverId = signal<number>(0);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<StatusFilter>('ALL');
  protected readonly driverSearchTerm = signal('');

  protected readonly assignModalDispatch = signal<DispatchResponse | null>(null);
  protected readonly assignModalAnimatingOut = signal(false);
  protected readonly assignMode = signal<'assign' | 'reassign'>('assign');
  protected readonly targetUserId = signal<number>(0);
  protected readonly targetPriority = signal<'NORMAL' | 'URGENTE'>('NORMAL');
  protected readonly assignNote = signal('');
  protected readonly isAssigning = signal(false);

  protected readonly rejectModalDispatch = signal<DispatchResponse | null>(null);
  protected readonly rejectModalAnimatingOut = signal(false);
  protected readonly rejectionReason = signal('');

  protected readonly detailDispatch = signal<DispatchResponse | null>(null);
  protected readonly detailModalAnimatingOut = signal(false);
  protected readonly isNewDispatchModalOpen = signal(false);
  protected readonly newDispatchModalAnimatingOut = signal(false);
  protected readonly isCreatingDispatch = signal(false);

  protected readonly newOrderId = signal<number | null>(null);
  protected readonly newOrderNumber = signal('');
  protected readonly newClient = signal('');
  protected readonly newAddress = signal('');
  protected readonly newPhone = signal('');
  protected readonly newZone = signal('Zona Norte');
  protected readonly newUnits = signal(5);
  protected readonly newTotalAmount = signal(0);
  protected readonly newDriverId = signal<number | null>(null);
  protected readonly newPriority = signal<'NORMAL' | 'URGENTE'>('NORMAL');

  protected readonly QUICK_REJECTION_REASONS = QUICK_REJECTION_REASONS;

  protected readonly statusFilterTabs: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'POR_ASIGNAR', label: 'Por Asignar' },
    { id: 'RECHAZADO', label: 'Rechazados' },
    { id: 'ASIGNADO', label: 'Asignados' },
    { id: 'EN_CAMINO', label: 'En Camino' },
    { id: 'ENTREGADO', label: 'Entregados' },
  ];

  protected readonly zoneOptions = ['Zona Norte', 'Zona Centro', 'Zona Sur / Mayorista', 'Zona Occidente'];

  protected readonly priorityOptions: { value: 'NORMAL' | 'URGENTE'; label: string }[] = [
    { value: 'NORMAL', label: 'NORMAL' },
    { value: 'URGENTE', label: 'URGENTE' },
  ];

  protected readonly driverSelectOptions = computed(() =>
    this.drivers().map((d) => ({
      value: d.id,
      label: `${d.name} — ${d.vehicle}`,
    })),
  );

  protected readonly orderSelectOptions = computed(() => {
    const dispatchedOrderIds = new Set(
      this.dispatches().map((d) => d.orderId).filter((id): id is number => id != null),
    );
    return this.availableOrders()
      .filter((o) => !dispatchedOrderIds.has(o.id))
      .map((o) => ({
        value: o.id,
        label: `${o.code} — ${o.customerName} (${o.totalUnits} uds)`,
      }));
  });

  protected readonly newDriverOptions = computed(() => [
    { value: 0, label: 'Dejar Por Asignar' },
    ...this.drivers().map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ]);

  protected readonly currentDriver = computed(() =>
    this.drivers().find((d) => d.id === this.selectedDriverId()) ?? this.drivers()[0],
  );

  protected readonly filteredDrivers = computed(() => {
    const q = this.driverSearchTerm().toLowerCase().trim();
    if (!q) return this.drivers();
    return this.drivers().filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.vehicle.toLowerCase().includes(q) ||
      d.zone.toLowerCase().includes(q) ||
      (d.plate ?? '').toLowerCase().includes(q)
    );
  });

  protected readonly filteredDeliveryUsers = computed(() => {
    const q = this.driverSearchTerm().toLowerCase().trim();
    const users = this.deliveryUsers();
    const filtered = !q
      ? users
      : users.filter((u) =>
          (u.fullName ?? '').toLowerCase().includes(q) ||
          (u.username ?? '').toLowerCase().includes(q) ||
          (u.phone ?? '').toLowerCase().includes(q) ||
          (u.positionName ?? '').toLowerCase().includes(q),
        );
    return filtered.map((u) => ({
      id: u.id,
      name: u.fullName || u.username,
      phone: u.phone || '—',
      vehicle: u.positionName || 'Domiciliario',
      zone: '—',
      status: u.status === 'ACTIVE' ? 'DISPONIBLE' : 'INACTIVO',
      avatarInitials: this.getInitials(u.fullName || u.username),
    }));
  });

  protected clearDriverSearch(): void {
    this.driverSearchTerm.set('');
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
  }

  protected readonly totalCount = computed(() => this.dispatches().length);

  protected readonly attentionCount = computed(() =>
    this.dispatches().filter((d) => d.status === 'POR_ASIGNAR' || d.status === 'RECHAZADO').length,
  );

  protected readonly inProgressCount = computed(() =>
    this.dispatches().filter((d) => d.status === 'ASIGNADO' || d.status === 'EN_CAMINO').length,
  );

  protected readonly deliveredCount = computed(() =>
    this.dispatches().filter((d) => d.status === 'ENTREGADO').length,
  );

  protected readonly filteredDispatches = computed(() => {
    const filter = this.statusFilter();
    const q = this.searchTerm().toLowerCase();
    return this.dispatches().filter((d) => {
      if (filter !== 'ALL' && d.status !== filter) return false;
      return (
        d.code.toLowerCase().includes(q) ||
        (d.orderNumber ?? '').toLowerCase().includes(q) ||
        d.client.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        (d.driverName ?? '').toLowerCase().includes(q)
      );
    });
  });

  protected readonly driverActiveDispatches = computed(() =>
    this.dispatches().filter(
      (d) => d.driverId === this.currentDriver()?.id && (d.status === 'ASIGNADO' || d.status === 'EN_CAMINO'),
    ),
  );

  protected readonly driverCompletedDispatches = computed(() =>
    this.dispatches().filter(
      (d) => d.driverId === this.currentDriver()?.id && d.status === 'ENTREGADO',
    ),
  );

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.driversApi.list({ size: 200 }).subscribe({
      next: (page) => {
        this.drivers.set(page.content);
        if (page.content.length && !this.selectedDriverId()) {
          this.selectedDriverId.set(page.content[0].id);
        }
      },
    });
    this.dispatchesApi.list({ size: 200 }).subscribe({
      next: (page) => {
        this.dispatches.set(page.content);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.loadAvailableOrders();
    this.loadCustomers();
    this.loadDeliveryUsers();
  }

  private loadAvailableOrders(): void {
    this.ordersApi.list({ size: 200 }).subscribe({
      next: (page) => this.availableOrders.set(page.content),
      error: () => this.availableOrders.set([]),
    });
  }

  private loadCustomers(): void {
    this.customersApi.list({ size: 500 }).subscribe({
      next: (page) => this.customers.set(page.content),
      error: () => this.customers.set([]),
    });
  }

  private loadDeliveryUsers(): void {
    this.usersApi.list({ size: 500 }).subscribe({
      next: (page) => {
        const delivery = page.content.filter(
          (u) => (u.roleName ?? '').toLowerCase() === 'delivery' && u.status !== 'DEACTIVATED',
        );
        this.deliveryUsers.set(delivery);
      },
      error: () => this.deliveryUsers.set([]),
    });
  }

  protected getDriverById(id: number | null): DeliveryDriverResponse | null {
    if (!id) return null;
    return this.drivers().find((d) => d.id === id) ?? null;
  }

  protected getStatusConfig(status: string): StatusConfig {
    return STATUS_CONFIG[status as DispatchStatus] ?? STATUS_CONFIG.POR_ASIGNAR;
  }

  protected getDriverActiveLoad(driverId: number): number {
    return this.dispatches().filter(
      (d) => d.driverId === driverId && (d.status === 'ASIGNADO' || d.status === 'EN_CAMINO'),
    ).length;
  }

  protected getDriverActiveLoadByName(name: string): number {
    const normalized = name.trim().toLowerCase();
    return this.dispatches().filter(
      (d) => (d.driverName ?? '').trim().toLowerCase() === normalized && (d.status === 'ASIGNADO' || d.status === 'EN_CAMINO'),
    ).length;
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'D';
  }

  protected getStatusCount(status: StatusFilter): number {
    if (status === 'ALL') return this.dispatches().length;
    return this.dispatches().filter((d) => d.status === status).length;
  }

  protected openAssignModal(dispatch: DispatchResponse, mode: 'assign' | 'reassign'): void {
    this.assignModalAnimatingOut.set(false);
    this.assignModalDispatch.set(dispatch);
    this.assignMode.set(mode);
    const available = this.getAssignableDrivers();
    this.targetUserId.set(available[0]?.id ?? 0);
    this.targetPriority.set(dispatch.priority as 'NORMAL' | 'URGENTE');
    this.assignNote.set('');
    this.isAssigning.set(false);
  }

  protected closeAssignModal(): void {
    this.assignModalAnimatingOut.set(true);
    setTimeout(() => {
      this.assignModalDispatch.set(null);
      this.assignModalAnimatingOut.set(false);
    }, 220);
  }

  protected handleConfirmAssign(): void {
    if (this.isAssigning()) return;
    const dispatch = this.assignModalDispatch();
    const userId = this.targetUserId();
    if (!dispatch || !userId) {
      this.showToast('Selecciona un domiciliario', 'error');
      return;
    }

    this.isAssigning.set(true);
    this.dispatchesApi.assignDriver(dispatch.id, { userId }).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.closeAssignModal();
        this.showToast('Domiciliario asignado correctamente', 'success');
        this.loadData();
      },
      error: (err) => {
        this.isAssigning.set(false);
        this.showToast(err?.error?.detail ?? 'Error al asignar domiciliario', 'error');
      },
    });
  }

  protected openRejectModal(dispatch: DispatchResponse): void {
    this.rejectModalAnimatingOut.set(false);
    this.rejectModalDispatch.set(dispatch);
    this.rejectionReason.set('');
  }

  protected closeRejectModal(): void {
    this.rejectModalAnimatingOut.set(true);
    setTimeout(() => {
      this.rejectModalDispatch.set(null);
      this.rejectModalAnimatingOut.set(false);
    }, 220);
  }

  protected handleConfirmReject(): void {
    const dispatch = this.rejectModalDispatch();
    if (!dispatch || !this.rejectionReason().trim()) return;

    this.dispatchesApi.updateStatus(dispatch.id, 'RECHAZADO', this.rejectionReason().trim()).subscribe({
      next: () => {
        this.closeRejectModal();
        this.loadData();
      },
    });
  }

  protected openDetailModal(dispatch: DispatchResponse): void {
    this.detailModalAnimatingOut.set(false);
    this.dispatchesApi.getById(dispatch.id).subscribe({
      next: (full) => this.detailDispatch.set(full),
    });
  }

  protected closeDetailModal(): void {
    this.detailModalAnimatingOut.set(true);
    setTimeout(() => {
      this.detailDispatch.set(null);
      this.detailModalAnimatingOut.set(false);
    }, 220);
  }

  protected openNewDispatchModal(): void {
    this.newDispatchModalAnimatingOut.set(false);
    this.resetNewDispatchForm();
    this.loadAvailableOrders();
    this.isNewDispatchModalOpen.set(true);
  }

  protected closeNewDispatchModal(): void {
    this.newDispatchModalAnimatingOut.set(true);
    setTimeout(() => {
      this.isNewDispatchModalOpen.set(false);
      this.newDispatchModalAnimatingOut.set(false);
      this.resetNewDispatchForm();
    }, 220);
  }

  private resetNewDispatchForm(): void {
    this.newOrderId.set(null);
    this.newOrderNumber.set('');
    this.newClient.set('');
    this.newAddress.set('');
    this.newPhone.set('');
    this.newZone.set('Zona Norte');
    this.newUnits.set(5);
    this.newTotalAmount.set(0);
    this.newDriverId.set(null);
    this.newPriority.set('NORMAL');
    this.isCreatingDispatch.set(false);
  }

  protected handlePrefillFromOrder(orderId: unknown): void {
    const id = Number(orderId);
    const ord = this.availableOrders().find((o) => o.id === id);
    if (!ord) return;
    this.newOrderId.set(ord.id);
    this.newOrderNumber.set(ord.code);
    this.newClient.set(ord.customerName);
    this.newUnits.set(ord.totalUnits || 1);
    this.newTotalAmount.set(ord.totalAmount ?? 0);

    const customer = ord.customerId ? this.customers().find((c) => c.id === ord.customerId) : undefined;
    this.newAddress.set(customer?.address?.trim() || '');
    this.newPhone.set(customer?.phone?.trim() || '');
  }

  protected handleCreateNewDispatch(): void {
    if (this.isCreatingDispatch()) return;
    if (!this.newClient().trim()) {
      this.showToast('El cliente es obligatorio', 'error');
      return;
    }
    if (!this.newAddress().trim()) {
      this.showToast('La dirección de entrega es obligatoria', 'error');
      return;
    }

    this.isCreatingDispatch.set(true);
    this.dispatchesApi.create({
      orderId: this.newOrderId() ?? undefined,
      orderNumber: this.newOrderNumber().trim() || undefined,
      client: this.newClient().trim(),
      address: this.newAddress().trim(),
      phone: this.newPhone().trim() || undefined,
      zone: this.newZone(),
      units: this.newUnits(),
      totalAmount: this.newTotalAmount() || undefined,
      driverId: this.newDriverId() || undefined,
      priority: this.newPriority(),
      scheduledDate: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: () => {
        this.isCreatingDispatch.set(false);
        this.closeNewDispatchModal();
        this.showToast('Despacho creado exitosamente', 'success');
        this.loadData();
      },
      error: (err) => {
        this.isCreatingDispatch.set(false);
        this.showToast(err?.error?.detail ?? 'Error al crear el despacho', 'error');
      },
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastOpen.set(true);
    this.toastTimer = setTimeout(() => this.toastOpen.set(false), 4000);
  }

  protected closeToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastOpen.set(false);
  }

  protected handleUpdateStatus(dispatchId: number, status: string): void {
    this.dispatchesApi.updateStatus(dispatchId, status).subscribe({
      next: () => this.loadData(),
    });
  }

  protected switchToDriverView(driverId: number): void {
    this.selectedDriverId.set(driverId);
    this.activeRoleView.set('delivery');
  }

  protected switchToDriverViewByName(name: string): void {
    const normalized = name.trim().toLowerCase();
    const driver = this.drivers().find((d) => d.name.trim().toLowerCase() === normalized);
    if (driver) {
      this.switchToDriverView(driver.id);
    }
  }

  protected getAssignableDrivers() {
    const dispatch = this.assignModalDispatch();
    const currentName = (dispatch?.driverName ?? '').trim().toLowerCase();
    return this.deliveryUsers()
      .filter((u) => {
        if (this.assignMode() === 'reassign' && currentName) {
          const name = (u.fullName || u.username).trim().toLowerCase();
          return name !== currentName;
        }
        return true;
      })
      .map((u) => ({
        id: u.id,
        name: u.fullName || u.username,
        vehicle: u.positionName || 'Domiciliario',
        zone: u.phone || '—',
        status: u.status === 'ACTIVE' ? 'DISPONIBLE' : 'INACTIVO',
      }));
  }
}
