import { Component, computed, inject, signal } from '@angular/core';
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
import { DeliveryDriver, DispatchRecord, DispatchStatus } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

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
export class DispatchesView {
  protected readonly store = inject(AppStore);

  protected readonly activeRoleView = signal<RoleView>('dispatcher');
  protected readonly selectedDriverId = signal<string>('drv-1');

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<StatusFilter>('ALL');

  protected readonly assignModalDispatch = signal<DispatchRecord | null>(null);
  protected readonly assignMode = signal<'assign' | 'reassign'>('assign');
  protected readonly targetDriverId = signal('');
  protected readonly targetPriority = signal<'NORMAL' | 'URGENTE'>('NORMAL');
  protected readonly assignNote = signal('');

  protected readonly rejectModalDispatch = signal<DispatchRecord | null>(null);
  protected readonly rejectionReason = signal('');

  protected readonly detailDispatch = signal<DispatchRecord | null>(null);
  protected readonly isNewDispatchModalOpen = signal(false);

  protected readonly newOrderNumber = signal('');
  protected readonly newClient = signal('');
  protected readonly newAddress = signal('');
  protected readonly newPhone = signal('');
  protected readonly newZone = signal('Zona Norte');
  protected readonly newUnits = signal(5);
  protected readonly newDriverId = signal('');
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

  protected readonly currentDriver = computed(() =>
    this.store.deliveryDrivers().find((d) => d.id === this.selectedDriverId()) ?? this.store.deliveryDrivers()[0],
  );

  protected readonly totalCount = computed(() => this.store.dispatches().length);

  protected readonly attentionCount = computed(() =>
    this.store.dispatches().filter((d) => d.status === 'POR_ASIGNAR' || d.status === 'RECHAZADO').length,
  );

  protected readonly inProgressCount = computed(() =>
    this.store.dispatches().filter((d) => d.status === 'ASIGNADO' || d.status === 'EN_CAMINO').length,
  );

  protected readonly deliveredCount = computed(() =>
    this.store.dispatches().filter((d) => d.status === 'ENTREGADO').length,
  );

  protected readonly filteredDispatches = computed(() => {
    const filter = this.statusFilter();
    const q = this.searchTerm().toLowerCase();
    return this.store.dispatches().filter((d) => {
      if (filter !== 'ALL' && d.status !== filter) return false;
      const driver = this.getDriverById(d.assignedDriverId);
      return (
        d.dispatchCode.toLowerCase().includes(q) ||
        d.orderNumber.toLowerCase().includes(q) ||
        d.client.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        (driver && driver.name.toLowerCase().includes(q))
      );
    });
  });

  protected readonly driverActiveDispatches = computed(() =>
    this.store.dispatches().filter(
      (d) => d.assignedDriverId === this.currentDriver()?.id && (d.status === 'ASIGNADO' || d.status === 'EN_CAMINO'),
    ),
  );

  protected readonly driverCompletedDispatches = computed(() =>
    this.store.dispatches().filter(
      (d) => d.assignedDriverId === this.currentDriver()?.id && d.status === 'ENTREGADO',
    ),
  );

  protected getDriverById(id: string | null): DeliveryDriver | null {
    if (!id) return null;
    return this.store.deliveryDrivers().find((d) => d.id === id) ?? null;
  }

  protected getStatusConfig(status: DispatchStatus): StatusConfig {
    return STATUS_CONFIG[status];
  }

  protected getDriverActiveLoad(driverId: string): number {
    return this.store.dispatches().filter(
      (d) => d.assignedDriverId === driverId && (d.status === 'ASIGNADO' || d.status === 'EN_CAMINO'),
    ).length;
  }

  protected openAssignModal(dispatch: DispatchRecord, mode: 'assign' | 'reassign'): void {
    this.assignModalDispatch.set(dispatch);
    this.assignMode.set(mode);
    const available = this.store.deliveryDrivers().find((d) => d.id !== dispatch.assignedDriverId);
    this.targetDriverId.set(available?.id ?? this.store.deliveryDrivers()[0]?.id ?? '');
    this.targetPriority.set(dispatch.priority);
    this.assignNote.set('');
  }

