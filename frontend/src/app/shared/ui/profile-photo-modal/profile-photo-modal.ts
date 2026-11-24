import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideBell,
  LucideCheck,
  LucideFileImage,
  LucideHistory,
  LucideImage,
  LucideLayoutGrid,
  LucideMove,
  LucideRotateCcw,
  LucideRotateCw,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideUpload,
  LucideUser,
  LucideX,
  LucideZoomIn,
} from '@lucide/angular';
import { AvatarConfig, UserProfile } from '../../../core/models/types';
import { ProfileResponse } from '../../../core/api/auth.api';

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  ringColor: 'cyan',
  filter: 'none',
};

export const FILTER_OPTIONS: {
  id: NonNullable<AvatarConfig['filter']>;
  label: string;
  css: string;
}[] = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'grayscale', label: 'B&N', css: 'grayscale(100%)' },
  { id: 'warm', label: 'Cálido', css: 'sepia(28%) saturate(125%)' },
  { id: 'cool', label: 'Frío', css: 'hue-rotate(15deg) saturate(110%)' },
  { id: 'contrast', label: 'Nítido', css: 'contrast(118%) saturate(112%)' },
];

export const RING_COLOR_OPTIONS: {
  id: AvatarConfig['ringColor'];
  cls: string;
}[] = [
  { id: 'cyan', cls: 'bg-cyan-500' },
  { id: 'emerald', cls: 'bg-emerald-500' },
  { id: 'indigo', cls: 'bg-indigo-500' },
  { id: 'none', cls: 'bg-slate-400' },
];

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format';

@Component({
  selector: 'app-profile-photo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideBell,
    LucideCheck,
    LucideFileImage,
    LucideHistory,
    LucideImage,
    LucideLayoutGrid,
    LucideMove,
    LucideRotateCcw,
    LucideRotateCw,
    LucideSlidersHorizontal,
    LucideSparkles,
    LucideUpload,
    LucideUser,
    LucideX,
    LucideZoomIn,
  ],
  templateUrl: './profile-photo-modal.html',
})
export class ProfilePhotoModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() user: UserProfile | ProfileResponse | any = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ avatarUrl: string; config: AvatarConfig }>();

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  protected readonly selectedUrl = signal<string>(DEFAULT_AVATAR_URL);
  protected readonly config = signal<AvatarConfig>({ ...DEFAULT_AVATAR_CONFIG });
  protected readonly fileName = signal<string>('Foto de perfil actual');
  protected readonly isDragging = signal(false);
  protected readonly animatingOut = signal(false);

  protected readonly filterOptions = FILTER_OPTIONS;
  protected readonly ringColorOptions = RING_COLOR_OPTIONS;

  private dragStart: { x: number; y: number; origX: number; origY: number } | null = null;

  protected readonly ringClassMap: Record<AvatarConfig['ringColor'], string> = {
    cyan: 'ring-2 ring-cyan-500',
    emerald: 'ring-2 ring-emerald-500',
    indigo: 'ring-2 ring-indigo-500',
    none: 'ring-0',
  };

  protected readonly imgStyle = computed(() => {
    const cfg = this.config();
    const filterObj = FILTER_OPTIONS.find((f) => f.id === (cfg.filter || 'none'));
    const filterCss = filterObj?.css || 'none';
    const transition = this.isDragging() ? 'none' : 'transform 120ms ease-out';
    return {
      transform: `translate(${cfg.offsetX}%, ${cfg.offsetY}%) scale(${cfg.zoom}) rotate(${cfg.rotation}deg)`,
      filter: filterCss,
      transition,
    };
  });

  protected readonly userFullName = computed(() => this.user?.fullName || 'Santiago Andrés Potes Monzón');
  protected readonly userUsername = computed(() => this.user?.username || 'sant03');
  protected readonly userPosition = computed(
    () => this.user?.positionName || this.user?.role || 'Administrador General',
  );
  protected readonly userRole = computed(() => this.user?.roleName || this.user?.role || 'Gerenciales');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.animatingOut.set(false);
      this.initializeFromUser();
    } else if (changes['user'] && this.isOpen) {
      this.initializeFromUser();
    }
  }

  private initializeFromUser(): void {
    if (this.user?.avatarUrl) {
      this.selectedUrl.set(this.user.avatarUrl);
    } else {
      this.selectedUrl.set(DEFAULT_AVATAR_URL);
    }

    if (this.user?.avatarConfig) {
      this.config.set({ ...DEFAULT_AVATAR_CONFIG, ...this.user.avatarConfig });
    } else {
      this.config.set({ ...DEFAULT_AVATAR_CONFIG });
    }
    this.fileName.set('Foto de perfil actual');
  }

  protected handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.selectedUrl.set(reader.result);
        this.config.set({ ...DEFAULT_AVATAR_CONFIG, ringColor: this.config().ringColor });
      }
    };
    reader.readAsDataURL(file);
  }

  protected handleReset(): void {
    this.config.set({ ...DEFAULT_AVATAR_CONFIG });
  }

  protected onMouseDown(e: MouseEvent): void {
    this.isDragging.set(true);
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      origX: this.config().offsetX,
      origY: this.config().offsetY,
    };
  }

  protected onMouseMove(e: MouseEvent): void {
    if (!this.isDragging() || !this.dragStart) return;
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;
    const nextX = Math.max(-50, Math.min(50, Math.round(this.dragStart.origX + dx * 0.4)));
    const nextY = Math.max(-50, Math.min(50, Math.round(this.dragStart.origY + dy * 0.4)));
    this.config.update((prev) => ({ ...prev, offsetX: nextX, offsetY: nextY }));
  }

  protected onMouseUp(): void {
    this.isDragging.set(false);
    this.dragStart = null;
  }

  protected onTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    this.isDragging.set(true);
    this.dragStart = {
      x: touch.clientX,
      y: touch.clientY,
      origX: this.config().offsetX,
      origY: this.config().offsetY,
    };
  }

  protected onTouchMove(e: TouchEvent): void {
    if (!this.isDragging() || !this.dragStart || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.dragStart.x;
    const dy = touch.clientY - this.dragStart.y;
    const nextX = Math.max(-50, Math.min(50, Math.round(this.dragStart.origX + dx * 0.4)));
    const nextY = Math.max(-50, Math.min(50, Math.round(this.dragStart.origY + dy * 0.4)));
    this.config.update((prev) => ({ ...prev, offsetX: nextX, offsetY: nextY }));
  }

  protected onTouchEnd(): void {
    this.isDragging.set(false);
    this.dragStart = null;
  }

  protected onZoomChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.config.update((prev) => ({ ...prev, zoom: val }));
  }

  protected onOffsetXChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.config.update((prev) => ({ ...prev, offsetX: val }));
  }

  protected onOffsetYChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.config.update((prev) => ({ ...prev, offsetY: val }));
  }

  protected rotate(): void {
    this.config.update((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  }

  protected setRingColor(ringColor: AvatarConfig['ringColor']): void {
    this.config.update((prev) => ({ ...prev, ringColor }));
  }

  protected setFilter(filter: NonNullable<AvatarConfig['filter']>): void {
    this.config.update((prev) => ({ ...prev, filter }));
  }

  protected close(): void {
    this.animatingOut.set(true);
    setTimeout(() => {
      this.closed.emit();
      this.animatingOut.set(false);
    }, 220);
  }

  protected save(): void {
    this.saved.emit({
      avatarUrl: this.selectedUrl(),
      config: this.config(),
    });
    this.close();
  }
}
