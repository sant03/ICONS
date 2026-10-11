import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowLeft,
  LucideBriefcase,
  LucideCalendar,
  LucideCamera,
  LucideCheckCircle2,
  LucideEdit,
  LucideEye,
  LucideHistory,
  LucideLock,
  LucideMail,
  LucidePhone,
  LucidePower,
  LucideShieldCheck,
  LucideTrash2,
  LucideUser,
  LucideUserX,
} from '@lucide/angular';
import { UserProfile } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    LucideArrowLeft,
    LucideEdit,
    LucideUser,
    LucideLock,
    LucideUserX,
    LucidePower,
    LucideCamera,
    LucideCalendar,
    LucidePhone,
    LucideMail,
    LucideBriefcase,
    LucideCheckCircle2,
    LucideHistory,
    LucideTrash2,
    LucideEye,
    LucideShieldCheck,
  ],
  templateUrl: './profile.html',
})
export class Profile {
  protected readonly store = inject(AppStore);

  protected readonly profile = signal<UserProfile>({ ...this.store.userProfile() });
  protected readonly isSaved = signal(false);

  protected updateProfile(patch: Partial<UserProfile>): void {
    this.profile.update((prev) => ({ ...prev, ...patch }));
  }

  protected handleSubmit(): void {
    this.store.setUserProfile(this.profile());
    this.isSaved.set(true);
    setTimeout(() => this.isSaved.set(false), 3000);
  }

  protected resetProfile(): void {
    this.profile.set({ ...this.store.userProfile() });
  }

  /** Mirrors the `alert(...)` calls of the original React component. */
  protected notify(message: string): void {
    window.alert(message);
  }

  protected toggleLock(): void {
    this.updateProfile({ status: this.profile().status === 'LOCKED' ? 'ACTIVE' : 'LOCKED' });
    this.store.setUserProfile(this.profile());
  }
}
