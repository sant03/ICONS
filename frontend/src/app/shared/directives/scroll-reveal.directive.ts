import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  readonly revealThreshold = input<number>(0.15);
  readonly revealClass = input<string>('is-revealed');
  readonly once = input<boolean>(true);

  ngOnInit(): void {
    const target = this.el.nativeElement;
    target.classList.add('scroll-reveal');

    if (typeof IntersectionObserver === 'undefined') {
      target.classList.add(this.revealClass());
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            target.classList.add(this.revealClass());
            if (this.once()) {
              this.observer?.unobserve(target);
              this.observer?.disconnect();
            }
          } else if (!this.once()) {
            target.classList.remove(this.revealClass());
          }
        }
      },
      {
        threshold: this.revealThreshold(),
        rootMargin: '0px 0px -30px 0px',
      }
    );

    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