  protected handleConfirmAssign(): void {
    const dispatch = this.assignModalDispatch();
    const driverId = this.targetDriverId();
    if (!dispatch || !driverId) return;

    if (this.assignMode() === 'reassign') {
      const fromName =
        this.activeRoleView() === 'delivery'
          ? this.currentDriver()?.name ?? 'Domiciliario'
          : this.getDriverById(dispatch.assignedDriverId)?.name ?? 'Despachador';
      this.store.reassignDispatch(dispatch.id, fromName, driverId, this.assignNote() || undefined);
    } else {
      this.store.assignDriver(dispatch.id, driverId, this.targetPriority(), this.assignNote() || undefined, 'Freddy60');
    }
    this.assignModalDispatch.set(null);
  }

  protected openRejectModal(dispatch: DispatchRecord): void {
    this.rejectModalDispatch.set(dispatch);
    this.rejectionReason.set('');
  }

  protected handleConfirmReject(): void {
    const dispatch = this.rejectModalDispatch();
    if (!dispatch || !this.rejectionReason().trim()) return;
    const driverName =
      this.currentDriver()?.name ??
      this.getDriverById(dispatch.assignedDriverId)?.name ??
      'Domiciliario';
    this.store.rejectDispatch(dispatch.id, driverName, this.rejectionReason().trim());
    this.rejectModalDispatch.set(null);
  }

  protected handlePrefillFromOrder(orderId: string): void {
    const ord = this.store.orders().find((o) => o.id === orderId);
    if (!ord) return;
    this.newOrderNumber.set(ord.orderNumber);
    this.newClient.set(ord.client);
    this.newUnits.set(ord.units);
  }

  protected handleCreateNewDispatch(): void {
    if (!this.newClient().trim() || !this.newAddress().trim()) return;
    const assignedDrv = this.store.deliveryDrivers().find((d) => d.id === this.newDriverId()) ?? null;
    const now = new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const record: DispatchRecord = {
      id: `dsp-${Date.now()}`,
      dispatchCode: `#DSP-${100 + this.store.dispatches().length + 1}`,
      orderId: `ord-${Date.now()}`,
      orderNumber: this.newOrderNumber().trim() || `Pedido ${this.store.orders().length + 1}`,
      client: this.newClient().trim(),
      address: this.newAddress().trim(),
      phone: this.newPhone().trim() || '300 000 0000',
      zone: this.newZone(),
      units: this.newUnits(),
      totalAmount: this.newUnits() * 400,
      assignedDriverId: assignedDrv ? assignedDrv.id : null,
      status: assignedDrv ? 'ASIGNADO' : 'POR_ASIGNAR',
      priority: this.newPriority(),
      scheduledDate: new Date().toLocaleDateString('es-ES'),
      assignedAt: assignedDrv ? now : undefined,
      history: [
        {
          timestamp: now,
          event: assignedDrv
            ? `Despacho creado y asignado a ${assignedDrv.name}`
            : 'Despacho creado (Pendiente de asignación)',
          actor: 'Freddy60',
        },
      ],
    };
    this.store.addDispatch(record);
    this.isNewDispatchModalOpen.set(false);
    this.newOrderNumber.set('');
    this.newClient.set('');
    this.newAddress.set('');
    this.newPhone.set('');
    this.newDriverId.set('');
  }

  protected switchToDriverView(driverId: string): void {
    this.selectedDriverId.set(driverId);
    this.activeRoleView.set('delivery');
  }

  protected getAssignableDrivers(): DeliveryDriver[] {
    const dispatch = this.assignModalDispatch();
    if (this.assignMode() === 'reassign' && dispatch) {
      return this.store.deliveryDrivers().filter((d) => d.id !== dispatch.assignedDriverId);
    }
    return this.store.deliveryDrivers();
  }
}
