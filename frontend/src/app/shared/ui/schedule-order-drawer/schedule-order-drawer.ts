import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideBell,
  LucideCalendar,
  LucideCheckCircle2,
  LucideClock,
  LucidePackage,
  LucidePause,
  LucidePlay,
  LucideShieldCheck,
  LucideSparkles,
  LucideTrash2,
  LucideX,
  LucideZap,
} from '@lucide/angular';
import { RecurrenceFrequency, ScheduledOrderRule, TriggerMode } from '../../../core/models/types';
import { AppStore } from '../../../core/state/app-store';

const WEEK_DAYS = [
  { id: 'L', label: 'L' },
  { id: 'M', label: 'M' },
  { id: 'X', label: 'X' },
  { id: 'J', label: 'J' },
  { id: 'V', label: 'V' },
  { id: 'S', label: 'S' },
  { id: 'D', label: 'D' },
];

@Component({
  selector: 'app-schedule-order-drawer',
  imports: [
    FormsModule,
    LucideBell,
    LucideCalendar,
    LucideCheckCircle2,
    LucideClock,
    LucidePackage,
    LucidePause,
    LucidePlay,
    LucideShieldCheck,
    LucideSparkles,
    LucideTrash2,
    LucideX,
    LucideZap,
  ],
  templateUrl: './schedule-order-drawer.html',
})
export class ScheduleOrderDrawer {
  protected readonly store = inject(AppStore);

  constructor() {
    effect(() => {
      if (this.store.isScheduleDrawerOpen()) {
        untracked(() => this.syncFromContext());
      }
    });
  }

  protected readonly WEEK_DAYS = WEEK_DAYS;

  protected readonly ruleName = signal('');
  protected readonly selectedSupplier = signal('');
  protected readonly triggerMode = signal<TriggerMode>('schedule');
  protected readonly frequency = signal<RecurrenceFrequency>('weekly');
  protected readonly startDate = signal(new Date().toISOString().split('T')[0]);
  protected readonly executionTime = signal('08:00');
  protected readonly weekDays = signal<string[]>(['L', 'J']);
  protected readonly minStockThreshold = signal(10);
  protected readonly autoApprove = signal(true);
  protected readonly maxBudget = signal(50000);
  protected readonly notifyEmail = signal(true);
  protected readonly justSaved = signal(false);

  protected readonly supplierOptions = [
    'Global Logistics S.A.',
    'Plásticos del Norte Ltda',
    'Empaques Especiales',
    'Plastidias',
  ];

  protected readonly ctx = computed(() => this.store.scheduleDrawerContext());

  protected readonly frequencyLabel = computed(() => {
    const labels: Record<RecurrenceFrequency, string> = {
      once: 'una única vez',
      daily: 'todos los días',
      weekly: `semanalmente (${this.weekDays().join(', ')})`,
      biweekly: 'cada 15 días',
      monthly: 'mensualmente',
    };
    return labels[this.frequency()];
  });

  private lastCtxId = '';

  protected readonly isOpen = computed(() => this.store.isScheduleDrawerOpen());

  protected syncFromContext(): void {
    const c = this.ctx();
    if (!c) return;
    const ctxId = `${c.supplier}-${c.orderNumber}-${c.estimatedTotal}`;
    if (ctxId !== this.lastCtxId) {
      this.lastCtxId = ctxId;
      this.ruleName.set(`Auto-Reposición ${c.orderNumber}`);
      this.selectedSupplier.set(c.supplier);
      this.maxBudget.set(Math.max(c.estimatedTotal * 2, 50000));
    }
  }

  protected toggleWeekDay(dayId: string): void {
    this.weekDays.update((prev) =>
      prev.includes(dayId)
        ? prev.length > 1 ? prev.filter((d) => d !== dayId) : prev
        : [...prev, dayId],
    );
  }

  protected handleSave(): void {
    const c = this.ctx();
    if (!c) return;

    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const rule: ScheduledOrderRule = {
      id: `sch-${Date.now()}`,
      name: this.ruleName().trim() || `Programación ${c.orderNumber}`,
      supplier: this.selectedSupplier(),
      triggerMode: this.triggerMode(),
      frequency: this.frequency(),
      startDate: this.startDate(),
      executionTime: this.executionTime(),
      weekDays: [...this.weekDays()],
      minStockThreshold: this.minStockThreshold(),
      autoApprove: this.autoApprove(),
      maxBudget: this.maxBudget(),
      notifyEmail: this.notifyEmail(),
      estimatedTotal: c.estimatedTotal,
      itemsCount: c.itemsCount,
      active: true,
      createdAt: now,
    };
    this.store.addScheduledRule(rule);
    this.justSaved.set(true);
    setTimeout(() => this.justSaved.set(false), 3500);
  }

  protected close(): void {
    this.store.closeScheduleDrawer();
  }
}
