import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomDatePickerComponent } from '../../shared/ui/custom-datepicker/custom-datepicker';
import {
  LucideBriefcase,
  LucideCalendar,
  LucideCamera,
  LucideCheckCircle2,
  LucideCreditCard,
  LucideEdit,
  LucideImage,
  LucideMail,
  LucidePhone,
  LucideShieldCheck,
  LucideUser,
} from '@lucide/angular';
import { AuthApi, ProfileResponse, UpdateProfileRequest } from '../../core/api/auth.api';
import { AvatarConfig } from '../../core/models/types';
import { ProfilePhotoModalComponent, FILTER_OPTIONS } from '../../shared/ui/profile-photo-modal/profile-photo-modal';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    CustomDatePickerComponent,
    ProfilePhotoModalComponent,
    LucideBriefcase,
    LucideCalendar,
    LucideCamera,
    LucideCheckCircle2,
    LucideCreditCard,
    LucideEdit,
    LucideImage,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideUser,
  ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly authApi = inject(AuthApi);

  protected readonly profile = signal<ProfileResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly isSaved = signal(false);
  protected readonly editing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isPhotoModalOpen = signal(false);

  protected readonly editFullName = signal('');
  protected readonly editEmail = signal('');
  protected readonly editDocId = signal('');
  protected readonly editDateOfBirth = signal('');
  protected readonly editPhone = signal('');
  protected readonly editLandline = signal('');
  protected readonly editPositionName = signal('');

  protected readonly memberSince = signal('');

  ngOnInit(): void {
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const p = await firstValueFrom(this.authApi.getProfile());
      this.profile.set(p);
      this.populateEditFields(p);
      if (p.createdAt) {
        this.memberSince.set(new Date(p.createdAt).toLocaleDateString('es-CO'));
      }
    } catch (err: any) {
      this.error.set(err?.error?.detail ?? 'Error al cargar el perfil');
    } finally {
      this.loading.set(false);
    }
  }

  private populateEditFields(p: ProfileResponse): void {
    this.editFullName.set(p.fullName ?? '');
    this.editEmail.set(p.email ?? '');
    this.editDocId.set(p.docId ?? '');
    this.editDateOfBirth.set(p.dateOfBirth ?? '');
    this.editPhone.set(p.phone ?? '');
    this.editLandline.set(p.landline ?? '');
    this.editPositionName.set(p.positionName ?? '');
  }

  protected enableEditing(): void {
    const p = this.profile();
    if (p) this.populateEditFields(p);
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    const p = this.profile();
    if (p) this.populateEditFields(p);
    this.editing.set(false);
  }

  protected async handleSubmit(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const body: UpdateProfileRequest = {
        fullName: this.editFullName().trim(),
        email: this.editEmail().trim(),
        docId: this.editDocId().trim() || undefined,
        dateOfBirth: this.editDateOfBirth() || undefined,
        phone: this.editPhone().trim() || undefined,
        landline: this.editLandline().trim() || undefined,
        positionName: this.editPositionName().trim() || undefined,
      };
      const updated = await firstValueFrom(this.authApi.updateProfile(body));
      this.profile.set(updated);
      this.editing.set(false);
      this.isSaved.set(true);
      setTimeout(() => this.isSaved.set(false), 3000);
    } catch (err: any) {
      this.error.set(err?.error?.detail ?? 'Error al actualizar el perfil');
    } finally {
      this.saving.set(false);
    }
  }

  protected openPhotoModal(): void {
    this.isPhotoModalOpen.set(true);
  }

  protected closePhotoModal(): void {
    this.isPhotoModalOpen.set(false);
  }

  protected handlePhotoSaved(event: { avatarUrl: string; config: AvatarConfig }): void {
    const current = this.profile();
    if (current) {
      this.profile.set({
        ...current,
        avatarUrl: event.avatarUrl,
        avatarConfig: event.config,
      });
    }
  }

  protected avatarTransform(cfg?: AvatarConfig): string {
    if (!cfg) return 'none';
    return `translate(${cfg.offsetX}%, ${cfg.offsetY}%) scale(${cfg.zoom}) rotate(${cfg.rotation}deg)`;
  }

  protected avatarFilter(cfg?: AvatarConfig): string {
    if (!cfg || !cfg.filter || cfg.filter === 'none') return 'none';
    const f = FILTER_OPTIONS.find((item) => item.id === cfg.filter);
    return f?.css || 'none';
  }

  protected avatarRingClass(cfg?: AvatarConfig): string {
    if (!cfg || !cfg.ringColor || cfg.ringColor === 'none') return 'ring-4 ring-cyan-500/20';
    const map: Record<AvatarConfig['ringColor'], string> = {
      cyan: 'ring-4 ring-cyan-500',
      emerald: 'ring-4 ring-emerald-500',
      indigo: 'ring-4 ring-indigo-500',
      none: 'ring-4 ring-transparent',
    };
    return map[cfg.ringColor] || 'ring-4 ring-cyan-500/20';
  }
}
