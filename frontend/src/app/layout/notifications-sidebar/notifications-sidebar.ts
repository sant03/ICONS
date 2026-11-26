import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAlertTriangle,
  LucideBell,
  LucideCheckCheck,
  LucideCreditCard,
  LucideExternalLink,
  LucideRefreshCw,
  LucideShoppingBag,
  LucideTrash2,
  LucideUserX,
  LucideX,
} from '@lucide/angular';
import { NotificationItem, NotificationType } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { SwipeDismissDirective } from '../../shared/directives/swipe-dismiss.directive';

type FilterType = 'all' | 'unread';

@Component({
  selector: 'app-notifications-sidebar',
  standalone: true,
  imports: [
    LucideBell,
    LucideX,
    LucideCheckCheck,
    LucideAlertTriangle,
    LucideShoppingBag,
    LucideUserX,
    LucideCreditCard,
    LucideRefreshCw,
    LucideTrash2,
    LucideExternalLink,
    SwipeDismissDirective,
  ],
  templateUrl: './notifications-sidebar.html',
})
export class NotificationsSidebar {
  protected readonly store = inject(AppStore);
  private readonly router = inject(Router);
  protected readonly activeFilter = signal<FilterType>('all');
  protected readonly isLoading = signal(false);

  constructor() {
    effect(() => {
      if (this.store.notificationsOpen()) {
        this.fetchNotifications();
      }
    });
  }

  protected reload(): void {
    this.fetchNotifications();
  }

  private fetchNotifications(): void {
    this.isLoading.set(true);
    this.store.loadNotifications();
    setTimeout(() => this.isLoading.set(false), 400);
  }

  protected readonly filteredNotifications = computed(() => {
    const list = this.store.notifications();
    if (this.activeFilter() === 'unread') {
      return list.filter((n) => !n.read);
    }
    return list;
  });

  protected setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
  }

  protected handleNotificationClick(item: NotificationItem): void {
    this.store.markNotificationAsRead(item.id);
    if (item.link) {
      this.store.closeNotifications();
      void this.router.navigate([item.link]);
    }
  }

  protected deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.store.clearNotification(id);
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
