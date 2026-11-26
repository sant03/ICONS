import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from '../../core/state/app-store';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { NewSaleModal } from '../../features/sales/new-sale-modal';
import { NotificationsSidebar } from '../notifications-sidebar/notifications-sidebar';
import { ToastNotifications } from '../../shared/ui/toast-notifications/toast-notifications';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Sidebar, NewSaleModal, NotificationsSidebar, ToastNotifications],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly store = inject(AppStore);
}
