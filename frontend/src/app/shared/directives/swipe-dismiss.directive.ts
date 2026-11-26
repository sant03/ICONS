import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';

export type SwipeDirection = 'down' | 'left' | 'right';

/**
 * Directive that detects mobile swipe gestures to dismiss drawers or sidebars.
 *
 * - 'down': For bottom drawers (e.g., detail panels, bottom sheets).
 *           Only activates when internal scrollable content is at scrollTop <= 0.
 * - 'left': For left sidebars (e.g., navigation menu).
 * - 'right': For right sidebars (e.g., notifications drawer).
 */
@Directive({
  selector: '[appSwipeDismiss]',
  standalone: true,
})
export class SwipeDismissDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Direction to swipe for dismiss */
  readonly direction = input<SwipeDirection>('down');

  /** Minimum distance in px required to trigger dismiss */
  readonly dismissThreshold = input<number, unknown>(60, { transform: numberAttribute });

  /** Only activate on screens < 1024px (mobile / tablet) */
  readonly onlyMobile = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether the gesture detection is active */
  readonly enabled = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Emitted when swipe gesture meets threshold or velocity */
  readonly dismiss = output<void>();

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private isTracking = false;
  private isGestureDetermined = false;
  private isDismissing = false;
  private canStartDown = false;
  private hasAppliedTransform = false;

  private readonly onTouchStartBound = (e: TouchEvent) => this.handleTouchStart(e);
  private readonly onTouchMoveBound = (e: TouchEvent) => this.handleTouchMove(e);
  private readonly onTouchEndBound = (e: TouchEvent) => this.handleTouchEnd(e);
  private readonly onTouchCancelBound = () => this.handleTouchCancel();

  ngOnInit(): void {
    const target = this.el.nativeElement;
    target.addEventListener('touchstart', this.onTouchStartBound, { passive: true });
    target.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
    target.addEventListener('touchend', this.onTouchEndBound, { passive: true });
    target.addEventListener('touchcancel', this.onTouchCancelBound, { passive: true });
  }

  ngOnDestroy(): void {
    const target = this.el.nativeElement;
    target.removeEventListener('touchstart', this.onTouchStartBound);
    target.removeEventListener('touchmove', this.onTouchMoveBound);
    target.removeEventListener('touchend', this.onTouchEndBound);
    target.removeEventListener('touchcancel', this.onTouchCancelBound);
    this.resetStyles();
  }

  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled()) return;
    if (this.onlyMobile() && typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    if (e.touches.length !== 1) return;

    const targetEl = e.target as HTMLElement | null;
    // Don't intercept inputs, textareas, sliders, canvas, interactive controls, or marked elements
    if (targetEl && targetEl.closest('input, textarea, select, canvas, [data-no-swipe], .touch-none')) {
      return;
    }

    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isTracking = true;
    this.isGestureDetermined = false;
    this.isDismissing = false;
    this.hasAppliedTransform = false;

    // For down direction: ensure scroll is at the top
    this.canStartDown = this.checkCanStartDown(targetEl);
  }

  private checkCanStartDown(target: HTMLElement | null): boolean {
    const host = this.el.nativeElement;
    let curr = target;

    while (curr && curr !== host && curr !== document.body) {
      const style = window.getComputedStyle(curr);
      const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
      if (isScrollable && curr.scrollTop > 3) {
        return false;
      }
      curr = curr.parentElement;
    }

    if (host.scrollTop > 3) {
      return false;
    }

    return true;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.isTracking || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!this.isGestureDetermined) {
      if (absX < 8 && absY < 8) return;

      this.isGestureDetermined = true;
      const dir = this.direction();

      if (dir === 'down') {
        if (deltaY > 8 && deltaY > absX * 1.1 && this.canStartDown) {
          this.isDismissing = true;
        } else {
          this.isTracking = false;
          return;
        }
      } else if (dir === 'left') {
        if (deltaX < -8 && absX > absY * 1.1) {
          this.isDismissing = true;
        } else {
          this.isTracking = false;
          return;
        }
      } else if (dir === 'right') {
        if (deltaX > 8 && absX > absY * 1.1) {
          this.isDismissing = true;
        } else {
          this.isTracking = false;
          return;
        }
      }
    }

    if (this.isDismissing) {
      if (e.cancelable) {
        e.preventDefault();
      }

      const host = this.el.nativeElement;
      const dir = this.direction();

      if (dir === 'down') {
        const translateY = Math.max(0, deltaY);
        host.style.transform = `translateY(${translateY}px)`;
        host.style.transition = 'none';
        this.hasAppliedTransform = true;
      } else if (dir === 'left') {
        const translateX = Math.min(0, deltaX);
        host.style.transform = `translateX(${translateX}px)`;
        host.style.transition = 'none';
        this.hasAppliedTransform = true;
      } else if (dir === 'right') {
        const translateX = Math.max(0, deltaX);
        host.style.transform = `translateX(${translateX}px)`;
        host.style.transition = 'none';
        this.hasAppliedTransform = true;
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.isDismissing) {
      this.isTracking = false;
      this.resetStyles();
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const elapsed = Math.max(1, Date.now() - this.startTime);
    const threshold = this.dismissThreshold();
    const dir = this.direction();

    let shouldDismiss = false;

    if (dir === 'down') {
      const velocity = deltaY / elapsed;
      shouldDismiss = deltaY >= threshold || (deltaY > 25 && velocity > 0.35);
    } else if (dir === 'left') {
      const velocity = Math.abs(deltaX) / elapsed;
      shouldDismiss = deltaX <= -threshold || (deltaX < -25 && velocity > 0.35);
    } else if (dir === 'right') {
      const velocity = deltaX / elapsed;
      shouldDismiss = deltaX >= threshold || (deltaX > 25 && velocity > 0.35);
    }

    this.isTracking = false;
    this.isDismissing = false;

    if (shouldDismiss) {
      this.resetStyles();
      this.dismiss.emit();
    } else if (this.hasAppliedTransform) {
      const host = this.el.nativeElement;
      host.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
      host.style.transform = '';
      setTimeout(() => {
        if (!this.isDismissing) {
          host.style.transition = '';
        }
      }, 200);
      this.hasAppliedTransform = false;
    }
  }

  private handleTouchCancel(): void {
    this.isTracking = false;
    this.isDismissing = false;
    this.resetStyles();
  }

  private resetStyles(): void {
    if (this.hasAppliedTransform) {
      const host = this.el.nativeElement;
      host.style.transform = '';
      host.style.transition = '';
      this.hasAppliedTransform = false;
    }
  }
}
