import { Component, computed, inject, signal } from '@angular/core';
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
import { NotificationItem, NotificationType, ViewMode } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

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
  ],
  templateUrl: './notifications-sidebar.html',
})
export class NotificationsSidebar {
  protected readonly store = inject(AppStore);
  protected readonly activeFilter = signal<FilterType>('all');

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
      this.store.navigate(item.link);
    }
  }

  protected deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.store.clearNotification(id);
  }

  protected getBadgeColor(type: NotificationType): { bg: string; text: string; border: string } {
    switch (type) {
      case 'order':
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-500',
          border: 'border-cyan-500/20',
        };
      case 'stock':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-500',
          border: 'border-amber-500/20',
        };
      case 'user':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-500',
          border: 'border-rose-500/20',
        };
      case 'payment':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          border: 'border-emerald-500/20',
        };
      case 'system':
      default:
        return {
          bg: 'bg-sky-500/10',
          text: 'text-sky-500',
          border: 'border-sky-500/20',
        };
    }
  }
}
