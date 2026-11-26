import { Injectable, NgZone, inject, signal } from '@angular/core';
import { NotificationType } from '../models/types';
import { AppStore } from '../state/app-store';

export interface ToastItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  link?: string;
  leaving: boolean;
}

const TOAST_DURATION = 6000;
const TOAST_EXIT_MS = 400;
const MAX_TOASTS = 5;
const DEDUP_WINDOW_MS = 3000;

@Injectable({ providedIn: 'root' })
export class ToastNotificationService {
  private readonly ngZone = inject(NgZone);
  private readonly appStore = inject(AppStore);
  private readonly recentTitles = new Map<string, number>();

  readonly toasts = signal<ToastItem[]>([]);

  constructor() {
    this.listenToServiceWorker();
  }

  show(data: { title: string; body: string; type?: string; url?: string }): void {
    const now = Date.now();
    const lastShown = this.recentTitles.get(data.title);
    if (lastShown && now - lastShown < DEDUP_WINDOW_MS) return;
    this.recentTitles.set(data.title, now);

    const id = crypto.randomUUID();
    const toast: ToastItem = {
      id,
      title: data.title,
      description: data.body,
      type: (data.type as NotificationType) || 'system',
      link: data.url,
      leaving: false,
    };

    this.toasts.update((list) => [toast, ...list].slice(0, MAX_TOASTS));
    this.playSound();

    setTimeout(() => this.startDismiss(id), TOAST_DURATION);
  }

  dismiss(id: string): void {
    this.startDismiss(id);
  }

  private startDismiss(id: string): void {
    this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
    }, TOAST_EXIT_MS);
  }

  private playSound(): void {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      for (const [freq, start, dur] of [
        [587.33, 0, 0.12],
        [783.99, 0.08, 0.2],
      ] as const) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain).connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.start(now + start);
        osc.stop(now + start + dur);
      }

      setTimeout(() => ctx.close(), 600);
    } catch {
      // Audio not available
    }
  }

  private listenToServiceWorker(): void {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type !== 'PUSH_NOTIFICATION') return;

      this.ngZone.run(() => {
        const payload = event.data.payload;
        this.show({
          title: payload.title,
          body: payload.body,
          type: payload.notificationType,
          url: payload.data?.url,
        });
        this.appStore.loadNotifications();
      });
    });
  }
}
