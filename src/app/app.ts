import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from './core/state/app-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  private readonly store = inject(AppStore);

  constructor() {
    // Toggle the `dark` class on <html>, exactly as the original `useEffect` did.
    effect(() => {
      const root = document.documentElement;
      if (this.store.theme() === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    });
  }
}
