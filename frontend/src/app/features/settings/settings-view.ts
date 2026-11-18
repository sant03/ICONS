import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCheck, LucideSave } from '@lucide/angular';
import { AppStore } from '../../core/state/app-store';

@Component({
  selector: 'app-settings-view',
  imports: [FormsModule],
  templateUrl: './settings-view.html',
})
export class SettingsView {
  protected readonly store = inject(AppStore);

  protected readonly minStockAlert = signal(10);
  protected readonly enableEmailAlerts = signal(true);
  protected readonly currency = signal('COP ($)');
  protected readonly companyName = signal('PlastyFreddy');
  protected readonly saved = signal(false);

  protected handleSave(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
