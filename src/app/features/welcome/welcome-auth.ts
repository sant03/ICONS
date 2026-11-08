import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import { CustomDatePickerComponent } from '../../shared/ui/custom-datepicker/custom-datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBuilding,
  LucideCalendar,
  LucideCheckCircle2,
  LucideCreditCard,
  LucideEye,
  LucideEyeOff,
  LucideLayoutGrid,
  LucideLock,
  LucideLogIn,
  LucideMail,
  LucideMoon,
  LucidePhone,
  LucideShieldCheck,
  LucideSun,
  LucideUser,
  LucideUserPlus,
} from '@lucide/angular';
import { AppStore } from '../../core/state/app-store';

type AuthMode = 'welcome' | 'login' | 'register';

@Component({
  selector: 'app-welcome-auth',
  imports: [
    FormsModule,
    CustomSelectComponent,
    CustomDatePickerComponent,
    LucideLayoutGrid,
    LucideMoon,
    LucideSun,
    LucideLogIn,
    LucideUserPlus,
    LucideArrowRight,
    LucideArrowLeft,
    LucideUser,
    LucideLock,
    LucideEye,
    LucideEyeOff,
    LucideShieldCheck,
    LucideCalendar,
    LucidePhone,
    LucideMail,
    LucideBuilding,
    LucideCreditCard,
    LucideCheckCircle2,
  ],
  templateUrl: './welcome-auth.html',
})
export class WelcomeAuth {
  protected readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Replaces the `initialSubMode` prop of the original component (see app.routes.ts). */
  protected readonly mode = signal<AuthMode>(this.route.snapshot.data['mode'] ?? 'welcome');

  protected readonly showPassword = signal(false);
  protected readonly username = signal('Freddy60');
  protected readonly password = signal('••••••••');
  protected readonly agreeTerms = signal(true);
  protected readonly role = signal('Admin');
  protected readonly roleOptions = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Manager', label: 'Inventory Manager' },
    { value: 'Sales', label: 'Sales Assistant' },
  ];

  protected setMode(mode: AuthMode): void {
    this.mode.set(mode);
    void this.router.navigate([`/${mode}`], { replaceUrl: true });
  }

  protected onAuthenticate(): void {
    void this.router.navigate(['/dashboard']);
  }
}
