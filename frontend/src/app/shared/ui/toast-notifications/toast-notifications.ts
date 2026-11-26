import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAlertTriangle,
  LucideBell,
  LucideCreditCard,
  LucideShoppingBag,
  LucideUserX,
  LucideRefreshCw,
  LucideX,
} from '@lucide/angular';
import { NotificationType } from '../../../core/models/types';
import { ToastItem, ToastNotificationService } from '../../../core/services/toast-notification.service';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [
    LucideBell,
    LucideAlertTriangle,
    LucideShoppingBag,
    LucideUserX,
    LucideCreditCard,
    LucideRefreshCw,
    LucideX,
  ],
  styles: `
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(120%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes progressShrink {
      from { width: 100%; }
      to { width: 0%; }
    }

    .toast-enter {
      animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .toast-leave {
      opacity: 0;
      transform: translateX(120%);
      transition: all 0.35s cubic-bezier(0.4, 0, 1, 1);
    }

    .toast-progress {
      animation: progressShrink 6s linear forwards;
    }
  `,
  template: `
    <div class="fixed bottom-4 right-4 z-[70] flex flex-col-reverse gap-3 w-[380px] max-w-[calc(100vw-2rem)] pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="
            'pointer-events-auto relative overflow-hidden rounded-2xl border bg-[var(--bg-card)] shadow-2xl shadow-black/30 cursor-pointer group ' +
            (toast.leaving ? 'toast-leave' : 'toast-enter') +
            ' ' + getBorderClass(toast.type)
          "
          (click)="handleClick(toast)"
        >
          <div class="p-4 flex items-start gap-3">
            <!-- Type Icon -->
            <div
              [class]="
                'w-10 h-10 rounded-xl border shrink-0 flex items-center justify-center ' +
                getBadgeColor(toast.type).bg + ' ' +
                getBadgeColor(toast.type).text + ' ' +
                getBadgeColor(toast.type).border
              "
            >
              @switch (toast.type) {
                @case ('order') { <svg lucideShoppingBag class="w-4.5 h-4.5"></svg> }
                @case ('stock') { <svg lucideAlertTriangle class="w-4.5 h-4.5"></svg> }
                @case ('user') { <svg lucideUserX class="w-4.5 h-4.5"></svg> }
                @case ('payment') { <svg lucideCreditCard class="w-4.5 h-4.5"></svg> }
                @case ('system') { <svg lucideRefreshCw class="w-4.5 h-4.5"></svg> }
                @default { <svg lucideBell class="w-4.5 h-4.5"></svg> }
              }
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-6">
              <p class="text-sm font-bold text-[var(--text-primary)] truncate">{{ toast.title }}</p>
              <p class="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">{{ toast.description }}</p>
              <span class="text-[10px] text-[var(--text-muted)] font-mono mt-1.5 block">Ahora</span>
            </div>

            <!-- Close -->
            <button
              type="button"
              (click)="close($event, toast.id)"
              class="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Cerrar"
            >
              <svg lucideX class="w-3.5 h-3.5"></svg>
            </button>
          </div>

          <!-- Progress bar -->
          @if (!toast.leaving) {
            <div class="h-0.5 bg-[var(--border-color)]/30">
              <div
                [class]="'h-full toast-progress ' + getProgressColor(toast.type)"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ToastNotifications {
  protected readonly toastService = inject(ToastNotificationService);
  private readonly router = inject(Router);

  protected handleClick(toast: ToastItem): void {
    if (toast.link) {
      this.toastService.dismiss(toast.id);
      void this.router.navigate([toast.link]);
    }
  }

  protected close(event: Event, id: string): void {
    event.stopPropagation();
    this.toastService.dismiss(id);
  }

  protected getBorderClass(type: NotificationType): string {
    const map: Record<string, string> = {
      order: 'border-cyan-500/30',
      stock: 'border-amber-500/30',
      user: 'border-rose-500/30',
      payment: 'border-emerald-500/30',
      welcome: 'border-violet-500/30',
      reminder: 'border-orange-500/30',
      alert: 'border-red-500/30',
      message: 'border-blue-500/30',
      attendance: 'border-teal-500/30',
      system: 'border-sky-500/30',
    };
    return map[type] || map['system'];
  }

  protected getProgressColor(type: NotificationType): string {
    const map: Record<string, string> = {
      order: 'bg-cyan-500',
      stock: 'bg-amber-500',
      user: 'bg-rose-500',
      payment: 'bg-emerald-500',
      welcome: 'bg-violet-500',
      reminder: 'bg-orange-500',
      alert: 'bg-red-500',
      message: 'bg-blue-500',
      attendance: 'bg-teal-500',
      system: 'bg-sky-500',
    };
    return map[type] || map['system'];
  }

  protected getBadgeColor(type: NotificationType): { bg: string; text: string; border: string } {
    switch (type) {
      case 'order':
        return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' };
      case 'stock':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      case 'user':
        return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' };
      case 'payment':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
      case 'welcome':
        return { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' };
      case 'reminder':
        return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' };
      case 'alert':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      case 'message':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'attendance':
        return { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' };
      case 'system':
      default:
        return { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/20' };
    }
  }
}
