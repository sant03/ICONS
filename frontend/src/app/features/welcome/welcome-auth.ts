import { Component, inject, OnInit, signal } from '@angular/core';
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
  LucideKey,
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
import { AuthService } from '../../core/auth/auth.service';
import { AuthApi, PublicRoleResponse } from '../../core/api/auth.api';

type AuthMode = 'welcome' | 'login' | 'register' | 'forgot';

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
    LucideKey,
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
export class WelcomeAuth implements OnInit {
  protected readonly store = inject(AppStore);
  protected readonly auth = inject(AuthService);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<AuthMode>(this.route.snapshot.data['mode'] ?? 'welcome');

  ngOnInit(): void {
    if (this.mode() === 'register') {
      this.loadPublicRoles();
    }
  }

  // Login fields
  protected readonly showPassword = signal(false);
  protected readonly tenant = signal('plastyfreddy');
  protected readonly username = signal('');
  protected readonly password = signal('');

  // Register fields
  protected readonly regUsername = signal('');
  protected readonly regPassword = signal('');
  protected readonly regFirstName = signal('');
  protected readonly regLastName = signal('');
  protected readonly regEmail = signal('');
  protected readonly regPhone = signal('');
  protected readonly regDocId = signal('');
  protected readonly regDateOfBirth = signal('');
  protected readonly regPositionName = signal('');
  protected readonly regRoleId = signal('');
  protected readonly regShowPassword = signal(false);
  protected readonly agreeTerms = signal(false);

  // Forgot password fields
  protected readonly forgotStep = signal<'email' | 'code' | 'success'>('email');
  protected readonly recoveryEmail = signal('freddy@plastyfreddy.com');
  protected readonly verificationCode = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmNewPassword = signal('');
  protected readonly showNewPassword = signal(false);
  protected readonly forgotError = signal('');

  // Available roles from backend
  protected readonly availableRoles = signal<PublicRoleResponse[]>([]);
  protected readonly roleOptions = signal<{ value: string; label: string }[]>([]);

  protected openForgotPassword(): void {
    this.forgotStep.set('email');
    this.verificationCode.set('');
    this.newPassword.set('');
    this.confirmNewPassword.set('');
    this.forgotError.set('');
    this.setMode('forgot');
  }

  protected handleSendRecoveryCode(): void {
    if (!this.recoveryEmail().trim()) return;
    this.forgotError.set('');
    this.forgotStep.set('code');
  }

  protected handleResetPassword(): void {
    if (this.verificationCode().trim().length < 4) {
      this.forgotError.set('Please enter a valid verification code.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.forgotError.set('Password must be at least 6 characters.');
      return;
    }
    if (this.newPassword() !== this.confirmNewPassword()) {
      this.forgotError.set('Passwords do not match.');
      return;
    }
    this.forgotError.set('');
    this.forgotStep.set('success');
  }

  protected setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.auth.loginError.set(null);
    void this.router.navigate([`/${mode}`], { replaceUrl: true });

    if (mode === 'register' && this.availableRoles().length === 0) {
      this.loadPublicRoles();
    }
  }

  private loadPublicRoles(): void {
    const tenantCode = this.tenant().trim();
    if (!tenantCode) return;
    this.authApi.publicRoles(tenantCode).subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
        this.roleOptions.set(
          roles.map((r) => ({ value: String(r.id), label: r.name })),
        );
        if (roles.length > 0 && !this.regRoleId()) {
          this.regRoleId.set(String(roles[0].id));
        }
      },
    });
  }

  protected async onAuthenticate(): Promise<void> {
    const ok = await this.auth.login(
      this.tenant().trim(),
      this.username().trim(),
      this.password(),
    );
    if (ok) {
      void this.router.navigate(['/dashboard']);
    }
  }

  protected async onRegister(): Promise<void> {
    if (!this.agreeTerms()) return;

    const fullName = `${this.regFirstName().trim()} ${this.regLastName().trim()}`.trim();
    const ok = await this.auth.register({
      tenant: this.tenant().trim(),
      username: this.regUsername().trim(),
      email: this.regEmail().trim(),
      password: this.regPassword(),
      fullName,
      docId: this.regDocId().trim() || undefined,
      dateOfBirth: this.regDateOfBirth() || undefined,
      phone: this.regPhone().trim() || undefined,
      positionName: this.regPositionName().trim() || undefined,
      roleId: Number(this.regRoleId()),
    });
    if (ok) {
      void this.router.navigate(['/dashboard']);
    }
  }
}
